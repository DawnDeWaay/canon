import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

type SpotifyImage = { url: string; width?: number | null; height?: number | null };

type SpotifyArtist = { id: string; name: string };
type SpotifyAlbum = { id: string; name: string; images: SpotifyImage[] };
type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  uri: string;
  preview_url: string | null;
  explicit: boolean;
};

type SpotifyPlaylistItem = {
  added_at: string | null;
  is_local?: boolean;
  // February 2026 migration renamed `track` → `item` on playlist entries.
  // Support both so we keep working if Spotify hands back either shape.
  item?: SpotifyTrack | null;
  track?: SpotifyTrack | null;
};

type SpotifyItemsPage = {
  items: SpotifyPlaylistItem[];
  next: string | null;
  total: number;
  limit?: number;
  offset?: number;
};

type SpotifyPlaylistFull = {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[] | null;
  owner: { id: string; display_name: string | null };
  followers?: { total: number };
  // February 2026 migration renamed `tracks` → `items`. Older responses may
  // still use `tracks`; accept either. `items` is only present for playlists
  // the current user owns or collaborates on.
  items?: SpotifyItemsPage;
  tracks?: SpotifyItemsPage;
};

export type PlaylistTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  albumArt: string;
  durationMs: number;
  uri: string;
  addedAt: string | null;
  isLocal: boolean;
};

export type PlaylistDetail = {
  id: string;
  title: string;
  description: string;
  art: string;
  owner: string;
  followers: number;
  tracks: PlaylistTrack[];
};

const API_PREFIX = 'https://api.spotify.com/v1';

function normalizeTrack(item: SpotifyPlaylistItem): PlaylistTrack | null {
  // February 2026 migration: `track` was renamed to `item`. Accept both.
  const t = item.item ?? item.track;
  if (!t) return null; // Podcasts / removed tracks come back as null.
  // Local files and some odd items can have null artists/album/duration.
  // Guard every field so one bad track doesn't 500 the whole playlist.
  return {
    id: t.id ?? '',
    name: t.name ?? '',
    artists: Array.isArray(t.artists) ? t.artists.map((a) => a?.name ?? '') : [],
    album: t.album?.name ?? '',
    albumArt: t.album?.images?.[0]?.url ?? '',
    durationMs: typeof t.duration_ms === 'number' ? t.duration_ms : 0,
    uri: t.uri ?? '',
    addedAt: item.added_at,
    isLocal: item.is_local ?? false,
  };
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  }

  try {
    // 1. Playlist header + first page of tracks.
    const headRes = await spotifyFetch(`/playlists/${encodeURIComponent(id)}`);
    if (!headRes.ok) {
      // Spotify deprecated third-party access to editorial/algorithmic
      // playlists (Discover Weekly, Daily Mix, Release Radar, "This Is…",
      // etc.) on 2024-11-27 — those now 404 here even though they appear in
      // `/me/playlists`. Log the body so failures are debuggable.
      const body = await headRes.text().catch(() => '');
      console.error(`Spotify /playlists/${id} ${headRes.status}: ${body}`);
      const code =
        headRes.status === 401
          ? 'unauthorized'
          : headRes.status === 404
            ? 'not_found'
            : 'spotify_error';
      return NextResponse.json({ error: code, detail: body }, { status: headRes.status });
    }
    const head = (await headRes.json()) as SpotifyPlaylistFull;

    // February 2026 migration renamed `tracks` → `items` on the playlist
    // object. `items` is only returned for playlists the user owns or
    // collaborates on. Accept either field name so we keep working if
    // Spotify hands back either shape.
    const embeddedPage = head.items ?? head.tracks;
    const items: SpotifyPlaylistItem[] = Array.isArray(embeddedPage?.items)
      ? [...embeddedPage.items]
      : [];
    let nextUrl: string | null =
      embeddedPage?.next ??
      (items.length === 0
        ? `${API_PREFIX}/playlists/${encodeURIComponent(id)}/items?limit=100`
        : null);
    // Track the last failure so we can bubble it back to the client for
    // debugging when the tracks list ends up empty.
    let tracksError: { status: number; body: string } | null = null;
    // 2. Follow `next` until we've drained every items page.
    while (nextUrl) {
      const path = nextUrl.startsWith(API_PREFIX) ? nextUrl.slice(API_PREFIX.length) : nextUrl;
      const res = await spotifyFetch(path);
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        console.error(`Spotify items page ${res.status}: ${body}`);
        tracksError = { status: res.status, body };
        // Spotify 403s the /items endpoint for playlists the user doesn't own
        // or collaborate on. Rather than 500 the whole request, stop
        // paginating and return whatever items we've already collected.
        break;
      }
      const page = (await res.json()) as SpotifyItemsPage;
      if (Array.isArray(page?.items)) items.push(...page.items);
      nextUrl = page?.next ?? null;
    }

    const playlist: PlaylistDetail = {
      id: head.id,
      title: head.name,
      description: head.description ?? '',
      art: head.images?.[0]?.url ?? '',
      owner: head.owner?.display_name ?? head.owner?.id ?? '',
      followers: head.followers?.total ?? 0,
      tracks: items
        .map((item) => {
          try {
            return normalizeTrack(item);
          } catch (e) {
            console.error('normalizeTrack failed', e, item);
            return null;
          }
        })
        .filter((t): t is PlaylistTrack => t !== null),
    };

    return NextResponse.json({ playlist, tracksError });
  } catch (err) {
    console.error('playlist route error', err);
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    // spotifyFetch throws 'Not authenticated' when there's no valid token —
    // surface that as 401 so the client can redirect to login instead of
    // treating it as a generic server failure.
    if (message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({ error: 'server_error', message, stack }, { status: 500 });
  }
}

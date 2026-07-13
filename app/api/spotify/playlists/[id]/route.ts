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
  track: SpotifyTrack | null;
};

type SpotifyTracksPage = {
  items: SpotifyPlaylistItem[];
  next: string | null;
  total: number;
};

type SpotifyPlaylistFull = {
  id: string;
  name: string;
  description: string | null;
  images: SpotifyImage[] | null;
  owner: { id: string; display_name: string | null };
  followers?: { total: number };
  tracks: SpotifyTracksPage & { limit: number; offset: number };
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
  if (!item.track) return null; // Podcasts / removed tracks come back as null.
  const t = item.track;
  return {
    id: t.id,
    name: t.name,
    artists: t.artists.map((a) => a.name),
    album: t.album?.name ?? '',
    albumArt: t.album?.images?.[0]?.url ?? '',
    durationMs: t.duration_ms,
    uri: t.uri,
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
    if (headRes.status === 401) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    if (headRes.status === 404) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    if (!headRes.ok) {
      return NextResponse.json({ error: 'spotify_error' }, { status: headRes.status });
    }
    const head = (await headRes.json()) as SpotifyPlaylistFull;

    const items: SpotifyPlaylistItem[] = [...head.tracks.items];
    let nextUrl: string | null = head.tracks.next;

    // 2. Follow `next` until we've drained every track page.
    while (nextUrl) {
      const path = nextUrl.startsWith(API_PREFIX) ? nextUrl.slice(API_PREFIX.length) : nextUrl;
      const res = await spotifyFetch(path);
      if (!res.ok) {
        return NextResponse.json({ error: 'spotify_error' }, { status: res.status });
      }
      const page = (await res.json()) as SpotifyTracksPage;
      items.push(...page.items);
      nextUrl = page.next;
    }

    const playlist: PlaylistDetail = {
      id: head.id,
      title: head.name,
      description: head.description ?? '',
      art: head.images?.[0]?.url ?? '',
      owner: head.owner?.display_name ?? head.owner?.id ?? '',
      followers: head.followers?.total ?? 0,
      tracks: items.map(normalizeTrack).filter((t): t is PlaylistTrack => t !== null),
    };

    return NextResponse.json({ playlist });
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}

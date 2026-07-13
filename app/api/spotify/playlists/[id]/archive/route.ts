import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// POST /api/spotify/playlists/[id]/archive
// Body: `{ tracks: string[] }` — Spotify track ids (or full `spotify:track:` URIs).
//
// Creates a new private playlist named "Canon Archive" under the current
// user, populates it with the given tracks, then removes those same tracks
// from the source playlist `[id]`. Removal is best-effort — if the user
// doesn't own the source playlist, Spotify will 403 the DELETE but the
// archive playlist will still exist, and we surface the removal error in
// the response so the client can react.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: sourceId } = await ctx.params;
  if (!sourceId) {
    return NextResponse.json({ error: 'missing_id' }, { status: 400 });
  }

  let body: { tracks?: unknown };
  try {
    body = (await req.json()) as { tracks?: unknown };
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const rawTracks = Array.isArray(body.tracks) ? body.tracks : [];
  const uris = rawTracks
    .filter((t): t is string => typeof t === 'string' && t.length > 0)
    .map((t) => (t.startsWith('spotify:track:') ? t : `spotify:track:${t}`));
  if (uris.length === 0) {
    return NextResponse.json({ error: 'no_tracks' }, { status: 400 });
  }

  try {
    // 1. Who am I? Need the user id to create a playlist under the account.
    const meRes = await spotifyFetch('/me');
    if (!meRes.ok) {
      const detail = await meRes.text().catch(() => '');
      console.error(`Spotify /me ${meRes.status}: ${detail}`);
      return NextResponse.json(
        { error: meRes.status === 401 ? 'unauthorized' : 'spotify_error', detail },
        { status: meRes.status }
      );
    }
    const me = (await meRes.json()) as { id: string };

    // 2. Look up the source playlist name so the archive description can
    //    reference it. Best-effort — if this fails we still archive.
    let sourceName = '';
    try {
      const srcRes = await spotifyFetch(`/playlists/${encodeURIComponent(sourceId)}`);
      if (srcRes.ok) {
        const src = (await srcRes.json()) as { name?: string };
        sourceName = src.name ?? '';
      }
    } catch {
      // ignore
    }

    // 3. Create the archive playlist. Private so it doesn't clutter the
    //    user's public profile. Spotify does not require unique names, so
    //    a fresh playlist is created per archive action (matches user intent
    //    of "generate a new playlist"). Name is suffixed with today's date
    //    (YYYY-MM-DD, server locale) so successive archives are easy to
    //    distinguish in the user's library.
    const today = new Date().toISOString().slice(0, 10);
    const createRes = await spotifyFetch(`/users/${encodeURIComponent(me.id)}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Canon Archive ${today}`,
        description: sourceName
          ? `Tracks removed from ${sourceName} via Canon.`
          : 'Tracks removed via Canon.',
        public: false,
      }),
    });
    if (!createRes.ok) {
      const detail = await createRes.text().catch(() => '');
      console.error(`Spotify create playlist ${createRes.status}: ${detail}`);
      const code =
        createRes.status === 401
          ? 'unauthorized'
          : createRes.status === 403
            ? 'forbidden'
            : 'spotify_error';
      return NextResponse.json({ error: code, detail }, { status: createRes.status });
    }
    const archive = (await createRes.json()) as {
      id: string;
      external_urls?: { spotify?: string };
    };

    // 4. Add tracks to the new playlist. Spotify caps at 100 per request.
    //    February 2026 migration renamed `/tracks` → `/items`; body key is
    //    `uris` (unchanged).
    for (let i = 0; i < uris.length; i += 100) {
      const batch = uris.slice(i, i + 100);
      const addRes = await spotifyFetch(`/playlists/${encodeURIComponent(archive.id)}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: batch }),
      });
      if (!addRes.ok) {
        const detail = await addRes.text().catch(() => '');
        console.error(`Spotify add items ${addRes.status}: ${detail}`);
        // The archive playlist exists but is (partially) empty. Surface the
        // failure with the id so the client can point the user at it.
        return NextResponse.json(
          {
            error: 'add_failed',
            detail,
            archivePlaylistId: archive.id,
            archiveUrl: archive.external_urls?.spotify ?? null,
          },
          { status: addRes.status }
        );
      }
    }

    // 5. Remove the archived tracks from the source. Best-effort — a 403
    //    here (e.g. user doesn't own the source) shouldn't undo the archive.
    let removed = 0;
    let removeError: { status: number; detail: string } | null = null;
    for (let i = 0; i < uris.length; i += 100) {
      const batch = uris.slice(i, i + 100);
      const delRes = await spotifyFetch(`/playlists/${encodeURIComponent(sourceId)}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: batch.map((uri) => ({ uri })) }),
      });
      if (!delRes.ok) {
        const detail = await delRes.text().catch(() => '');
        console.error(`Spotify DELETE items ${delRes.status}: ${detail}`);
        removeError = { status: delRes.status, detail };
        break;
      }
      removed += batch.length;
    }

    return NextResponse.json({
      archived: uris.length,
      removed,
      archivePlaylistId: archive.id,
      archiveUrl: archive.external_urls?.spotify ?? null,
      removeError,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('Not authenticated')) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    console.error('archive route error', err);
    return NextResponse.json({ error: 'server_error', message }, { status: 500 });
  }
}

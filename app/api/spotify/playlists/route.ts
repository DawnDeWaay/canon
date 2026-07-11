import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';

type SpotifyPlaylistImage = { url: string; width?: number | null; height?: number | null };
type SpotifyPlaylist = {
  id: string;
  name: string;
  images: SpotifyPlaylistImage[] | null;
};
type SpotifyPlaylistsResponse = {
  items: SpotifyPlaylist[];
  next: string | null;
};

export type PlaylistSummary = {
  id: string;
  title: string;
  art: string;
};

export async function GET() {
  try {
    const items: SpotifyPlaylist[] = [];
    let url = '/me/playlists?limit=50';

    // Paginate — /me/playlists caps at 50 per page.
    while (url) {
      const res = await spotifyFetch(url);
      if (res.status === 401) {
        return NextResponse.json({ playlists: [], error: 'unauthorized' }, { status: 401 });
      }
      if (!res.ok) {
        return NextResponse.json({ error: 'spotify_error' }, { status: res.status });
      }
      const data = (await res.json()) as SpotifyPlaylistsResponse;
      items.push(...data.items);
      if (!data.next) break;
      // `data.next` is a full URL — strip the API prefix for spotifyFetch.
      url = data.next.replace('https://api.spotify.com/v1', '');
    }

    const playlists: PlaylistSummary[] = items.map((p) => ({
      id: p.id,
      title: p.name,
      art: p.images?.[0]?.url ?? '',
    }));

    return NextResponse.json({ playlists });
  } catch {
    return NextResponse.json({ playlists: [], error: 'unauthorized' }, { status: 401 });
  }
}

'use client';

import { useQuery } from '@tanstack/react-query';
import type { PlaylistDetail } from '@/app/api/spotify/playlists/[id]/route';

async function fetchPlaylist(id: string): Promise<PlaylistDetail> {
  const res = await fetch(`/api/spotify/playlists/${encodeURIComponent(id)}`, {
    credentials: 'include',
  });
  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    throw new Error(`Failed to load playlist: ${res.status}`);
  }
  const data = (await res.json()) as { playlist: PlaylistDetail };
  return data.playlist;
}

export function usePlaylist(id: string | undefined) {
  return useQuery({
    queryKey: ['spotify', 'playlist', id],
    queryFn: () => fetchPlaylist(id as string),
    enabled: Boolean(id),
  });
}

'use client';

import { useQuery } from '@tanstack/react-query';
import type { PlaylistSummary } from '@/app/api/spotify/playlists/route';

async function fetchPlaylists(): Promise<PlaylistSummary[]> {
  const res = await fetch('/api/spotify/playlists', { credentials: 'include' });
  if (res.status === 401) {
    throw new Error('unauthorized');
  }
  if (!res.ok) {
    throw new Error(`Failed to load playlists: ${res.status}`);
  }
  const data = (await res.json()) as { playlists: PlaylistSummary[] };
  return data.playlists;
}

export function usePlaylists(enabled = true) {
  return useQuery({
    queryKey: ['spotify', 'playlists'],
    queryFn: fetchPlaylists,
    enabled,
  });
}

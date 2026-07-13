'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

async function removeTracks(playlistId: string, trackIds: string[]): Promise<number> {
  const res = await fetch(`/api/spotify/playlists/${encodeURIComponent(playlistId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tracks: trackIds }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Remove failed (${res.status}): ${detail}`);
  }
  const data = (await res.json()) as { removed: number };
  return data.removed;
}

export function useRemoveTracks(playlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trackIds: string[]) => removeTracks(playlistId, trackIds),
    onSuccess: () => {
      // Invalidate the cached playlist detail + summary list so a refetch
      // reflects the newly-shorter track list.
      qc.invalidateQueries({ queryKey: ['spotify', 'playlist', playlistId] });
      qc.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
    },
  });
}

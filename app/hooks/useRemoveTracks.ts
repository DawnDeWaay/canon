'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export class RemoveTracksError extends Error {
  status: number;
  code: string;
  detail: string;
  constructor(status: number, code: string, detail: string) {
    super(`Remove failed (${status}): ${code}`);
    this.name = 'RemoveTracksError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

async function removeTracks(playlistId: string, trackIds: string[]): Promise<number> {
  const res = await fetch(`/api/spotify/playlists/${encodeURIComponent(playlistId)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tracks: trackIds }),
  });
  if (!res.ok) {
    let code = 'unknown';
    let detail = '';
    try {
      const body = (await res.json()) as { error?: string; detail?: string };
      code = body.error ?? 'unknown';
      detail = body.detail ?? '';
    } catch {
      // Non-JSON response — nothing more to surface.
    }
    throw new RemoveTracksError(res.status, code, detail);
  }
  const data = (await res.json()) as { removed: number };
  return data.removed;
}

export function useRemoveTracks(playlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trackIds: string[]) => removeTracks(playlistId, trackIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spotify', 'playlist', playlistId] });
      qc.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
    },
  });
}

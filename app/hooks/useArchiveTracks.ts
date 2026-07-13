'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export class ArchiveTracksError extends Error {
  status: number;
  code: string;
  detail: string;
  constructor(status: number, code: string, detail: string) {
    super(`Archive failed (${status}): ${code}`);
    this.name = 'ArchiveTracksError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export type ArchiveResult = {
  archived: number;
  removed: number;
  archivePlaylistId: string;
  archiveUrl: string | null;
  // Populated when the source-playlist DELETE step failed (e.g. because the
  // user doesn't own the source). The archive playlist still exists.
  removeError: { status: number; detail: string } | null;
};

async function archiveTracks(playlistId: string, trackIds: string[]): Promise<ArchiveResult> {
  const res = await fetch(
    `/api/spotify/playlists/${encodeURIComponent(playlistId)}/archive`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tracks: trackIds }),
    }
  );
  if (!res.ok) {
    let code = 'unknown';
    let detail = '';
    try {
      const body = (await res.json()) as { error?: string; detail?: string };
      code = body.error ?? 'unknown';
      detail = body.detail ?? '';
    } catch {
      // Non-JSON — nothing more to surface.
    }
    throw new ArchiveTracksError(res.status, code, detail);
  }
  return (await res.json()) as ArchiveResult;
}

export function useArchiveTracks(playlistId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (trackIds: string[]) => archiveTracks(playlistId, trackIds),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['spotify', 'playlist', playlistId] });
      qc.invalidateQueries({ queryKey: ['spotify', 'playlists'] });
    },
  });
}

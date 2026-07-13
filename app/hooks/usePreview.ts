'use client';

import { useQuery } from '@tanstack/react-query';
import type { PlaylistTrack } from '@/app/api/spotify/playlists/[id]/route';

async function fetchPreview(params: {
  isrc: string | null;
  artist: string;
  track: string;
}): Promise<string | null> {
  const qs = new URLSearchParams();
  if (params.isrc) qs.set('isrc', params.isrc);
  if (params.artist) qs.set('artist', params.artist);
  if (params.track) qs.set('track', params.track);
  const res = await fetch(`/api/preview?${qs.toString()}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { previewUrl: string | null };
  return data.previewUrl;
}

/**
 * Resolve a 30s preview URL for a Spotify track via the iTunes Search API,
 * cached forever per track id. Returns `null` if no preview exists (Spotify's
 * `preview_url` is gone for third-party apps, and iTunes doesn't have every
 * recording).
 */
export function usePreview(track: PlaylistTrack | undefined) {
  return useQuery({
    // Key by track id so switching cards flips between cached previews
    // instantly instead of re-hitting the API.
    queryKey: ['preview', track?.id],
    queryFn: () =>
      fetchPreview({
        isrc: track?.isrc ?? null,
        artist: track?.artists[0] ?? '',
        track: track?.name ?? '',
      }),
    enabled: Boolean(track?.id) && !track?.previewUrl,
    // Preview URLs are stable indefinitely — no need to refetch.
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
}

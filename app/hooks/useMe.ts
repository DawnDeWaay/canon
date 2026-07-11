'use client';

import { useQuery } from '@tanstack/react-query';

export type SpotifyMe = {
  id: string;
  display_name?: string | null;
  email?: string | null;
  images?: { url: string }[];
};

async function fetchMe(): Promise<SpotifyMe | null> {
  const res = await fetch('/api/auth/me', { credentials: 'include' });
  if (!res.ok) return null;
  const data = (await res.json()) as { user: SpotifyMe | null };
  return data.user;
}

export function useMe() {
  return useQuery({
    queryKey: ['spotify', 'me'],
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

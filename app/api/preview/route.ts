import { NextResponse } from 'next/server';

// Since Spotify stopped returning `preview_url` for third-party apps in
// late 2024, we fall back to Apple's iTunes Search API for the 30s preview.
// Free, no auth, no key — but coverage isn't 100%, and match quality varies
// when we don't have an ISRC.

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ITunesTrack = {
  previewUrl?: string;
  trackName?: string;
  artistName?: string;
  isrc?: string;
};
type ITunesResponse = { resultCount: number; results: ITunesTrack[] };

// Cache the resolved URLs in-process. Repeated requests for the same track
// during a dev session (or within a warm serverless instance) skip the
// upstream call entirely.
const cache = new Map<string, string | null>();

async function itunesFetch(url: string): Promise<ITunesTrack[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = (await res.json()) as ITunesResponse;
  return Array.isArray(data.results) ? data.results : [];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const isrc = searchParams.get('isrc')?.trim() ?? '';
  const artist = searchParams.get('artist')?.trim() ?? '';
  const track = searchParams.get('track')?.trim() ?? '';

  const cacheKey = `${isrc}|${artist}|${track}`.toLowerCase();
  if (cache.has(cacheKey)) {
    return NextResponse.json({ previewUrl: cache.get(cacheKey) ?? null });
  }

  let previewUrl: string | null = null;

  // 1. ISRC lookup is the only way to get an exact match. Fast path.
  if (isrc) {
    const results = await itunesFetch(
      `https://itunes.apple.com/lookup?isrc=${encodeURIComponent(isrc)}&entity=song&limit=1`
    );
    previewUrl = results.find((r) => r.previewUrl)?.previewUrl ?? null;
  }

  // 2. Fall back to a text search on artist + track name. Fuzzy, but usually
  //    lands on the right recording for popular tracks.
  if (!previewUrl && (artist || track)) {
    const term = [artist, track].filter(Boolean).join(' ');
    const results = await itunesFetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=5`
    );
    previewUrl = results.find((r) => r.previewUrl)?.previewUrl ?? null;
  }

  cache.set(cacheKey, previewUrl);
  return NextResponse.json({ previewUrl });
}

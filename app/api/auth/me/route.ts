import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';

// Opt out of any static optimization / route handler cache so responses always
// reflect the current cookies. Without this, Next may serve a cached response
// even after cookies are cleared, keeping the user "signed in".
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
  Pragma: 'no-cache',
} as const;

export async function GET() {
  try {
    const res = await spotifyFetch('/me');
    if (res.status === 401) {
      return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: 'spotify_error' },
        { status: res.status, headers: NO_STORE }
      );
    }
    const user = await res.json();
    return NextResponse.json({ user }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ user: null }, { status: 200, headers: NO_STORE });
  }
}

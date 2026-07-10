import { NextResponse } from 'next/server';
import { spotifyFetch } from '@/lib/spotify';

export async function GET() {
  try {
    const res = await spotifyFetch('/me');
    if (res.status === 401) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'spotify_error' }, { status: res.status });
    }
    const user = await res.json();
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

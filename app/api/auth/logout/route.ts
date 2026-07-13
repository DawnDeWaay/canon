import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/spotify';

export async function POST() {
  await clearAuthCookies();
  // Return JSON rather than redirecting. `fetch()` from the client follows
  // redirects by default, and the previous target (`/sign-in`) doesn't exist,
  // so following the redirect landed on a 404 and could interfere with the
  // Set-Cookie headers being applied. The client handles navigation itself.
  return NextResponse.json({ ok: true });
}

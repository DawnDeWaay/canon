import { NextResponse } from 'next/server';
import { buildClearAuthCookieHeaders } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  // Return JSON rather than redirecting. `fetch()` from the client follows
  // redirects by default, and the previous target (`/sign-in`) doesn't exist,
  // so following the redirect landed on a 404 and could interfere with the
  // Set-Cookie headers being applied. The client handles navigation itself.
  const res = NextResponse.json(
    { ok: true },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
      },
    }
  );
  // Append each Set-Cookie as a separate header so multiple cookies with the
  // same name but different paths all get cleared. Using `res.cookies.set`
  // would collapse them into a single header via the response-cookie Map.
  for (const header of buildClearAuthCookieHeaders()) {
    res.headers.append('Set-Cookie', header);
  }
  return res;
}

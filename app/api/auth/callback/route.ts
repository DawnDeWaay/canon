import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE, exchangeCode, setTokenCookies } from '@/lib/spotify';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  const origin = url.origin;

  if (error) {
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(error)}`);
  }
  if (!code || !state) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const jar = await cookies();
  const expectedState = jar.get(COOKIE.state)?.value;
  const verifier = jar.get(COOKIE.verifier)?.value;
  const returnTo = jar.get(COOKIE.returnTo)?.value ?? '/';

  // Always clear one-time cookies.
  for (const name of [COOKIE.state, COOKIE.verifier, COOKIE.returnTo]) {
    jar.set(name, '', { path: '/api/auth', maxAge: 0 });
  }

  if (!expectedState || expectedState !== state) {
    return NextResponse.redirect(`${origin}/sign-in?error=state_mismatch`);
  }
  if (!verifier) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_verifier`);
  }

  try {
    const tokens = await exchangeCode(code, verifier);
    await setTokenCookies(tokens);
  } catch (e) {
    console.error('[spotify callback]', e);
    return NextResponse.redirect(`${origin}/sign-in?error=token_exchange_failed`);
  }

  // Only allow relative return paths to prevent open redirects.
  const safeReturn = returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/';
  return NextResponse.redirect(`${origin}${safeReturn}`);
}

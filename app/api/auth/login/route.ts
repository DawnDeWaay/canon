import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  COOKIE,
  generateChallenge,
  generateState,
  generateVerifier,
  getSpotifyEnv,
  SCOPES,
} from '@/lib/spotify';

const isProd = process.env.NODE_ENV === 'production';

export async function GET(request: Request) {
  const { clientId, redirectUri } = getSpotifyEnv();

  const url = new URL(request.url);
  const returnTo = url.searchParams.get('returnTo') ?? '/';

  const verifier = generateVerifier();
  const challenge = await generateChallenge(verifier);
  const state = generateState();

  const jar = await cookies();
  const oneHour = 60 * 60;
  const shortCookie = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/api/auth',
    maxAge: oneHour,
  };
  jar.set(COOKIE.verifier, verifier, shortCookie);
  jar.set(COOKIE.state, state, shortCookie);
  jar.set(COOKIE.returnTo, returnTo, shortCookie);

  const authorizeUrl = new URL('https://accounts.spotify.com/authorize');
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', SCOPES);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  authorizeUrl.searchParams.set('code_challenge', challenge);

  return NextResponse.redirect(authorizeUrl);
}

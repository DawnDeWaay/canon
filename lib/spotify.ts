import { cookies } from 'next/headers';

const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const SPOTIFY_API = 'https://api.spotify.com/v1';

export const COOKIE = {
  access: 'sp_access_token',
  refresh: 'sp_refresh_token',
  expiresAt: 'sp_expires_at',
  scope: 'sp_scope',
  verifier: 'sp_pkce_verifier',
  state: 'sp_oauth_state',
  returnTo: 'sp_return_to',
} as const;

export const SCOPES = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  // Needed so the summary screen can DELETE discarded tracks from the
  // user's playlists. Covers both public and private playlists — Spotify
  // requires the matching scope for whichever visibility the playlist has.
  'playlist-modify-private',
  'playlist-modify-public',
].join(' ');

/** OAuth env config, validated once. */
export function getSpotifyEnv() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'Missing Spotify env vars: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI'
    );
  }
  return { clientId, clientSecret, redirectUri };
}

/** Base64-url encode raw bytes. */
function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = '';
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Generate a cryptographically random PKCE verifier (43-128 chars). */
export function generateVerifier(length = 64): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes).slice(0, length);
}

/** SHA-256(verifier) → base64url = PKCE code challenge. */
export async function generateChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return base64UrlEncode(digest);
}

export function generateState(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

type TokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export async function exchangeCode(code: string, verifier: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = getSpotifyEnv();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: verifier,
  });
  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Spotify token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const { clientId, clientSecret } = getSpotifyEnv();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });
  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body,
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Spotify token refresh failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

const isProd = process.env.NODE_ENV === 'production';

export async function setTokenCookies(tokens: TokenResponse, existingRefresh?: string) {
  const jar = await cookies();
  const expiresAt = Date.now() + tokens.expires_in * 1000;

  jar.set(COOKIE.access, tokens.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expires_in,
  });
  jar.set(COOKIE.expiresAt, String(expiresAt), {
    httpOnly: false,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expires_in,
  });
  // Store granted scopes so we can debug whether the token actually has the
  // permissions we asked for.
  if (tokens.scope) {
    jar.set(COOKIE.scope, tokens.scope, {
      httpOnly: false,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: tokens.expires_in,
    });
  }

  const refresh = tokens.refresh_token ?? existingRefresh;
  if (refresh) {
    jar.set(COOKIE.refresh, refresh, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}

export async function clearAuthCookies() {
  const jar = await cookies();
  // Clear at every path we've ever written these cookies at. Cookies are keyed
  // by name+domain+path, so a stale cookie at '/api/auth' from a previous
  // version of this app would silently keep the user "signed in" via refresh
  // if not cleared here.
  const paths = ['/', '/api/auth'];
  const names = [
    COOKIE.access,
    COOKIE.refresh,
    COOKIE.expiresAt,
    COOKIE.scope,
    COOKIE.verifier,
    COOKIE.state,
    COOKIE.returnTo,
  ];
  for (const name of names) {
    for (const path of paths) {
      jar.set(name, '', {
        path,
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
      });
    }
    jar.delete(name);
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const jar = await cookies();
  const access = jar.get(COOKIE.access)?.value;
  if (access) return access;

  const refresh = jar.get(COOKIE.refresh)?.value;
  if (!refresh) return null;

  try {
    const tokens = await refreshTokens(refresh);
    await setTokenCookies(tokens, refresh);
    return tokens.access_token;
  } catch {
    await clearAuthCookies();
    return null;
  }
}

export async function spotifyFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getValidAccessToken();
  if (!token) throw new Error('Not authenticated');
  return fetch(`${SPOTIFY_API}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });
}

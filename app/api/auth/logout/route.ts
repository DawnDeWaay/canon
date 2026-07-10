import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/spotify';

export async function POST(request: Request) {
  await clearAuthCookies();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/sign-in`, { status: 303 });
}

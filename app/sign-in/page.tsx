import Link from 'next/link';
import Image from 'next/image';
import { spotifyFetch } from '@/lib/spotify';

type SpotifyUser = {
  id: string;
  display_name: string | null;
  email?: string;
  images?: { url: string }[];
};

async function getCurrentUser(): Promise<SpotifyUser | null> {
  try {
    const res = await spotifyFetch('/me');
    if (!res.ok) return null;
    return (await res.json()) as SpotifyUser;
  } catch {
    return null;
  }
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const { error, returnTo } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className='flex flex-1 flex-col items-center justify-center gap-6 px-6'>
        <div className='flex flex-col items-center gap-3'>
          {user.images?.[0]?.url ? (
            <Image
              src={user.images[0].url}
              alt=''
              width={80}
              height={80}
              unoptimized
              className='h-20 w-20 rounded-full border border-white/10'
            />
          ) : null}
          <h1 className='text-xl font-medium'>Signed in as {user.display_name ?? user.id}</h1>
          {user.email ? <p className='text-sm text-neutral-400'>{user.email}</p> : null}
        </div>
        <div className='flex gap-3'>
          <Link
            href='/'
            className='rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-neutral-200'
          >
            Continue
          </Link>
          <form action='/api/auth/logout' method='post'>
            <button
              type='submit'
              className='rounded-full border border-white/20 px-5 py-2 text-sm font-medium transition hover:bg-white/10'
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    );
  }

  const loginHref = returnTo
    ? `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
    : '/api/auth/login';

  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-8 px-6'>
      <div className='flex flex-col items-center gap-2 text-center'>
        <h1 className='text-3xl font-semibold tracking-tight'>Welcome to Canon</h1>
        <p className='text-sm text-neutral-400'>Sign in with your Spotify account to continue.</p>
      </div>

      <a
        href={loginHref}
        className='inline-flex items-center gap-3 rounded-full bg-[#1DB954] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#1ed760]'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 168 168'
          className='h-5 w-5'
          aria-hidden='true'
        >
          <path
            fill='currentColor'
            d='M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.745-83.738l.001-.004zm38.404 120.78a5.217 5.217 0 01-7.18 1.73c-19.662-12.01-44.414-14.73-73.564-8.07a5.222 5.222 0 01-6.249-3.93 5.213 5.213 0 013.926-6.25c31.9-7.291 59.263-4.15 81.337 9.34 2.46 1.51 3.24 4.72 1.73 7.18zm10.25-22.805c-1.89 3.07-5.91 4.04-8.98 2.15-22.51-13.83-56.823-17.84-83.448-9.76-3.453 1.04-7.1-.9-8.148-4.35a6.538 6.538 0 014.354-8.143c30.413-9.228 68.222-4.758 94.072 11.127 3.07 1.89 4.04 5.91 2.15 8.976v0zm.88-23.744c-26.99-16.031-71.52-17.505-97.289-9.684-4.138 1.255-8.514-1.081-9.768-5.219a7.835 7.835 0 015.221-9.771c29.581-8.98 78.756-7.245 109.83 11.202a7.823 7.823 0 012.74 10.733c-2.2 3.722-7.02 4.949-10.73 2.739z'
          />
        </svg>
        Continue with Spotify
      </a>

      {error ? (
        <p className='text-sm text-red-400'>Sign-in failed ({error}). Please try again.</p>
      ) : null}
    </div>
  );
}

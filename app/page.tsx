'use client';

import { AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import Splash from '@/app/components/Splash';
import Attribution from './components/Attribution';
import Badge from './components/Badge';
import Nameplate from './components/Nameplate';
import Playlist from './components/Playlist';
import Playlists from './components/Playlists';
import StarField from './components/StarField';
import Summary from './components/Summary';
import { useMe } from './hooks/useMe';
import { usePlaylists } from './hooks/usePlaylists';

export type Mode =
  | 'splash'
  | 'playlists'
  | { type: 'playlist'; id: string }
  | { type: 'summary'; playlistId: string; tracks: string[] };

export default function Home() {
  const [mode, setMode] = useState<Mode | null>(null);

  const { data: user, isPending: authPending } = useMe();

  useEffect(() => {
    if (authPending || mode !== null) return;
    setMode(user ? 'playlists' : 'splash');
  }, [authPending, user, mode]);

  const shouldFetch =
    mode === 'playlists' || (mode !== null && typeof mode === 'object' && mode.type === 'playlist');
  const { data: playlists, isError } = usePlaylists(shouldFetch);

  return (
    <>
      <Badge setMode={setMode} />
      {user && (
        <Nameplate
          name={user?.display_name ?? ''}
          image={user?.images?.[user?.images.length - 1]?.url ?? ''}
        />
      )}
      <div className='flex flex-col flex-1 items-center justify-center'>
        <StarField />
        <main className='min-h-screen w-full flex items-start justify-center px-4 pt-48 pb-12 select-none pointer-events-none'>
          <div className='w-150 pointer-events-auto'>
            <AnimatePresence mode='wait'>
              {mode === 'splash' && <Splash key='splash' setMode={setMode} />}
              {mode === 'playlists' && (
                <Playlists key='playlists' playlists={playlists ?? []} setMode={setMode} />
              )}
              {mode !== null && typeof mode === 'object' && mode.type === 'playlist' && (
                <Playlist key='playlist' id={mode.id} setMode={setMode} />
              )}
              {mode !== null && typeof mode === 'object' && mode.type === 'summary' && (
                <Summary key='summary' mode={mode} setMode={setMode} />
              )}
            </AnimatePresence>
            {isError && mode === 'playlists' && (
              <div className='text-red-400 text-center mt-4'>
                Couldn&apos;t load playlists. Try signing in again.
              </div>
            )}
          </div>
        </main>
      </div>
      <Attribution />
    </>
  );
}

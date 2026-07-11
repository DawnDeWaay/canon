'use client';

import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import SignIn from '@/app/components/SignIn';
import Splash from '@/app/components/Splash';
import Playlist from './components/Playlist';
import Playlists from './components/Playlists';
import StarField from './components/StarField';
import { usePlaylists } from './hooks/usePlaylists';

export type Mode = 'splash' | 'signin' | 'playlists' | { type: 'playlist'; playlist: string };

export default function Home() {
  const [mode, setMode] = useState<Mode>('splash');

  const shouldFetch =
    mode === 'playlists' || (typeof mode === 'object' && mode.type === 'playlist');
  const { data: playlists, isLoading, isError } = usePlaylists(shouldFetch);

  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
      <StarField />
      <main className='h-full w-full flex items-center justify-center p-4 select-none'>
        <div className='h-150 w-150'>
          <AnimatePresence mode='wait'>
            {mode === 'splash' && <Splash key='splash' setMode={setMode} />}
            {mode === 'signin' && <SignIn key='signin' setMode={setMode} />}
            {mode === 'playlists' && (
              <Playlists key='playlists' playlists={playlists ?? []} setMode={setMode} />
            )}
            {typeof mode === 'object' && mode.type === 'playlist' && (
              <Playlist key='playlist' playlist={mode.playlist} setMode={setMode} />
            )}
          </AnimatePresence>
          {isLoading && mode === 'playlists' && (
            <div className='text-neutral-400 text-center mt-4'>Loading playlists…</div>
          )}
          {isError && mode === 'playlists' && (
            <div className='text-red-400 text-center mt-4'>
              Couldn&apos;t load playlists. Try signing in again.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

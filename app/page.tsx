'use client';

import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import SignIn from '@/app/components/SignIn';
import Splash from '@/app/components/Splash';
import StarField from './components/StarField';

export type Mode = 'splash' | 'signin' | 'playlist';

export default function Home() {
  const [mode, setMode] = useState<Mode>('splash');

  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
      <StarField />
      <main className='h-full w-full flex items-center justify-center p-4 select-none'>
        <div className='h-150 w-150'>
          <AnimatePresence mode='wait'>
            {mode === 'splash' && <Splash key='splash' setMode={setMode} />}
            {mode === 'signin' && <SignIn key='signin' setMode={setMode} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

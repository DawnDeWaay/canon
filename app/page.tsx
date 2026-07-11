/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import { useRouter } from 'next/navigation';
import StarField from './components/StarField';
import { useColor } from './context/ColorContext';

export default function Home() {
  const router = useRouter();
  const { color: contextColor } = useColor();
  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
      <StarField />
      <main className='h-full w-full flex items-center justify-center p-4 select-none'>
        <div className='h-96 w-2xl max-w-full border-black-2 overflow-hidden select-auto'>
          <div className='bg-black/30 h-full w-full backdrop-blur-sm flex items-center justify-center flex-col gap-4'>
            hi
          </div>
        </div>
      </main>
    </div>
  );
}

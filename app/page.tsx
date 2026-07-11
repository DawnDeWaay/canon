/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
'use client';

import { useRouter } from 'next/navigation';
import Star from './components/Star';
import StarField from './components/StarField';
import { useColor } from './context/ColorContext';

export default function Home() {
  const router = useRouter();
  const { color: contextColor } = useColor();
  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
      <StarField />
      <main className='flex flex-wrap flex-row flex-start w-full max-w-3xl'></main>
    </div>
  );
}

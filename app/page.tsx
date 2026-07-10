'use client';

import { Button } from '@mui/material';
import Star from './components/Star';
import { useColor } from './context/ColorContext';

export default function Home() {
  const { color: contextColor } = useColor();
  return (
    <div className='flex flex-col flex-1 items-center justify-center'>
      <main className='flex flex-wrap flex-row flex-start w-full max-w-3xl'>
        <Star color='#00ffff' />
        <div style={{ color: contextColor, backgroundColor: contextColor }}>
          <Button color='inherit' onClick={() => console.log('Upload clicked')} size='large'>
            Sign-in
          </Button>
        </div>
      </main>
    </div>
  );
}

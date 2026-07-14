/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */

import { MusicNote } from '@mui/icons-material';
import { motion } from 'motion/react';
import type { Mode } from '../page';

const Badge = ({ setMode }: { setMode: (mode: Mode) => void }) => {
  return (
    <div className='fixed left-4 top-4 z-50'>
      <div className='w-full flex justify-center items-center'>
        <div
          className='greybg p-1 flex flex-row gap-2 items-center rounded-xl *:justify-center overflow-hidden cursor-pointer'
          onClick={() => setMode('playlists')}
        >
          <MusicNote />
          <div className='text-white font-CircularBold text-md mr-1'>Canon</div>
        </div>
      </div>
    </div>
  );
};

export default Badge;

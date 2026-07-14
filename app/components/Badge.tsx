/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */

import { MusicNote } from '@mui/icons-material';
import { motion } from 'motion/react';
import type { Mode } from '../page';

const Badge = ({ setMode }: { setMode: (mode: Mode) => void }) => {
  return (
    <div className='fixed left-4 top-4 z-50'>
      <div className='w-full flex justify-center items-center'>
        <motion.div
          className='greybg text-lg p-1 flex flex-row gap-2 items-center rounded-xl *:justify-center overflow-hidden cursor-pointer'
          onClick={() => setMode('playlists')}
          initial={false}
          animate={{ opacity: 0.9 }}
          whileHover={{ opacity: 1 }}
        >
          <MusicNote fontSize='inherit' color='inherit' />
          <div className='text-white font-CircularBold mr-1'>Canon</div>
        </motion.div>
      </div>
    </div>
  );
};

export default Badge;

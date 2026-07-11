import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from '@mui/icons-material';
import { motion } from 'motion/react';
import type { Mode } from '../page';

const Playlist = ({ playlist, setMode }: { playlist: string; setMode: (mode: Mode) => void }) => {
  return (
    <motion.div>
      <div></div>
      <motion.div
        className='p-1 flex flex-row gap-1 rounded-xl'
        initial={false}
        animate={{ opacity: 0.9, backgroundColor: '#121212' }}
      >
        <ArrowBack />
        <ArrowDownward />
        <ArrowUpward />
        <ArrowForward />
      </motion.div>
    </motion.div>
  );
};

export default Playlist;

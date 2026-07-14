import { Cancel } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';

const SongCard = ({
  name,
  art,
  artist,
  removed = false,
}: {
  name: string;
  art: string;
  artist: string[];
  removed: boolean;
}) => {
  const [rotate] = useState(() => Math.random() * 40 - 20);
  const [x] = useState(() => Math.random() * 32 - 16);
  const [y] = useState(() => Math.random() * 32 - 16);

  return (
    <motion.div
      className='greybg h-104 w-fit p-4 rounded-3xl flex flex-col items-center justify-start relative overflow-hidden'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {removed && (
        <motion.div
          className='absolute top-6 right-6 z-50 text-8xl text-[#FB2B37]'
          style={{ rotate, x, y }}
          initial={{ scale: 1.5 }}
          animate={{ scale: [1.5, 0.9, 1.05, 1] }}
          transition={{
            duration: 0.2,
            times: [0, 0.3, 0.65, 1],
            ease: 'linear',
          }}
        >
          <Cancel color='inherit' fontSize='inherit' />
        </motion.div>
      )}
      <div className='relative w-80 aspect-square rounded-xl overflow-hidden'>
        {art ? <Image src={art} alt={name ?? ''} fill className='object-cover' /> : null}
      </div>
      <div className='flex flex-col items-start justify-start w-full mb-2'>
        <div className='text-white font-CircularBold text-lg mt-4 w-full text-start'>{name}</div>
        <div className='text-gray-400 text-sm mt-1 w-full text-start'>{artist.join(', ')}</div>
      </div>
      {removed && (
        <motion.div
          className='absolute bottom-4 right-4'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Chip label='Removed' sx={{ backgroundColor: '#FB2B37', color: '#fff' }} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default SongCard;

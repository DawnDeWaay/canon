import { Cancel } from '@mui/icons-material';
import { Chip } from '@mui/material';
import { motion } from 'motion/react';
import Image from 'next/image';

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
  return (
    <motion.div
      className='greybg h-104 w-fit p-4 rounded-3xl flex flex-col items-center justify-start relative overflow-hidden'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='relative w-80 aspect-square rounded-xl overflow-hidden'>
        {art ? <Image src={art} alt={name ?? ''} fill className='object-cover' /> : null}
      </div>
      <div className='flex flex-col items-start justify-start w-full mb-2'>
        <div className='text-white font-CircularBold text-lg mt-4 w-full text-start'>{name}</div>
        <div className='text-gray-400 text-sm mt-1 w-full text-start'>{artist.join(', ')}</div>
      </div>
      {removed && (
        <div className='absolute bottom-4 right-4'>
          <Chip label='Removed' color='error' />
        </div>
      )}
    </motion.div>
  );
};

export default SongCard;

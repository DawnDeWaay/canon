import { motion } from 'motion/react';
import Image from 'next/image';

const SongCard = ({ name, art }: { name: string; art: string }) => {
  return (
    <motion.div
      className='h-96 p-4 rounded-3xl flex flex-col items-center justify-start'
      initial={false}
      animate={{ backgroundColor: '#121212' }}
    >
      <div className='rounded-xl aspect-square overflow-hidden'>
        <Image src={art} alt={name ?? ''} fill className='object-cover' />
      </div>
      <div className='text-white font-CircularBold text-lg mt-4'>{name}</div>
    </motion.div>
  );
};

export default SongCard;

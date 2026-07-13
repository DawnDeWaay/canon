import { motion } from 'motion/react';
import Image from 'next/image';

const SongCard = ({ name, art, artist }: { name: string; art: string; artist: string[] }) => {
  return (
    <motion.div
      className='h-104 w-fit p-4 rounded-3xl flex flex-col items-center justify-start'
      initial={false}
      animate={{ backgroundColor: '#121212' }}
    >
      <div className='relative w-80 aspect-square rounded-xl overflow-hidden'>
        {art ? <Image src={art} alt={name ?? ''} fill className='object-cover' /> : null}
      </div>
      <div className='flex flex-col items-start justify-start w-full mb-2'>
        <div className='text-white font-CircularBold text-lg mt-4 w-full text-start'>{name}</div>
        <div className='text-gray-400 text-sm mt-1 w-full text-start'>{artist.join(', ')}</div>
      </div>
    </motion.div>
  );
};

export default SongCard;

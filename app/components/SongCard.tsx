import { motion } from 'motion/react';
import Image from 'next/image';

const SongCard = ({ name, art }: { name: string; art: string }) => {
  return (
    <motion.div
      className='h-96 w-auto p-4 rounded-3xl flex flex-col items-center justify-start'
      initial={false}
      animate={{ backgroundColor: '#121212' }}
    >
      <div className='relative w-80 aspect-square rounded-xl overflow-hidden'>
        {art ? <Image src={art} alt={name ?? ''} fill className='object-cover' /> : null}
      </div>
      <div className='text-white font-CircularBold text-lg mt-4 w-full text-start'>{name}</div>
    </motion.div>
  );
};

export default SongCard;

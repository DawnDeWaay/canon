import { motion } from 'motion/react';
import Image from 'next/image';

const PlaylistCard = ({ title, art, index }: { title: string; art: string; index: number }) => {
  return (
    <motion.div
      className='h-16 w-full bg-[#121212]/60 rounded-md flex items-center justify-center'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { delay: 0.5 + index * 0.1, duration: 0.8 } }}
      exit={{ opacity: 0 }}
    >
      <div className='flex flex-row items-center justify-between w-full p-1 gap-2'>
        <div className='ml-2 border-white border-2 rounded-md'>
          <Image src={art} alt={title} width={24} height={24} />
        </div>
        <div className='text-white font-CircularBold text-md w-full text-start'>{title}</div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;

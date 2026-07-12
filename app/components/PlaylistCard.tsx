import { motion } from 'motion/react';
import Image from 'next/image';
import type { Mode } from '../page';

const PlaylistCard = ({
  id,
  title,
  art,
  setMode,
}: {
  id: string;
  title: string;
  art: string;
  setMode: (mode: Mode) => void;
}) => {
  return (
    <motion.div
      className='h-14 w-full rounded-lg flex items-center justify-center cursor-pointer'
      initial={false}
      animate={{ height: '3.5rem', opacity: 0.9, backgroundColor: '#121212' }}
      whileHover={{ height: '4rem' }}
      whileTap={{ height: '100vh' }}
      onClick={() => setMode({ type: 'playlist', id: id })}
    >
      <div className='flex flex-row items-center justify-between w-full p-1 gap-2'>
        <div className='relative aspect-square h-full ml-2 rounded-md overflow-hidden bg-neutral-800'>
          {art ? <Image src={art} alt={title} fill sizes='64px' className='object-cover' /> : null}
        </div>
        <div className='text-white font-CircularBold text-lg w-full text-start'>{title}</div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;

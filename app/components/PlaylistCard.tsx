import { motion } from 'motion/react';
import Image from 'next/image';
import type { Mode } from '../page';

const PlaylistCard = ({
  title,
  art,
  index,
  setMode,
}: {
  title: string;
  art: string;
  index: number;
  setMode: (mode: Mode) => void;
}) => {
  return (
    <motion.div
      className='h-14 w-full rounded-md flex items-center justify-center cursor-pointer'
      initial={false}
      animate={{ height: '3.5rem', opacity: 0.9, backgroundColor: '#121212' }}
      whileHover={{ height: '4rem' }}
      onClick={() => setMode({ type: 'playlist', playlist: title })}
    >
      <div className='flex flex-row items-center justify-between w-full p-1 gap-2'>
        <div className='aspect-square ml-2 border-white border-2 rounded-md'>
          <Image src={art} alt={title} width={10} height={10} />
        </div>
        <div className='text-white font-CircularBold text-md w-full text-start'>{title}</div>
      </div>
    </motion.div>
  );
};

export default PlaylistCard;

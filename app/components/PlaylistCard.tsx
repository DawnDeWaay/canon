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
      className='w-full rounded-lg flex items-center justify-center cursor-pointer'
      initial={false}
      animate={{ height: '4.5rem', opacity: 0.9, backgroundColor: '#121212' }}
      whileHover={{ height: '5rem' }}
      onClick={() => setMode({ type: 'playlist', id })}
    >
      <motion.div className='flex flex-row items-center justify-between w-full h-full gap-4 px-3'>
        <div className='h-12 w-12 shrink-0 relative rounded-md overflow-hidden'>
          {art ? <Image src={art} alt={title} fill className='object-cover' /> : null}
        </div>
        <div className='text-white font-CircularBold text-lg w-full text-start'>{title}</div>
      </motion.div>
    </motion.div>
  );
};

export default PlaylistCard;

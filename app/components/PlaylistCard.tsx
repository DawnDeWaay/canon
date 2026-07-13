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
      animate={{ opacity: 0.9, backgroundColor: '#121212' }}
      onClick={() => setMode({ type: 'playlist', id: id })}
    >
      <motion.div
        className='flex flex-row items-center justify-between w-full h-full gap-2'
        animate={{ padding: '0.75rem 0.75rem' }}
        whileHover={{ padding: '1rem 0.75rem' }}
      >
        <div className='relative rounded-md overflow-hidden bg-neutral-800'>
          {art ? (
            <Image src={art} alt={title} height={48} width={48} className='object-cover' />
          ) : null}
        </div>
        <div className='text-white font-CircularBold text-lg w-full text-start'>{title}</div>
      </motion.div>
    </motion.div>
  );
};

export default PlaylistCard;

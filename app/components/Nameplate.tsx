import { motion } from 'motion/react';
import Image from 'next/image';

const Nameplate = ({ name, image }: { name: string; image: string }) => {
  return (
    <motion.div className='fixed right-4 top-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className='w-full flex justify-center items-center'>
        <motion.div
          className='p-1 flex flex-row gap-1 rounded-xl'
          initial={false}
          animate={{ backgroundColor: '#121212' }}
        >
          <div className='relative aspect-square h-8 w-8 rounded-full overflow-hidden bg-neutral-800'>
            <Image src={image} alt={name} fill sizes='32px' className='object-cover' />
          </div>
          <div className='text-white font-CircularBold text-md'>{name}</div>
          <div className='text-white font-CircularBold text-md bg-red-500 px-2 py-1 rounded-lg cursor-pointer'>
            Log Out
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Nameplate;

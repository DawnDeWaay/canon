import { motion } from 'motion/react';
import Image from 'next/image';

const Nameplate = ({ name, image }: { name: string; image: string }) => {
  return (
    <motion.div>
      <div className='w-full flex justify-center items-center'>
        <motion.div
          className='p-1 flex flex-row gap-1 rounded-xl'
          initial={false}
          animate={{ opacity: 0.9, backgroundColor: '#121212' }}
        >
          <Image src={image} alt={name} fill sizes='32px' className='object-cover' />
          <div>{name}</div>
          <div className='bg-red-500'>Log Out</div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Nameplate;

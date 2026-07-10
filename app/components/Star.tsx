'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

const Star = ({ color }: { color: string }) => {
  return (
    <motion.div initial={false} animate={{ color: color }}>
      <Image src='/star.svg' alt='Star' width={64} height={64} />
    </motion.div>
  );
};

export default Star;

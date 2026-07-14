import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from '@mui/icons-material';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function DDR() {
  const [pressed, setPressed] = useState<Set<Direction>>(new Set());
  type Direction = 'left' | 'down' | 'up' | 'right';
  const arrowAnim = (dir: Direction) => ({
    color: pressed.has(dir) ? '#ffffff' : '#8a8a8a',
    scale: pressed.has(dir) ? 1.15 : 1,
  });
  const transition = { type: 'spring' as const, stiffness: 500, damping: 25 };
  return (
    <div className='fixed bottom-4 left-4 w-full flex justify-center items-center z-50'>
      <motion.div
        className='greybg p-1 flex flex-row gap-1 rounded-xl'
        initial={false}
        animate={{ opacity: 0.9 }}
      >
        <motion.span
          className='flex items-center justify-center p-1 rounded-md'
          animate={arrowAnim('left')}
          transition={transition}
        >
          <ArrowBack color='inherit' />
        </motion.span>
        <motion.span
          className='flex items-center justify-center p-1 rounded-md'
          animate={arrowAnim('down')}
          transition={transition}
        >
          <ArrowDownward color='inherit' />
        </motion.span>
        <motion.span
          className='flex items-center justify-center p-1 rounded-md'
          animate={arrowAnim('up')}
          transition={transition}
        >
          <ArrowUpward color='inherit' />
        </motion.span>
        <motion.span
          className='flex items-center justify-center p-1 rounded-md'
          animate={arrowAnim('right')}
          transition={transition}
        >
          <ArrowForward color='inherit' />
        </motion.span>
      </motion.div>
    </div>
  );
}

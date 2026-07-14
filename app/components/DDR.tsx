import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from '@mui/icons-material';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowDown: 'down',
  ArrowUp: 'up',
  ArrowRight: 'right',
  a: 'left',
  A: 'left',
  s: 'down',
  S: 'down',
  w: 'up',
  W: 'up',
  d: 'right',
  D: 'right',
};

type Direction = 'left' | 'down' | 'up' | 'right';

export default function DDR() {
  const [pressed, setPressed] = useState<Set<Direction>>(new Set());

  useEffect(() => {
    const setDir = (e: KeyboardEvent, active: boolean) => {
      const dir = KEY_TO_DIRECTION[e.key];
      if (!dir) return;
      e.preventDefault();
      setPressed((prev) => {
        const next = new Set(prev);
        if (active) next.add(dir);
        else next.delete(dir);
        return next;
      });
    };
    const handleDown = (e: KeyboardEvent) => setDir(e, true);
    const handleUp = (e: KeyboardEvent) => setDir(e, false);
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  const arrowAnim = (dir: Direction) => ({
    color: pressed.has(dir) ? '#ffffff' : '#8a8a8a',
    scale: pressed.has(dir) ? 1.15 : 1,
  });
  const transition = { type: 'spring' as const, stiffness: 500, damping: 25 };
  return (
    <motion.div
      className='greybg fixed bottom-4 left-4 p-1 flex flex-row gap-1 rounded-xl z-50'
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
  );
}

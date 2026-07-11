import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from '@mui/icons-material';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { Mode } from '../page';

type Direction = 'left' | 'down' | 'up' | 'right';

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

const Playlist = ({ playlist, setMode }: { playlist: string; setMode: (mode: Mode) => void }) => {
  const [pressed, setPressed] = useState<Set<Direction>>(new Set());

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIRECTION[e.key];
      if (!dir) return;
      e.preventDefault();
      setPressed((prev) => {
        if (prev.has(dir)) return prev;
        const next = new Set(prev);
        next.add(dir);
        return next;
      });
    };
    const handleUp = (e: KeyboardEvent) => {
      const dir = KEY_TO_DIRECTION[e.key];
      if (!dir) return;
      setPressed((prev) => {
        if (!prev.has(dir)) return prev;
        const next = new Set(prev);
        next.delete(dir);
        return next;
      });
    };
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
    <motion.div>
      <div className='w-full flex justify-center items-center'>
        <motion.div
          className='p-1 flex flex-row gap-1 rounded-xl'
          initial={false}
          animate={{ opacity: 0.9, backgroundColor: '#121212' }}
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
    </motion.div>
  );
};

export default Playlist;

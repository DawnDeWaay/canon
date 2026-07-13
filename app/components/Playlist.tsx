/** biome-ignore-all lint/suspicious/noArrayIndexKey: <dont wanna> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from '@mui/icons-material';
import { getColor } from 'colorthief';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useColor } from '../context/ColorContext';
import { usePlaylist } from '../hooks/usePlaylist';
import type { Mode } from '../page';
import SongCard from './SongCard';

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

const Playlist = ({ id, setMode }: { id: string; setMode: (mode: Mode) => void }) => {
  const [pressed, setPressed] = useState<Set<Direction>>(new Set());
  const [topIndex, setTopIndex] = useState(0);

  const { setColor } = useColor();
  const { data: playlist } = usePlaylist(id);

  useEffect(() => {
    if (pressed.has('left')) {
      setTopIndex((prev) => Math.min(prev + 1, (playlist?.tracks.length ?? 0) - 1));
    }
    if (pressed.has('right')) {
      setTopIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [pressed, playlist?.tracks.length]);

  // Extract the dominant color from the current top track's album art.
  const albumArt = playlist?.tracks[topIndex]?.albumArt;
  useEffect(() => {
    if (!albumArt) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = albumArt;
    img.onload = async () => {
      try {
        const color = await getColor(img);
        if (cancelled || !color) return;
        setColor(color.hex());
      } catch {
        setColor('#1DB954');
      }
    };
    return () => {
      cancelled = true;
    };
  }, [albumArt, setColor]);

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div
        className='font-CircularBold text-3xl font-bold w-full text-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
        exit={{ opacity: 0 }}
      >
        {playlist?.title}
      </motion.div>
      <div className='relative w-full my-6'>
        {playlist?.tracks.map((track, index) => {
          const visibleDepth = 3;
          const offset = index - topIndex;
          const clamped = Math.min(Math.max(offset, 0), visibleDepth);
          const isBuried = offset > visibleDepth;
          const isPast = offset < 0;
          return (
            <motion.div
              key={track.id ?? index}
              className='absolute inset-0'
              style={{ zIndex: playlist.tracks.length - index }}
              initial={false}
              animate={{
                y: clamped * 12,
                scale: 1 - clamped * 0.04,
                opacity: isBuried || isPast ? 0 : 1 - clamped * 0.15,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SongCard name={track.name} art={track.albumArt} artist={track.artists} />
            </motion.div>
          );
        })}
      </div>
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
      <div className='w-full flex justify-center items-center mt-2'>
        <div
          className='text-sm text-gray-500 hover:underline cursor-pointer'
          onClick={() => {
            setColor('#1DB954');
            setMode('playlists');
          }}
        >
          ← Back
        </div>
      </div>
    </motion.div>
  );
};

export default Playlist;

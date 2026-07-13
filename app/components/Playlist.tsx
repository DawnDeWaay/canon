/** biome-ignore-all lint/suspicious/noArrayIndexKey: <dont wanna> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
import {
  ArrowBack,
  ArrowDownward,
  ArrowForward,
  ArrowUpward,
  Pause,
  PlayArrow,
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { getColor, getSwatches } from 'colorthief';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useColor } from '../context/ColorContext';
import { usePlaylist } from '../hooks/usePlaylist';
import { usePreview } from '../hooks/usePreview';
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
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { setColor, color } = useColor();
  const { data: playlist } = usePlaylist(id);

  useEffect(() => {
    if (pressed.has('left')) {
      setTopIndex((prev) => Math.min(prev + 1, (playlist?.tracks.length ?? 0) - 1));
    }
    if (pressed.has('right')) {
      setTopIndex((prev) => Math.max(prev - 1, 0));
    }
  }, [pressed, playlist?.tracks.length]);

  const topTrack = playlist?.tracks[topIndex];
  const { data: itunesPreviewUrl } = usePreview(topTrack);
  const previewUrl = topTrack?.previewUrl ?? itunesPreviewUrl ?? null;
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!previewUrl) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      return;
    }
    const absoluteSrc = new URL(previewUrl, window.location.href).href;
    if (audio.src !== absoluteSrc) {
      audio.src = previewUrl;
      audio.currentTime = 0;
    }
    if (musicPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [previewUrl, musicPlaying]);

  const albumArt = playlist?.tracks[topIndex]?.albumArt;
  useEffect(() => {
    if (!albumArt) return;
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = albumArt;
    img.onload = async () => {
      try {
        const swatches = await getSwatches(img);
        if (cancelled) return;
        const preference = [
          'Vibrant',
          'LightVibrant',
          'Muted',
          'LightMuted',
          'DarkVibrant',
          'DarkMuted',
        ] as const;
        const picked = preference.map((role) => swatches[role]).find((s) => s != null);
        if (picked) {
          setColor(picked.color.hex());
          return;
        }
        const fallback = await getColor(img);
        if (cancelled || !fallback) return;
        setColor(fallback.hex());
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
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!previewUrl) return;
        setMusicPlaying((p) => !p);
        return;
      }
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
  }, [previewUrl]);

  const arrowAnim = (dir: Direction) => ({
    color: pressed.has(dir) ? '#ffffff' : '#8a8a8a',
    scale: pressed.has(dir) ? 1.15 : 1,
  });
  const transition = { type: 'spring' as const, stiffness: 500, damping: 25 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='w-full flex flex-col items-center justify-center'
    >
      {playlist?.title && (
        <motion.div
          className='font-CircularBold text-3xl font-bold w-full text-center'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {playlist?.title}
        </motion.div>
      )}
      <div className='w-full flex items-center justify-center'>
        {playlist ? (
          <div className='relative w-88 flex items-center justify-center h-104 my-6'>
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
        ) : (
          <div className='w-full h-104 flex items-center justify-center'>
            <CircularProgress size='large' />
          </div>
        )}
      </div>
      <div className='flex flex-row justify-center items-start gap-2'>
        <motion.div
          className='p-2 flex flex-row gap-1 justify-center items-center rounded-xl cursor-pointer w-25'
          initial={false}
          animate={{ opacity: 0.9, backgroundColor: '#121212' }}
        >
          Discard
          <ArrowBack color='inherit' />
        </motion.div>
        <motion.div
          className='h-16 w-16 rounded-3xl p-6 flex items-center justify-center cursor-pointer'
          initial={false}
          animate={{ backgroundColor: color, borderRadius: musicPlaying ? '16px' : '32px' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!previewUrl) return;
            setMusicPlaying((p) => !p);
          }}
        >
          {musicPlaying ? (
            <Pause color='inherit' fontSize='large' />
          ) : (
            <PlayArrow color='inherit' fontSize='large' />
          )}
        </motion.div>
        <motion.div
          className='p-2 flex flex-row justify-center items-center gap-1 rounded-xl cursor-pointer w-25'
          initial={false}
          animate={{ opacity: 0.9, backgroundColor: '#121212' }}
        >
          <ArrowForward color='inherit' />
          Keep
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
      <div className='w-full p-2 fixed bottom-0 left-0 flex items-center justify-center'>
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
      </div>
      {/* biome-ignore lint/a11y/useMediaCaption: 30s preview has no captions */}
      <audio ref={audioRef} preload='auto' onEnded={() => setMusicPlaying(false)} />
    </motion.div>
  );
};

export default Playlist;

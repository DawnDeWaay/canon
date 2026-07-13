import { DoneAll } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useColor } from '../context/ColorContext';
import { usePlaylist } from '../hooks/usePlaylist';
import { useRemoveTracks } from '../hooks/useRemoveTracks';
import type { Mode } from '../page';

type SummaryMode = Extract<Mode, { type: 'summary' }>;

const Summary = ({ mode, setMode }: { mode: SummaryMode; setMode: (mode: Mode) => void }) => {
  const { color, setColor } = useColor();
  const { data: playlist, isLoading } = usePlaylist(mode.playlistId);
  const { mutate: removeTracks, isPending, isError } = useRemoveTracks(mode.playlistId);

  // Preserve the order the user discarded them in — filter the full track
  // list by whether it's in the discarded set, keyed by id.
  const discardedSet = new Set(mode.tracks);
  const discardedTracks = (playlist?.tracks ?? []).filter((t) => discardedSet.has(t.id));

  const handleSave = () => {
    if (mode.tracks.length === 0) {
      setColor('#1DB954');
      setMode('playlists');
      return;
    }
    removeTracks(mode.tracks, {
      onSuccess: () => {
        setColor('#1DB954');
        setMode('playlists');
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='w-full flex flex-col items-center justify-center'
    >
      <motion.div
        className='font-CircularBold text-4xl font-bold text-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
        exit={{ opacity: 0 }}
      >
        Summary
      </motion.div>
      <div className='text-gray-400 text-sm mt-1 mb-4'>
        {discardedTracks.length === 0
          ? 'Nothing to remove.'
          : `Removing ${discardedTracks.length} track${discardedTracks.length === 1 ? '' : 's'} from ${playlist?.title ?? 'this playlist'}.`}
      </div>

      {isLoading ? (
        <div className='w-full flex items-center justify-center py-8 text-white'>
          <CircularProgress size='large' color='inherit' />
        </div>
      ) : (
        <div className='flex flex-col gap-2 w-full max-h-[26rem] overflow-y-auto pr-1'>
          {discardedTracks.map((track) => (
            <motion.div
              key={track.id}
              className='flex flex-row items-center gap-3 p-2 rounded-xl'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0, backgroundColor: '#121212' }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div className='relative w-12 h-12 rounded-md overflow-hidden shrink-0'>
                {track.albumArt ? (
                  <Image src={track.albumArt} alt={track.name} fill className='object-cover' />
                ) : null}
              </div>
              <div className='flex flex-col min-w-0 flex-1'>
                <div className='text-white font-CircularBold text-sm truncate'>{track.name}</div>
                <div className='text-gray-400 text-xs truncate'>{track.artists.join(', ')}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isError && (
        <div className='text-red-400 text-sm mt-3'>
          Couldn&apos;t remove tracks. Try signing out and back in.
        </div>
      )}

      <motion.button
        type='button'
        disabled={isPending}
        className='cursor-pointer text-white px-4 py-2 mt-4 rounded-xl flex items-center gap-2 text-center disabled:opacity-60 disabled:cursor-not-allowed'
        whileTap={{ scale: isPending ? 1 : 0.98 }}
        initial={false}
        animate={{
          backgroundColor: color,
          opacity: 1,
          transition: { delay: 0.3, duration: 0.8 },
        }}
        exit={{ opacity: 0 }}
        onClick={handleSave}
      >
        {isPending ? 'Removing…' : discardedTracks.length === 0 ? 'Done' : 'Remove & Finish'}
        <DoneAll color='inherit' />
      </motion.button>

      <div className='w-full flex justify-center items-center mt-2'>
        <button
          type='button'
          className='text-sm text-gray-500 hover:underline cursor-pointer'
          onClick={() => {
            setColor('#1DB954');
            setMode('playlists');
          }}
        >
          ← Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default Summary;

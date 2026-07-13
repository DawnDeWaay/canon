import { DoneAll } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useColor } from '../context/ColorContext';
import { ArchiveTracksError, useArchiveTracks } from '../hooks/useArchiveTracks';
import { useMe } from '../hooks/useMe';
import { usePlaylist } from '../hooks/usePlaylist';
import { RemoveTracksError, useRemoveTracks } from '../hooks/useRemoveTracks';
import type { Mode } from '../page';

type SummaryMode = Extract<Mode, { type: 'summary' }>;

const Summary = ({ mode, setMode }: { mode: SummaryMode; setMode: (mode: Mode) => void }) => {
  const { color, setColor } = useColor();
  const { data: playlist, isLoading } = usePlaylist(mode.playlistId);
  const { data: me } = useMe();
  const { mutate: removeTracks, isPending, isError, error } = useRemoveTracks(mode.playlistId);
  const {
    mutate: archiveTracks,
    isPending: isArchiving,
    isError: isArchiveError,
    error: archiveError,
  } = useArchiveTracks(mode.playlistId);

  // Spotify only lets you delete tracks from playlists you own (or
  // collaborate on). Playlists you merely follow — including editorial and
  // algorithmic ones — will 403 the DELETE endpoint even with the modify
  // scopes granted. Detect this up front so we can disable the action and
  // explain instead of firing a request that's guaranteed to fail.
  const isOwner = Boolean(me?.id && playlist?.ownerId && me.id === playlist.ownerId);

  const parseSpotifyDetail = (raw: string): string => {
    if (!raw) return '';
    try {
      const parsed = JSON.parse(raw) as { error?: { message?: string } };
      return parsed.error?.message ?? raw;
    } catch {
      return raw;
    }
  };
  const spotifyDetail = error instanceof RemoveTracksError ? parseSpotifyDetail(error.detail) : '';
  const archiveDetail =
    archiveError instanceof ArchiveTracksError ? parseSpotifyDetail(archiveError.detail) : '';

  const busy = isPending || isArchiving;

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

  const handleArchive = () => {
    if (mode.tracks.length === 0) {
      setColor('#1DB954');
      setMode('playlists');
      return;
    }
    archiveTracks(mode.tracks, {
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

      {!isLoading && playlist && !isOwner && discardedTracks.length > 0 ? (
        <div className='w-full max-w-md mb-4 rounded-xl bg-yellow-950/40 border border-yellow-700/50 text-yellow-200 text-sm p-3'>
          You don&apos;t own <span className='font-CircularBold'>{playlist.title}</span>
          {playlist.owner ? ` (owned by ${playlist.owner})` : ''}. Spotify only lets you remove
          tracks from playlists you own or collaborate on — archive to a new playlist instead.
        </div>
      ) : null}

      {isError && error instanceof RemoveTracksError ? (
        <div className='w-full max-w-md mb-4 rounded-xl bg-red-950/40 border border-red-700/50 text-red-200 text-sm p-3'>
          <span className='font-CircularBold'>Spotify rejected the delete ({error.status}).</span>
          {spotifyDetail ? <div className='mt-1 opacity-80'>{spotifyDetail}</div> : null}
        </div>
      ) : null}

      {isArchiveError && archiveError instanceof ArchiveTracksError ? (
        <div className='w-full max-w-md mb-4 rounded-xl bg-red-950/40 border border-red-700/50 text-red-200 text-sm p-3'>
          <span className='font-CircularBold'>Archive failed ({archiveError.status}).</span>
          {archiveDetail ? <div className='mt-1 opacity-80'>{archiveDetail}</div> : null}
        </div>
      ) : null}

      {isLoading ? (
        <div className='w-full flex items-center justify-center py-8 text-white'>
          <CircularProgress size='large' color='inherit' />
        </div>
      ) : (
        <div className='flex flex-col gap-2 w-full max-h-104 overflow-y-auto pr-1'>
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
      <div className='flex flex-row gap-2 justify-center'>
        <motion.button
          type='button'
          disabled={busy || (discardedTracks.length > 0 && !isOwner)}
          className='cursor-pointer text-white px-4 py-2 mt-4 rounded-xl flex items-center gap-2 text-center disabled:opacity-60 disabled:cursor-not-allowed'
          whileTap={{ scale: busy ? 1 : 0.98 }}
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
        <motion.button
          type='button'
          disabled={busy}
          className='cursor-pointer text-white px-4 py-2 mt-4 rounded-xl flex items-center gap-2 text-center disabled:opacity-60 disabled:cursor-not-allowed'
          whileTap={{ scale: busy ? 1 : 0.98 }}
          initial={false}
          animate={{
            backgroundColor: color,
            opacity: 1,
            transition: { delay: 0.3, duration: 0.8 },
          }}
          exit={{ opacity: 0 }}
          onClick={handleArchive}
        >
          {isArchiving
            ? 'Archiving…'
            : discardedTracks.length === 0
              ? 'Done'
              : 'Remove & Archive to New Playlist'}
          <DoneAll color='inherit' />
        </motion.button>
      </div>

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

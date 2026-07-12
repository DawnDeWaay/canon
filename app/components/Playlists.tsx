/** biome-ignore-all lint/suspicious/noArrayIndexKey: <dont wanna> */
import { motion } from 'motion/react';
import type { Mode } from '../page';
import PlaylistCard from './PlaylistCard';

const Playlists = ({
  playlists,
  setMode,
}: {
  playlists: { id: string; title: string; art: string }[];
  setMode: (mode: Mode) => void;
}) => {
  return (
    <motion.div className='w-full flex flex-col items-start justify-center gap-4 text-center'>
      <motion.div
        className='font-CircularBold text-3xl font-bold w-full text-center'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.8 } }}
        exit={{ opacity: 0 }}
      >
        Select a Playlist
      </motion.div>
      <div className='flex flex-col gap-1 w-full rounded-2xl overflow-hidden'>
        {playlists?.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: index * 0.1, duration: 0.8 } }}
            exit={{ opacity: 0 }}
          >
            <PlaylistCard
              id={playlist.id}
              title={playlist.title}
              art={playlist.art}
              setMode={setMode}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Playlists;

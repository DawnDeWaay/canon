/** biome-ignore-all lint/suspicious/noArrayIndexKey: <dont wanna> */
import { motion } from 'motion/react';
import PlaylistCard from './PlaylistCard';

const Playlists = ({ playlists }: { playlists: { title: string; art: string }[] }) => {
  return (
    <motion.div className='h-full w-full flex flex-col items-center justify-center gap-4'>
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
          <PlaylistCard key={index} title={playlist.title} art={playlist.art} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default Playlists;

import { motion } from 'motion/react';

const SongCard = () => {
  return (
    <motion.div
      className='h-96'
      initial={false}
      animate={{ opacity: 0.9, backgroundColor: '#121212' }}
    >
      Song Card
    </motion.div>
  );
};

export default SongCard;

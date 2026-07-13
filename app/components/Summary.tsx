import { motion } from 'motion/react';

const Summary = () => {
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
    </motion.div>
  );
};

export default Summary;

/** biome-ignore-all lint/suspicious/noDocumentCookie: <explanation> */
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useState } from 'react';

const Nameplate = ({ name, image }: { name: string; image: string }) => {
  const [loggingOut, setLoggingOut] = useState(false);
  const qc = useQueryClient();

  const handleLogOut = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch {}
    const clientCookieNames = ['sp_expires_at', 'sp_scope'];
    for (const name of clientCookieNames) {
      for (const path of ['/', '/api/auth']) {
        document.cookie = `${name}=; Path=${path}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }
    }
    qc.clear();
    window.location.replace(`/?_=${Date.now()}`);
  };

  return (
    <motion.div
      className='fixed right-4 top-4 z-50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className='w-full flex justify-center items-center'>
        <motion.div
          className='greybg p-1 flex flex-row gap-2 items-center justify-center overflow-hidden'
          initial={false}
          animate={{ borderRadius: '9999px 12px 12px 9999px' }}
        >
          <div className='relative aspect-square h-8 w-8 rounded-full overflow-hidden bg-neutral-800'>
            <Image src={image} alt={name} fill sizes='32px' className='object-cover' />
          </div>
          <div className='text-white font-CircularBold text-md mr-1'>{name}</div>
          <motion.button
            type='button'
            onClick={handleLogOut}
            disabled={loggingOut}
            className='text-white font-CircularBold text-md bg-red-500 px-2 py-1 rounded-l-md rounded-r-md text-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            initial={false}
            animate={{ padding: '0.25rem 0.5rem' }}
            whileHover={{ padding: '0.25rem 0.6rem' }}
          >
            Log Out
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Nameplate;

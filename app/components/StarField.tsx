/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
'use client';

import { useEffect, useState } from 'react';
import Star from './Star';

type StarFieldProps = {
  size?: number;
  gap?: number;
  isRandom?: boolean;
  color?: string;
};

const StarField = ({ size = 64, gap = 0, isRandom = true, color }: StarFieldProps) => {
  const [dims, setDims] = useState<{ cols: number; rows: number }>({ cols: 0, rows: 0 });

  useEffect(() => {
    const cell = size + gap;
    const update = () => {
      setDims({
        cols: Math.ceil(window.innerWidth / cell),
        rows: Math.ceil(window.innerHeight / cell),
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [size, gap]);

  const total = dims.cols * dims.rows;

  return (
    <div
      aria-hidden
      className='fixed inset-0 -z-10 overflow-hidden'
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${dims.cols}, ${size}px)`,
        gridAutoRows: `${size}px`,
        gap,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div style={{ transform: 'translateX(-40%)' }} key={i}>
          <Star
            key={i}
            size={size}
            isRandom={isRandom}
            color={color}
            index={Math.trunc(i / dims.cols)}
          />
        </div>
      ))}
    </div>
  );
};

export default StarField;

/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
'use client';

import { memo, type ReactNode, useEffect, useState } from 'react';
import { useColor } from '../context/ColorContext';
import Star from './Star';

type StarFieldProps = {
  size?: number;
  gap?: number;
  isRandom?: boolean;
  holeWidth?: number;
  holeHeight?: number;
  holePadding?: number;
  children?: ReactNode;
};

const StarField = ({
  size = 64,
  gap = 0,
  isRandom = true,
  holeWidth = 600,
  holeHeight = 2000,
  holePadding = 0,
  children,
}: StarFieldProps) => {
  const [viewport, setViewport] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const { color } = useColor();

  useEffect(() => {
    const update = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cell = size + gap;
  const cols = viewport.w ? Math.ceil(viewport.w / cell) : 0;
  const rows = viewport.h ? Math.ceil(viewport.h / cell) : 0;
  const total = cols * rows;

  const hasHole = holeWidth > 0 && holeHeight > 0;
  const halfW = holeWidth / 2 + holePadding;
  const halfH = holeHeight / 2 + holePadding;
  const cx = viewport.w / 2;
  const cy = viewport.h / 2;
  const holeLeft = cx - halfW;
  const holeRight = cx + halfW;
  const holeTop = cy - halfH;
  const holeBottom = cy + halfH;

  return (
    <>
      <div
        aria-hidden
        className='fixed inset-0 overflow-hidden pointer-events-none'
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${size}px)`,
          gridAutoRows: `${size}px`,
          gap,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const col = i % cols;
          const row = Math.trunc(i / cols);

          if (hasHole) {
            // Star's inner div is translated by -40% on X, so its bbox shifts left by 0.4*size.
            const cellX = col * cell;
            const cellY = row * cell;
            const starLeft = cellX - 0.4 * size;
            const starRight = starLeft + size;
            const starTop = cellY;
            const starBottom = starTop + size;

            const intersects =
              starRight > holeLeft &&
              starLeft < holeRight &&
              starBottom > holeTop &&
              starTop < holeBottom;

            if (intersects) {
              // Keep the grid cell to preserve layout, but render nothing.
              return <div key={i} />;
            }
          }

          return (
            <div style={{ transform: 'translateX(-40%)', pointerEvents: 'auto' }} key={i}>
              <Star size={size} isRandom={isRandom} color={color} index={row} />
            </div>
          );
        })}
      </div>
      {hasHole && children && (
        <div
          className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          style={{ width: holeWidth, height: holeHeight }}
        >
          {children}
        </div>
      )}
    </>
  );
};

export default memo(StarField);

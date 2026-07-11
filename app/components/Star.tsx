'use client';

import { motion, useAnimationControls } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useColor } from '../context/ColorContext';

const FLIP_DURATION = 1.6; // seconds
const HOVER_DURATION = 0.2; // seconds
const MIN_INTERVAL_MS = 10_000;
const MAX_INTERVAL_MS = 60_000;

const Star = ({
  color,
  size = 48,
  isRandom = false,
  index = 0,
}: {
  color?: string;
  size?: number;
  isVisible?: boolean;
  isRandom?: boolean;
  index?: number;
}) => {
  const { color: contextColor } = useColor();
  const resolvedColor = color ?? contextColor;
  // Persist random values across re-renders so stars don't flicker/reshuffle
  // when the parent (e.g. Home) re-renders due to unrelated state changes.
  const chanceRef = useRef(isRandom ? Math.random() < 0.2 : true);
  const delayRef = useRef(Math.random() * 2 + index * 0.08);
  const canSpinRef = useRef(Math.random() > 0.5);
  const chance = chanceRef.current;
  const delay = delayRef.current;
  const canSpin = canSpinRef.current;
  const controls = useAnimationControls();
  const isHoveringRef = useRef(false);

  useEffect(() => {
    if (!chance) return;
    if (isHoveringRef.current) return;
    controls.set({ fill: resolvedColor });
  }, [chance, controls, resolvedColor]);

  useEffect(() => {
    if (!chance) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const loop = async () => {
      while (!cancelled && canSpin) {
        const wait = MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
        await new Promise<void>((resolve) => {
          timer = setTimeout(resolve, wait);
        });
        if (cancelled) return;
        if (isHoveringRef.current) continue;

        await controls.start({
          rotateY: 360,
          fill: [resolvedColor, '#fff', resolvedColor],
          transition: { duration: FLIP_DURATION, ease: 'easeInOut' },
        });
        if (cancelled || isHoveringRef.current) continue;
        controls.set({ rotateY: 0 });
      }
    };

    loop();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [chance, controls, resolvedColor, canSpin]);

  return (
    <div>
      {chance && (
        <motion.div
          style={{
            width: size,
            height: size,
            cursor: 'pointer',
            perspective: 800,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay } }}
          onHoverStart={() => {
            isHoveringRef.current = true;
            controls.start({
              rotateY: 180,
              fill: '#fff',
              transition: { duration: HOVER_DURATION, ease: 'easeInOut' },
            });
          }}
          onHoverEnd={() => {
            isHoveringRef.current = false;
            controls.start({
              rotateY: 0,
              fill: resolvedColor,
              transition: { duration: HOVER_DURATION, ease: 'easeInOut' },
            });
          }}
        >
          <motion.svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 2001.49 1995.08'
            width={size}
            height={size}
            role='img'
            aria-label='Star'
            initial={{ fill: resolvedColor, rotateY: 0 }}
            animate={controls}
          >
            <path d='M989.2,1995.08c-2.89-15.99-6.31-50.22-6.37-60.68-.15-27.79-5.64-54.82-10.4-81.89-9.64-54.92-23.59-108.75-42.27-161.4-36.12-101.76-86.24-195.82-151.56-281.89-38.33-50.52-80.39-97.62-127.25-140.22-57.32-52.11-119.53-97.62-186.92-136.2-61.01-34.92-124.97-63.07-191.6-84.72-38.6-12.54-78.3-22.13-118-30.79-38.32-8.37-86.78-13.82-126.13-15.69-8.37-.4-16.62-3.44-28.7-6.09,264.09-18.1,497.94-117.14,682.76-300.77C867.09,511.59,966.28,259.17,988.52,0c23.46,259.82,122.5,512.8,308,696.3,184.74,182.74,441.7,280.9,704.98,299.32-12.57,2.63-21.25,5.56-30.08,6.13-73.17,4.69-177.79,19.15-247.77,40.51-103.05,31.46-198.68,78.12-287.62,139.09-70.9,48.61-134.07,105.9-190.6,170.06-54.28,61.6-100.78,129.04-138.35,202.5-22.97,44.9-44.58,90.35-60.33,138.19-12.98,39.45-24.69,79.49-33.81,119.98-8.26,36.69-15.98,73.73-17.42,111.69-.53,13.99-3.62,51.68-6.33,71.3Z' />
          </motion.svg>
        </motion.div>
      )}
    </div>
  );
};

export default Star;

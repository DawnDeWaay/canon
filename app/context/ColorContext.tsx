'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ColorContextValue = {
  color: string;
  setColor: (color: string) => void;
};

const ColorContext = createContext<ColorContextValue | null>(null);

const buildFaviconUrl = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2001.49 1995.08"><path fill="${color}" d="M989.2,1995.08c-2.89-15.99-6.31-50.22-6.37-60.68-.15-27.79-5.64-54.82-10.4-81.89-9.64-54.92-23.59-108.75-42.27-161.4-36.12-101.76-86.24-195.82-151.56-281.89-38.33-50.52-80.39-97.62-127.25-140.22-57.32-52.11-119.53-97.62-186.92-136.2-61.01-34.92-124.97-63.07-191.6-84.72-38.6-12.54-78.3-22.13-118-30.79-38.32-8.37-86.78-13.82-126.13-15.69-8.37-.4-16.62-3.44-28.7-6.09,264.09-18.1,497.94-117.14,682.76-300.77C867.09,511.59,966.28,259.17,988.52,0c23.46,259.82,122.5,512.8,308,696.3,184.74,182.74,441.7,280.9,704.98,299.32-12.57,2.63-21.25,5.56-30.08,6.13-73.17,4.69-177.79,19.15-247.77,40.51-103.05,31.46-198.68,78.12-287.62,139.09-70.9,48.61-134.07,105.9-190.6,170.06-54.28,61.6-100.78,129.04-138.35,202.5-22.97,44.9-44.58,90.35-60.33,138.19-12.98,39.45-24.69,79.49-33.81,119.98-8.26,36.69-15.98,73.73-17.42,111.69-.53,13.99-3.62,51.68-6.33,71.3Z"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const ColorProvider = ({
  children,
  initialColor = '#1DB954',
}: {
  children: React.ReactNode;
  initialColor?: string;
}) => {
  const [color, setColorState] = useState(initialColor);

  const setColor = useCallback((next: string) => setColorState(next), []);

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = buildFaviconUrl(color);
  }, [color]);

  const value = useMemo(() => ({ color, setColor }), [color, setColor]);

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
};

export const useColor = (): ColorContextValue => {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error('useColor must be used inside <ColorProvider>');
  return ctx;
};

export const useColorOptional = (): ColorContextValue | null => useContext(ColorContext);

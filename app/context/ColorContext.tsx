'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ColorContextValue = {
  color: string;
  setColor: (color: string) => void;
};

const ColorContext = createContext<ColorContextValue | null>(null);

export const ColorProvider = ({
  children,
  initialColor = '#ddd',
}: {
  children: React.ReactNode;
  initialColor?: string;
}) => {
  const [color, setColorState] = useState(initialColor);

  const setColor = useCallback((next: string) => setColorState(next), []);

  const value = useMemo(() => ({ color, setColor }), [color, setColor]);

  return <ColorContext.Provider value={value}>{children}</ColorContext.Provider>;
};

/** Read + write the app-wide color. Throws if used outside <ColorProvider>. */
export const useColor = (): ColorContextValue => {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error('useColor must be used inside <ColorProvider>');
  return ctx;
};

/**
 * Non-throwing variant — returns `null` when no provider is mounted.
 * Useful in components that want a graceful fallback (e.g. tests, isolated stories).
 */
export const useColorOptional = (): ColorContextValue | null => useContext(ColorContext);

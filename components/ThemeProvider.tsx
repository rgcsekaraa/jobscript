'use client';

import { useEffect, useState } from 'react';

import { ReactNode } from 'react';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Determine theme: localStorage > system preference > default
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const theme = savedTheme || (systemDark ? 'business' : 'nord');

    // Apply theme and mark as loaded
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.add('theme-loaded');
    localStorage.setItem('theme', theme);

    // Mark as mounted
    setMounted(true);

    // Cleanup
    return () => {
      document.body.classList.remove('theme-loaded');
    };
  }, []);

  // Delay rendering until theme is applied
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

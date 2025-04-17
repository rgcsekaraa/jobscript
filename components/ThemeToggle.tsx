'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  // Initialize state with current theme or fallback to 'nord'
  const [theme, setTheme] = useState(() =>
    typeof window !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') || 'nord'
      : 'nord'
  );

  useEffect(() => {
    // Sync state with document's data-theme on mount and when it changes
    const syncTheme = () => {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') || 'nord';
      setTheme(currentTheme);
    };

    // Initial sync
    syncTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (!localStorage.getItem('theme')) {
        // Only update if no user-selected theme is saved
        const systemDark = mediaQuery.matches;
        const newTheme = systemDark ? 'business' : 'nord';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);

    // Observe manual changes to data-theme (e.g., from other components)
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      observer.disconnect();
    };
  }, []);

  const handleToggle = () => {
    const newTheme = theme === 'nord' ? 'business' : 'nord';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        className="theme-controller"
        checked={theme === 'business'}
        onChange={handleToggle}
        value="business"
        aria-label="Toggle between light and dark themes"
      />
      {/* Sun icon for nord (light) theme */}
      <svg
        className="swap-off fill-current w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
      </svg>
      {/* Moon icon for business (dark) theme */}
      <svg
        className="swap-on fill-current w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>
    </label>
  );
}

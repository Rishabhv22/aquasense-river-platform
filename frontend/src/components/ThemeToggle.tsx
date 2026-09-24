import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aquasense_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('aquasense_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('aquasense_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle theme"
      className="p-2 rounded-xl text-soft hover:text-deep hover:bg-sky/80 dark:hover:bg-white/10 transition-all border border-transparent hover:border-line cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-sand animate-in fade-in duration-200" />
      ) : (
        <Moon className="w-5 h-5 text-mid animate-in fade-in duration-200" />
      )}
    </button>
  );
};

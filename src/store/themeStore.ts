import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  initTheme: () => () => void; // Returns cleanup listener
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('theme') as ThemeMode) || 'system',
  resolvedTheme: 'light',
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    set({ theme, resolvedTheme: resolved });
    applyTheme(resolved);
  },
  initTheme: () => {
    const { theme } = get();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (get().theme === 'system') {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        set({ resolvedTheme: resolved });
        applyTheme(resolved);
      }
    };

    // Initial run
    const resolved = theme === 'system' ? (mediaQuery.matches ? 'dark' : 'light') : theme;
    set({ resolvedTheme: resolved });
    applyTheme(resolved);

    // Listen to changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  },
}));

function applyTheme(resolvedTheme: 'light' | 'dark') {
  const root = document.documentElement;
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
}

import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  language: 'en' | 'ur' | 'ar';
  isMenuOpen: boolean;
  toggleTheme: () => void;
  setLanguage: (lang: 'en' | 'ur' | 'ar') => void;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  language: 'en',
  isMenuOpen: false,
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return { theme: newTheme };
    }),
  setLanguage: (lang) => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' || lang === 'ur' ? 'rtl' : 'ltr';
    set({ language: lang });
  },
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  closeMenu: () => set({ isMenuOpen: false }),
}));

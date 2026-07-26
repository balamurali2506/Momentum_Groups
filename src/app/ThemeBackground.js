'use client'; // 🔥 MUST be the first line

import { useTheme } from './providers';

export default function ThemeBackground({ children }) {
  const { theme } = useTheme();

  return (
    // This div covers the whole screen and changes color based on the theme
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-[#F9F3E7] text-stone-900'
    }`}>
      {children}
    </div>
  );
}
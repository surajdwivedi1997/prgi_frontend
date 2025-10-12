import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Button } from './button';

export const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="icon"
      className="relative w-10 h-10 rounded-lg hover:bg-accent transition-all duration-300"
      aria-label="Toggle dark mode"
      title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {/* Sun Icon (Light Mode) */}
      <Sun
        className={`absolute h-5 w-5 text-yellow-500 transition-all duration-300 ${
          theme === 'dark' 
            ? 'rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />

      {/* Moon Icon (Dark Mode) */}
      <Moon
        className={`absolute h-5 w-5 text-blue-400 transition-all duration-300 ${
          theme === 'light' 
            ? '-rotate-90 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
        }`}
      />
    </Button>
  );
};
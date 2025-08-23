import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement;
    
    if (newTheme === 'dark' || (newTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', newTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    setIsOpen(false);
  };

  const getCurrentIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl shadow-glass hover:shadow-glass-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent group"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5 bg-gradient-to-r from-accent-500 to-accent-600 rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
          {getCurrentIcon()}
        </div>
        <span className="text-sm font-medium text-primary-700 group-hover:text-accent-700 transition-colors">
          {theme.charAt(0).toUpperCase() + theme.slice(1)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-glass z-50 animate-fade-in-up">
          <div className="p-2">
            {[
              { value: 'light' as Theme, label: 'Light', icon: <Sun className="w-4 h-4" /> },
              { value: 'dark' as Theme, label: 'Dark', icon: <Moon className="w-4 h-4" /> },
              { value: 'system' as Theme, label: 'System', icon: <Monitor className="w-4 h-4" /> }
            ].map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`w-full px-4 py-3 text-left rounded-xl transition-all duration-200 flex items-center justify-between group ${
                  theme === option.value 
                    ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-glow' 
                    : 'text-primary-700 hover:bg-accent-50 hover:text-accent-700'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${
                    theme === option.value ? 'bg-white/20' : 'bg-gradient-to-r from-accent-500 to-accent-600 group-hover:shadow-glow'
                  }`}>
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
                {theme === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeToggle;

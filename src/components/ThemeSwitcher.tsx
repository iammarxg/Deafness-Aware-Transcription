import React from 'react';
import { Theme } from '../types';
import { Moon, Sun } from 'lucide-react';
import { Button } from './Button';

interface ThemeSwitcherProps {
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onThemeChange }) => {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            className="rounded-full"
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-zinc-600" />
            ) : (
                <Sun className="w-5 h-5 text-zinc-400" />
            )}
        </Button>
    );
};


import React from 'react';
import { UILanguage, Theme } from '../types';
import { t } from '../services/translationService';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';


const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w.w3.org/2000/svg" className="h-10 w-10 text-indigo-500 dark:text-indigo-400" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.64-.1 2.42-.29.56-.14.9-.71.76-1.27s-.71-.9-1.27-.76A8.001 8.001 0 0112 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.03 0 3.89.77 5.33 2.06.46.41 1.19.34 1.55-.13.36-.48.28-1.2-.18-1.6C17.26 2.8 14.76 2 12 2zm8.31 4.31c.46-.46.46-1.2 0-1.66s-1.2-.46-1.66 0C17.26 6.04 16 7.89 16 10c0 .96.22 1.86.62 2.68.21.43.72.64 1.15.43s.64-.72.43-1.15A4.01 4.01 0 0118 10c0-1.54.85-2.96 2.31-4.69zM12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM6 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
    </svg>
);

interface HeaderProps {
    uiLanguage: UILanguage;
    onLanguageChange: (lang: UILanguage) => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({ uiLanguage, onLanguageChange, theme, onThemeChange }) => {
    return (
        <header className="bg-white dark:bg-slate-900/70 dark:backdrop-blur-sm shadow-sm dark:shadow-slate-800 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <BrainIcon />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100">
                            {t('header.title', uiLanguage)}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                             {t('header.subtitle', uiLanguage)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <LanguageSwitcher uiLanguage={uiLanguage} onLanguageChange={onLanguageChange} />
                    <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
                </div>
            </div>
        </header>
    );
};
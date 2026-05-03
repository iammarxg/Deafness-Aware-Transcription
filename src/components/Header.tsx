import React from 'react';
import { UILanguage, Theme } from '../types';
import { t } from '../services/translationService';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { BrainCircuit, Waves } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
    uiLanguage: UILanguage;
    onLanguageChange: (lang: UILanguage) => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
}

export const Header: React.FC<HeaderProps> = ({ uiLanguage, onLanguageChange, theme, onThemeChange }) => {
    return (
        <header className="sticky top-0 z-50 w-full glass-card border-b border-gray-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    <div className="relative">
                        <BrainCircuit className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -bottom-1 -right-1"
                        >
                            <Waves className="w-4 h-4 text-indigo-400 dark:text-indigo-500" />
                        </motion.div>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                            {t('header.title', uiLanguage)}
                        </h1>
                        <p className="text-xs font-mono uppercase tracking-widest text-gray-500 dark:text-zinc-500">
                             {t('header.subtitle', uiLanguage)}
                        </p>
                    </div>
                </motion.div>
                
                <div className="flex items-center gap-4">
                    <LanguageSwitcher uiLanguage={uiLanguage} onLanguageChange={onLanguageChange} />
                    <div className="w-[1px] h-6 bg-gray-200 dark:bg-zinc-800" />
                    <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
                </div>
            </div>
        </header>
    );
};

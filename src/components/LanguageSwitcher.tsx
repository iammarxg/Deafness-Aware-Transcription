import React from 'react';
import { UILanguage } from '../types';
import { t } from '../services/translationService';
import { Languages } from 'lucide-react';
import { Button } from './Button';

interface LanguageSwitcherProps {
    uiLanguage: UILanguage;
    onLanguageChange: (lang: UILanguage) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ uiLanguage, onLanguageChange }) => {
    return (
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <Button
                variant={uiLanguage === 'en' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onLanguageChange('en')}
                className={uiLanguage === 'en' ? "bg-white dark:bg-zinc-700 shadow-sm" : ""}
            >
                EN
            </Button>
            <Button
                variant={uiLanguage === 'ar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onLanguageChange('ar')}
                className={uiLanguage === 'ar' ? "bg-white dark:bg-zinc-700 shadow-sm font-sans" : "font-sans"}
            >
                عربي
            </Button>
        </div>
    );
};

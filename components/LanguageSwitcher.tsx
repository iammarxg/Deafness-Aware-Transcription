import React from 'react';
import { t } from '../services/translationService';
import { UILanguage } from '../types';

interface LanguageSwitcherProps {
    uiLanguage: UILanguage;
    onLanguageChange: (lang: UILanguage) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ uiLanguage, onLanguageChange }) => {
    const languages = [
        { key: 'en', label: t('languageSwitcher.en', uiLanguage) },
        { key: 'ar', label: t('languageSwitcher.ar', uiLanguage) }
    ] as const;

    return (
        <div className="flex rounded-md shadow-sm" role="group">
            {languages.map((lang, index) => (
                <button
                    key={lang.key}
                    type="button"
                    onClick={() => onLanguageChange(lang.key)}
                    className={`px-4 py-2 text-sm font-medium border border-gray-200 dark:border-slate-600 
                        ${uiLanguage === lang.key ? 'bg-indigo-600 text-white z-10' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'} 
                        ${index === 0 ? 'rounded-s-lg' : ''}
                        ${index === languages.length - 1 ? 'rounded-e-lg' : ''}
                        ${index > 0 ? '-ml-px' : ''}
                        focus:z-10 focus:ring-2 focus:ring-indigo-500`}
                >
                    {lang.label}
                </button>
            ))}
        </div>
    );
};
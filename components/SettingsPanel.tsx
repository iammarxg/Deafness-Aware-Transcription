import React from 'react';
import { Settings, NoteLanguage, UILanguage } from '../types';
import { t } from '../services/translationService';

interface SettingsPanelProps {
    settings: Settings;
    onSettingsChange: (newSettings: Settings) => void;
    disabled?: boolean;
    uiLanguage: UILanguage;
}

const Label: React.FC<{ htmlFor: string, children: React.ReactNode, className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1 ${className}`}>
        {children}
    </label>
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-200 mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled, uiLanguage }) => {
    
    const handleFieldChange = <K extends keyof Settings>(field: K, value: Settings[K]) => {
        onSettingsChange({ ...settings, [field]: value });
    };

    return (
        <div className={`bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 transition-opacity ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <fieldset disabled={disabled} className="space-y-4">

                <Section title={t('settings.accessibility.title', uiLanguage)}>
                    <label htmlFor="simplified-language" className={`flex items-start p-2 rounded-md border border-gray-200 dark:border-slate-700 cursor-pointer transition-colors ${settings.isSimplified ? 'bg-gray-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800'}`}>
                        <div className="flex items-center h-5">
                            <input
                                id="simplified-language"
                                name="simplified-language"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-200 dark:border-slate-600 rounded bg-transparent dark:focus:ring-offset-slate-800"
                                checked={settings.isSimplified}
                                onChange={(e) => handleFieldChange('isSimplified', e.target.checked)}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <span className="block font-medium text-gray-700 dark:text-slate-300">{t('settings.accessibility.simplifiedLanguage', uiLanguage)}</span>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{t('settings.accessibility.simplifiedLanguageDesc', uiLanguage)}</p>
                        </div>
                    </label>
                    <div>
                        <Label htmlFor="font-size">{t('settings.accessibility.fontSize', uiLanguage)}</Label>
                        <div className="flex items-center space-x-2 mt-1">
                            <button
                                onClick={() => handleFieldChange('fontSize', Math.max(12, settings.fontSize - 1))}
                                className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600">-</button>
                            <span className="text-sm w-8 text-center">{settings.fontSize}px</span>
                            <button
                                onClick={() => handleFieldChange('fontSize', Math.min(24, settings.fontSize + 1))}
                                className="px-2 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-md hover:bg-gray-300 dark:hover:bg-slate-600">+</button>
                        </div>
                    </div>
                </Section>
                
                <hr className="border-gray-200 dark:border-slate-700" />

                <Section title={t('settings.noteGeneration.title', uiLanguage)}>
                    <label htmlFor="auto-generate-notes" className={`flex items-start p-2 rounded-md border border-gray-200 dark:border-slate-700 cursor-pointer transition-colors ${settings.autoGenerateNotes ? 'bg-gray-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800'}`}>
                        <div className="flex items-center h-5">
                            <input
                                id="auto-generate-notes"
                                name="auto-generate-notes"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-200 dark:border-slate-600 rounded bg-transparent dark:focus:ring-offset-slate-800"
                                checked={settings.autoGenerateNotes}
                                onChange={(e) => handleFieldChange('autoGenerateNotes', e.target.checked)}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <span className="block font-medium text-gray-700 dark:text-slate-300">{t('settings.noteGeneration.autoGenerate', uiLanguage)}</span>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{t('settings.noteGeneration.autoGenerateDesc', uiLanguage)}</p>
                        </div>
                    </label>
                    <div>
                        <Label htmlFor="note-language">{t('settings.noteGeneration.outputLanguage', uiLanguage)}</Label>
                        <select
                            id="note-language"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-200 dark:border-slate-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-100 dark:bg-slate-700 dark:text-slate-200"
                            value={settings.noteLanguage}
                            onChange={(e) => handleFieldChange('noteLanguage', e.target.value as NoteLanguage)}
                        >
                            {Object.values(NoteLanguage).map(lang => (
                                <option key={lang} value={lang}>{t(`settings.noteGeneration.languageOptions.${lang}`, uiLanguage)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="custom-glossary">{t('settings.noteGeneration.customGlossary', uiLanguage)}</Label>
                        <textarea
                            id="custom-glossary"
                            rows={3}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-200 dark:border-slate-600 rounded-md p-2 bg-gray-100 dark:bg-slate-700"
                            value={settings.customGlossary}
                            placeholder={t('settings.noteGeneration.customGlossaryPlaceholder', uiLanguage)}
                            onChange={(e) => handleFieldChange('customGlossary', e.target.value)}
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{t('settings.noteGeneration.customGlossaryDesc', uiLanguage)}</p>
                    </div>
                </Section>
            </fieldset>
        </div>
    );
};
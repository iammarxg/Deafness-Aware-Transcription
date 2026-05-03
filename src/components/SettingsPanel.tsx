import React from 'react';
import { Settings, NoteLanguage, UILanguage } from '../types';
import { Panel, PanelHeader, PanelContent } from './Panel';
import { t } from '../services/translationService';
import { Settings2, Accessibility, Zap, Languages, Type, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsPanelProps {
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    disabled?: boolean;
    uiLanguage: UILanguage;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled, uiLanguage }) => {
    const handleChange = (key: keyof Settings, value: any) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    return (
        <Panel className="sticky top-24">
            <PanelHeader title={t('settings.accessibility.title', uiLanguage)} icon={<Settings2 className="w-4 h-4" />} />
            <PanelContent className="space-y-6">
                {/* Accessibility Section */}
                <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-1">
                            <input
                                type="checkbox"
                                checked={settings.isSimplified}
                                onChange={(e) => handleChange('isSimplified', e.target.checked)}
                                disabled={disabled}
                                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
                            />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {t('settings.accessibility.simplifiedLanguage', uiLanguage)}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
                                {t('settings.accessibility.simplifiedLanguageDesc', uiLanguage)}
                            </span>
                        </div>
                    </label>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Type className="w-4 h-4 text-zinc-400" />
                                {t('settings.accessibility.fontSize', uiLanguage)}
                            </label>
                            <span className="text-xs font-mono text-zinc-500">{settings.fontSize}px</span>
                        </div>
                        <input
                            type="range"
                            min="12"
                            max="32"
                            value={settings.fontSize}
                            onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                            disabled={disabled}
                            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-zinc-800"
                        />
                    </div>
                </div>

                <div className="h-[1px] bg-zinc-200 dark:bg-zinc-800" />

                {/* Note Generation Section */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                        {t('settings.noteGeneration.title', uiLanguage)}
                    </h3>
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="pt-1">
                            <input
                                type="checkbox"
                                checked={settings.autoGenerateNotes}
                                onChange={(e) => handleChange('autoGenerateNotes', e.target.checked)}
                                disabled={disabled}
                                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
                            />
                        </div>
                        <div>
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {t('settings.noteGeneration.autoGenerate', uiLanguage)}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-1">
                                {t('settings.noteGeneration.autoGenerateDesc', uiLanguage)}
                            </span>
                        </div>
                    </label>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Languages className="w-4 h-4 text-zinc-400" />
                            {t('settings.noteGeneration.outputLanguage', uiLanguage)}
                        </label>
                        <select
                            value={settings.noteLanguage}
                            onChange={(e) => handleChange('noteLanguage', e.target.value as NoteLanguage)}
                            disabled={disabled}
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value={NoteLanguage.ENGLISH}>{t('settings.noteGeneration.languageOptions.ENGLISH', uiLanguage)}</option>
                            <option value={NoteLanguage.ARABIC}>{t('settings.noteGeneration.languageOptions.ARABIC', uiLanguage)}</option>
                            <option value={NoteLanguage.BILINGUAL}>{t('settings.noteGeneration.languageOptions.BILINGUAL', uiLanguage)}</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-zinc-400" />
                            {t('settings.noteGeneration.customGlossary', uiLanguage)}
                        </label>
                        <textarea
                            value={settings.customGlossary}
                            onChange={(e) => handleChange('customGlossary', e.target.value)}
                            disabled={disabled}
                            placeholder={t('settings.noteGeneration.customGlossaryPlaceholder', uiLanguage)}
                            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg text-sm p-3 h-24 resize-none focus:ring-2 focus:ring-indigo-500 placeholder:text-zinc-400"
                        />
                        <span className="text-[10px] text-zinc-500 block uppercase tracking-wide">
                            {t('settings.noteGeneration.customGlossaryDesc', uiLanguage)}
                        </span>
                    </div>
                </div>
            </PanelContent>
        </Panel>
    );
};

import React from 'react';
import { Settings, NoteLanguage } from '../types';

interface SettingsPanelProps {
    settings: Settings;
    onSettingsChange: (newSettings: Settings) => void;
    disabled?: boolean;
}

const Label: React.FC<{ htmlFor: string, children: React.ReactNode, className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
        {children}
    </label>
);

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="py-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled }) => {
    
    const handleFieldChange = <K extends keyof Settings>(field: K, value: Settings[K]) => {
        onSettingsChange({ ...settings, [field]: value });
    };

    return (
        <div className={`bg-white p-6 rounded-xl shadow-md border border-gray-200 transition-opacity ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
            <fieldset disabled={disabled} className="space-y-4">

                <Section title="Accessibility">
                    <label htmlFor="simplified-language" className={`flex items-start p-2 rounded-md border border-gray-200 cursor-pointer transition-colors ${settings.isSimplified ? 'bg-gray-100' : 'bg-white'}`}>
                        <div className="flex items-center h-5">
                            <input
                                id="simplified-language"
                                name="simplified-language"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-200 rounded"
                                checked={settings.isSimplified}
                                onChange={(e) => handleFieldChange('isSimplified', e.target.checked)}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <span className="block font-medium text-gray-700">Simplified Language</span>
                            <p className="text-xs text-gray-500">Generate notes using simpler terms.</p>
                        </div>
                    </label>
                    <div>
                        <Label htmlFor="font-size">Adjust Font Size</Label>
                        <div className="flex items-center space-x-2 mt-1">
                            <button
                                onClick={() => handleFieldChange('fontSize', Math.max(12, settings.fontSize - 1))}
                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">-</button>
                            <span className="text-sm w-8 text-center">{settings.fontSize}px</span>
                            <button
                                onClick={() => handleFieldChange('fontSize', Math.min(24, settings.fontSize + 1))}
                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">+</button>
                        </div>
                    </div>
                </Section>
                
                <hr className="border-gray-200" />

                <Section title="Note Generation">
                    <label htmlFor="auto-generate-notes" className={`flex items-start p-2 rounded-md border border-gray-200 cursor-pointer transition-colors ${settings.autoGenerateNotes ? 'bg-gray-100' : 'bg-white'}`}>
                        <div className="flex items-center h-5">
                            <input
                                id="auto-generate-notes"
                                name="auto-generate-notes"
                                type="checkbox"
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-200 rounded"
                                checked={settings.autoGenerateNotes}
                                onChange={(e) => handleFieldChange('autoGenerateNotes', e.target.checked)}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <span className="block font-medium text-gray-700">Auto-Generate Notes</span>
                            <p className="text-xs text-gray-500">Generate notes automatically after transcription finishes.</p>
                        </div>
                    </label>
                    <div>
                        <Label htmlFor="note-language">Output Language</Label>
                        <select
                            id="note-language"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-100"
                            value={settings.noteLanguage}
                            onChange={(e) => handleFieldChange('noteLanguage', e.target.value as NoteLanguage)}
                        >
                            {Object.values(NoteLanguage).map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="custom-glossary">Custom Glossary</Label>
                        <textarea
                            id="custom-glossary"
                            rows={3}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-200 rounded-md p-2 bg-gray-100"
                            value={settings.customGlossary}
                            placeholder="e.g., Photosynthesis, Mitochondria, Quantum Mechanics"
                            onChange={(e) => handleFieldChange('customGlossary', e.target.value)}
                        />
                        <p className="mt-1 text-xs text-gray-500">Comma-separated course-specific terms.</p>
                    </div>
                </Section>
            </fieldset>
        </div>
    );
};
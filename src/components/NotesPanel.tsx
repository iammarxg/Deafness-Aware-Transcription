import React, { useState } from 'react';
import { marked } from 'marked';
import { Panel, PanelContent, PanelHeader, PanelActions } from './Panel';
import { Button } from './Button';
import { UILanguage, NoteLanguage } from '../types';
import { t } from '../services/translationService';
import { Sparkles, Copy, Printer, Check, BookOpenCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotesPanelProps {
    notes: string;
    isGenerating: boolean;
    onGenerate: () => void;
    fontSize: number;
    hasTranscription: boolean;
    isProcessing: boolean;
    uiLanguage: UILanguage;
    noteLanguage: NoteLanguage;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ 
    notes, 
    isGenerating, 
    onGenerate, 
    fontSize, 
    hasTranscription, 
    isProcessing, 
    uiLanguage, 
    noteLanguage 
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(notes);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        // Find or create print container
        let printDiv = document.getElementById('print-content');
        if (!printDiv) {
            printDiv = document.createElement('div');
            printDiv.id = 'print-content';
            document.body.appendChild(printDiv);
        }
        
        const markup = marked.parse(notes) as string;
        printDiv.innerHTML = `
            <div class="p-8 ${noteLanguage === NoteLanguage.ARABIC ? 'rtl' : 'ltr'}">
                <h1 class="text-4xl font-bold mb-8 border-b pb-4">${t('notes.title', uiLanguage)}</h1>
                <div class="prose max-w-none">${markup}</div>
            </div>
        `;
        
        window.print();
        printDiv.innerHTML = ''; // Clear after printing
    };

    const createMarkup = (markdown: string) => {
        if (!markdown) return { __html: '' };
        return { __html: marked.parse(markdown) as string };
    };

    return (
        <Panel className="flex flex-col min-h-[400px]">
            <PanelHeader title={t('notes.title', uiLanguage)} icon={<BookOpenCheck className="w-4 h-4" />}>
                <Button 
                    size="sm"
                    onClick={onGenerate} 
                    disabled={isGenerating || !hasTranscription || isProcessing}
                    className="shadow-indigo-500/10"
                >
                    {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Sparkles className="w-4 h-4" />
                    )}
                    <span>{isGenerating ? t('notes.generatingButton', uiLanguage) : t('notes.generateButton', uiLanguage)}</span>
                </Button>
            </PanelHeader>

            <PanelContent className="flex-1 flex flex-col p-6 min-h-0 bg-zinc-50/30 dark:bg-zinc-900/10 relative">
                <AnimatePresence mode="wait">
                    {!notes && !isGenerating ? (
                        <motion.div 
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-4"
                        >
                            <Sparkles className="w-12 h-12 opacity-10" />
                            <p className="text-sm italic">{t('notes.placeholder', uiLanguage)}</p>
                        </motion.div>
                    ) : isGenerating && !notes ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex-1 flex flex-col items-center justify-center text-indigo-500 space-y-4"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            >
                                <Loader2 className="w-10 h-10" />
                            </motion.div>
                            <p className="text-sm font-medium">{t('notes.generatingButton', uiLanguage)}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            <div
                                className="prose dark:prose-invert max-w-none 
                                    prose-headings:text-indigo-600 dark:prose-headings:text-indigo-400
                                    prose-p:text-zinc-700 dark:prose-p:text-zinc-300
                                    prose-li:text-zinc-700 dark:prose-li:text-zinc-300
                                    prose-strong:text-zinc-900 dark:prose-strong:text-zinc-100"
                                dangerouslySetInnerHTML={createMarkup(notes)}
                                dir={noteLanguage === NoteLanguage.ARABIC ? 'rtl' : 'ltr'}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </PanelContent>

            <PanelActions>
                <div className="flex-1 flex gap-2">
                    {notes && (
                        <>
                            <Button variant="ghost" size="sm" onClick={handleCopy}>
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {t('notes.copyButton', uiLanguage)}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handlePrint}>
                                <Printer className="w-4 h-4" />
                                {t('notes.exportPdfButton', uiLanguage)}
                            </Button>
                        </>
                    )}
                </div>
            </PanelActions>
        </Panel>
    );
};

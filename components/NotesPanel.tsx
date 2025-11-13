import React from 'react';
import { marked } from 'marked';
import { Panel, PanelContent, PanelHeader, PanelActions } from './Panel';
import { Button } from './Button';
import { CopyIcon, SparklesIcon } from './Icons';
import { UILanguage, NoteLanguage } from '../types';
import { t } from '../services/translationService';


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

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, isGenerating, onGenerate, fontSize, hasTranscription, isProcessing, uiLanguage, noteLanguage }) => {

    const copyToClipboard = () => {
        navigator.clipboard.writeText(notes);
    };

    const exportToPdf = () => {
        const content = document.getElementById('notes-content');
        if (content) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (!printWindow) return;

            const printContent = `
                <html>
                    <head>
                        <title>AI Generated Notes</title>
                        <style>
                            @media print {
                                @page {
                                    size: A4;
                                    margin: 1in;
                                }
                            }
                            body {
                                font-family: Georgia, 'Times New Roman', Times, serif;
                                font-size: 12pt;
                                line-height: 1.5;
                                margin: 40px;
                                color: #333;
                                background-color: #fff;
                            }
                            .page-title {
                                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                                font-size: 24pt;
                                font-weight: bold;
                                margin-bottom: 30px;
                                border-bottom: 1px solid #ccc;
                                padding-bottom: 10px;
                                text-align: center;
                            }
                            h1, h2, h3, h4, h5, h6 {
                                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                                font-weight: bold;
                                margin-top: 1.5em;
                                margin-bottom: 0.5em;
                            }
                            h1 { font-size: 20pt; }
                            h2 { font-size: 16pt; }
                            h3 { font-size: 14pt; }
                            p { margin-bottom: 1em; }
                            ul, ol { padding-left: 2em; margin-bottom: 1em; }
                            li { margin-bottom: 0.5em; }
                            strong, b { font-weight: bold; }
                            em, i { font-style: italic; }
                            code { 
                                font-family: 'Courier New', Courier, monospace;
                                background-color: #f4f4f4; 
                                padding: 2px 4px; 
                                border-radius: 4px; 
                                font-size: 0.9em;
                            }
                            blockquote {
                                border-left: 4px solid #ccc;
                                padding-left: 1em;
                                color: #666;
                                margin-left: 0;
                                font-style: italic;
                            }
                        </style>
                    </head>
                    <body>
                        <h1 class="page-title">AI Generated Notes</h1>
                        <div>${content.innerHTML}</div>
                    </body>
                </html>
            `;
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    const createMarkup = (markdown: string) => {
        if (!markdown) {
            return { __html: `<p class="text-gray-500 dark:text-slate-400">${t('notes.placeholder', uiLanguage)}</p>` };
        }
        const rawHtml = marked.parse(markdown) as string;
        return { __html: rawHtml };
    };

    return (
        <Panel>
            <PanelHeader title={t('notes.title', uiLanguage)}>
                <Button onClick={onGenerate} disabled={isGenerating || !hasTranscription || isProcessing}>
                    <SparklesIcon />
                    <span>{isGenerating ? t('notes.generatingButton', uiLanguage) : t('notes.generateButton', uiLanguage)}</span>
                </Button>
            </PanelHeader>
            <PanelContent>
                 <div
                    id="notes-content"
                    className="prose dark:prose-invert max-w-none p-4 h-64 overflow-y-auto bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={createMarkup(notes)}
                    dir={noteLanguage === NoteLanguage.ARABIC ? 'rtl' : 'ltr'}
                >
                </div>
            </PanelContent>
            <PanelActions>
                <Button onClick={copyToClipboard} variant="ghost" disabled={!notes}>
                    <CopyIcon />
                    <span>{t('notes.copyButton', uiLanguage)}</span>
                </Button>
                <Button onClick={exportToPdf} variant="ghost" disabled={!notes}>
                    <span>{t('notes.exportPdfButton', uiLanguage)}</span>
                </Button>
            </PanelActions>
        </Panel>
    );
};
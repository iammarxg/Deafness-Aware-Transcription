import React from 'react';
import { marked } from 'marked';
import { Panel, PanelContent, PanelHeader, PanelActions } from './Panel';
import { Button } from './Button';
import { CopyIcon, SparklesIcon } from './Icons';

interface NotesPanelProps {
    notes: string;
    isGenerating: boolean;
    onGenerate: () => void;
    fontSize: number;
    hasTranscription: boolean;
    isProcessing: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ notes, isGenerating, onGenerate, fontSize, hasTranscription, isProcessing }) => {

    const copyToClipboard = () => {
        navigator.clipboard.writeText(notes);
    };

    const exportToPdf = () => {
        const content = document.getElementById('notes-content');
        if (content) {
            const printWindow = window.open('', '', 'height=600,width=800');
            printWindow?.document.write('<html><head><title>Notes</title>');
            printWindow?.document.write('</head><body>');
            printWindow?.document.write(content.innerHTML);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.print();
        }
    };

    const createMarkup = (markdown: string) => {
        const rawHtml = marked.parse(markdown) as string;
        return { __html: rawHtml };
    };

    return (
        <Panel>
            <PanelHeader title="AI Generated Notes">
                <Button onClick={onGenerate} disabled={isGenerating || !hasTranscription || isProcessing}>
                    <SparklesIcon />
                    <span>{isGenerating ? 'Generating...' : 'Generate Notes'}</span>
                </Button>
            </PanelHeader>
            <PanelContent>
                 <div
                    id="notes-content"
                    className="prose max-w-none p-4 h-64 overflow-y-auto bg-gray-100 rounded-md border border-gray-200"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={createMarkup(notes || "Generated notes will appear here...")}
                >
                </div>
            </PanelContent>
            <PanelActions>
                <Button onClick={copyToClipboard} variant="ghost" disabled={!notes}>
                    <CopyIcon />
                    <span>Copy Text</span>
                </Button>
                <Button onClick={exportToPdf} variant="ghost" disabled={!notes}>
                    <span>Export as PDF</span>
                </Button>
            </PanelActions>
        </Panel>
    );
};
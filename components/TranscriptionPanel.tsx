import React, { useRef } from 'react';
import { Panel, PanelContent, PanelHeader, PanelActions } from './Panel';
import { Button } from './Button';
import { CopyIcon, MicrophoneIcon, StopIcon, UploadIcon } from './Icons';
import { UILanguage } from '../types';
import { t } from '../services/translationService';

interface TranscriptionPanelProps {
    transcription: string;
    isRecording: boolean;
    isProcessing: boolean;
    onStartLive: () => void;
    onStop: () => void;
    onFileUpload: (file: File) => void;
    fontSize: number;
    error: string | null;
    uiLanguage: UILanguage;
}

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
    transcription,
    isRecording,
    isProcessing,
    onStartLive,
    onStop,
    onFileUpload,
    fontSize,
    error,
    uiLanguage,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(transcription);
    };
    
    const exportToPdf = () => {
        const content = document.getElementById('transcription-content');
        if (content) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (!printWindow) return;

            const printContent = `
                <html>
                    <head>
                        <title>Transcription</title>
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
                            h1 {
                                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                                font-size: 24pt;
                                font-weight: bold;
                                margin-bottom: 30px;
                                border-bottom: 1px solid #ccc;
                                padding-bottom: 10px;
                                text-align: center;
                            }
                            div {
                               white-space: pre-wrap;
                               word-wrap: break-word;
                               text-align: justify;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>Lecture Transcription</h1>
                        <div>${content.innerText}</div>
                    </body>
                </html>
            `;

            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };


    return (
        <Panel>
            <PanelHeader title={t('transcription.title', uiLanguage)}>
                <div className="flex flex-wrap gap-2">
                    {isRecording ? (
                        <Button onClick={onStop} variant="danger" disabled={isProcessing}>
                            <StopIcon />
                            <span>{t('transcription.stopButton', uiLanguage)}</span>
                        </Button>
                    ) : (
                        <>
                            <Button onClick={onStartLive} disabled={isProcessing}>
                                <MicrophoneIcon />
                                <span>{t('transcription.startLiveButton', uiLanguage)}</span>
                            </Button>
                            <Button onClick={handleUploadClick} variant="secondary" disabled={isProcessing}>
                                <UploadIcon />
                                <span>{t('transcription.uploadButton', uiLanguage)}</span>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept="audio/*"
                            />
                        </>
                    )}
                </div>
            </PanelHeader>
            <PanelContent>
                {error && (
                    <div 
                        className="p-4 mb-4 text-sm text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-lg" 
                        role="alert"
                        dangerouslySetInnerHTML={{ __html: error }}
                    />
                )}
                <div 
                    id="transcription-content"
                    className="prose max-w-none p-4 h-64 overflow-y-auto bg-gray-100 dark:bg-slate-800 rounded-md border border-gray-200 dark:border-slate-700 whitespace-pre-wrap text-gray-800 dark:text-slate-300"
                    style={{ fontSize: `${fontSize}px` }}
                    dir="auto"
                >
                    {isProcessing && !isRecording ? t('transcription.initializing', uiLanguage) : transcription || <span class="text-gray-500 dark:text-slate-400">{t('transcription.placeholder', uiLanguage)}</span>}
                </div>
            </PanelContent>
            <PanelActions>
                 <Button onClick={copyToClipboard} variant="ghost" disabled={!transcription}>
                    <CopyIcon />
                    <span>{t('transcription.copyButton', uiLanguage)}</span>
                </Button>
                <Button onClick={exportToPdf} variant="ghost" disabled={!transcription}>
                    <span>{t('transcription.exportPdfButton', uiLanguage)}</span>
                </Button>
            </PanelActions>
        </Panel>
    );
};

import React, { useRef } from 'react';
import { Panel, PanelContent, PanelHeader, PanelActions } from './Panel';
import { Button } from './Button';
import { CopyIcon, MicrophoneIcon, StopIcon, UploadIcon } from './Icons';

interface TranscriptionPanelProps {
    transcription: string;
    isRecording: boolean;
    isProcessing: boolean;
    onStartLive: () => void;
    onStop: () => void;
    onFileUpload: (file: File) => void;
    fontSize: number;
    error: string | null;
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
            <PanelHeader title="Transcription">
                <div className="flex space-x-2">
                    {isRecording ? (
                        <Button onClick={onStop} variant="danger" disabled={isProcessing}>
                            <StopIcon />
                            <span>Stop</span>
                        </Button>
                    ) : (
                        <>
                            <Button onClick={onStartLive} disabled={isProcessing}>
                                <MicrophoneIcon />
                                <span>Start Live</span>
                            </Button>
                            <Button onClick={handleUploadClick} variant="secondary" disabled={isProcessing}>
                                <UploadIcon />
                                <span>Upload Audio</span>
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
                        className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" 
                        role="alert"
                        dangerouslySetInnerHTML={{ __html: error }}
                    />
                )}
                <div 
                    id="transcription-content"
                    className="prose max-w-none p-4 h-64 overflow-y-auto bg-gray-100 rounded-md border border-gray-200 whitespace-pre-wrap"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {isProcessing && !isRecording ? "Initializing transcription service..." : transcription || "Your transcription will appear here..."}
                </div>
            </PanelContent>
            <PanelActions>
                 <Button onClick={copyToClipboard} variant="ghost" disabled={!transcription}>
                    <CopyIcon />
                    <span>Copy Text</span>
                </Button>
                <Button onClick={exportToPdf} variant="ghost" disabled={!transcription}>
                    <span>Export as PDF</span>
                </Button>
            </PanelActions>
        </Panel>
    );
};

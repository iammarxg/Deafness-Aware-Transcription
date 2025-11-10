
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
            printWindow?.document.write('<html><head><title>Transcription</title>');
            printWindow?.document.write('</head><body>');
            printWindow?.document.write(content.innerHTML);
            printWindow?.document.write('</body></html>');
            printWindow?.document.close();
            printWindow?.print();
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
                {/* PDF export is simplified to copy for now. window.print() is a better no-lib solution */}
                <Button onClick={exportToPdf} variant="ghost" disabled={!transcription}>
                    <span>Export as PDF</span>
                </Button>
            </PanelActions>
        </Panel>
    );
};

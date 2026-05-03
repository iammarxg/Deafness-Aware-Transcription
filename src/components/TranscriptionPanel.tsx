import React, { useRef } from 'react';
import { Panel, PanelHeader, PanelContent, PanelActions } from './Panel';
import { Button } from './Button';
import { t } from '../services/translationService';
import { UILanguage } from '../types';
import { 
    Mic, 
    MicOff, 
    Upload, 
    Copy, 
    Check, 
    AlertCircle, 
    AudioLines,
    FileAudio,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

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
    uiLanguage
}) => {
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(transcription);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Panel className="flex flex-col min-h-[400px]">
            <PanelHeader title={t('transcription.title', uiLanguage)} icon={<AudioLines className="w-4 h-4" />}>
                {isRecording && (
                    <motion.div 
                        animate={{ opacity: [1, 0.4, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">Live</span>
                    </motion.div>
                )}
            </PanelHeader>

            <PanelContent className="relative flex flex-col p-0">
                <div 
                    className="flex-1 p-6 overflow-y-auto font-mono scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800"
                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                >
                    {!transcription && !isProcessing && (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                            >
                                <FileAudio className="w-12 h-12 opacity-20" />
                            </motion.div>
                            <p className="text-sm italic">{t('transcription.placeholder', uiLanguage)}</p>
                        </div>
                    )}
                    
                    {isProcessing && !transcription && (
                        <div className="h-full flex flex-col items-center justify-center text-indigo-500 space-y-4">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [12, 24, 12] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        className="w-1 bg-indigo-500 rounded-full"
                                    />
                                ))}
                            </div>
                            <p className="text-sm font-medium">{t('transcription.initializing', uiLanguage)}</p>
                        </div>
                    )}

                    <div className="whitespace-pre-wrap break-words leading-relaxed text-zinc-800 dark:text-zinc-200">
                        {transcription}
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div 
                                className="text-sm text-red-700 dark:text-red-300 [&>a]:font-bold [&>a]:underline"
                                dangerouslySetInnerHTML={{ __html: error }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </PanelContent>

            <PanelActions>
                <div className="flex-1 flex gap-2">
                    {transcription && (
                        <Button variant="outline" size="sm" onClick={handleCopy}>
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            {t('transcription.copyButton', uiLanguage)}
                        </Button>
                    )}
                </div>

                <div className="flex gap-2">
                    {isRecording ? (
                        <Button variant="danger" onClick={onStop}>
                            <MicOff className="w-4 h-4" />
                            {t('transcription.stopButton', uiLanguage)}
                        </Button>
                    ) : (
                        <>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="audio/*,video/*" 
                                onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
                            />
                            <Button 
                                variant="outline" 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                            >
                                <Upload className="w-4 h-4" />
                                {t('transcription.uploadButton', uiLanguage)}
                            </Button>
                            <Button 
                                variant="primary" 
                                onClick={onStartLive}
                                disabled={isProcessing}
                            >
                                <Mic className="w-4 h-4" />
                                {t('transcription.startLiveButton', uiLanguage)}
                            </Button>
                        </>
                    )}
                </div>
            </PanelActions>
        </Panel>
    );
};

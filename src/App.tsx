import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { SettingsPanel } from './components/SettingsPanel';
import { TranscriptionPanel } from './components/TranscriptionPanel';
import { NotesPanel } from './components/NotesPanel';
import { Header } from './components/Header';
import { Settings, TranscriptionMode, NoteLanguage, UILanguage, Theme } from './types';
import { generateNotesPrompt, getSystemInstruction } from './services/promptService';
import { t } from './services/translationService';

// Audio encoding/decoding helper functions
function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

const App: React.FC = () => {
    const [settings, setSettings] = useState<Settings>({
        isSimplified: false,
        fontSize: 16,
        noteLanguage: NoteLanguage.ENGLISH,
        customGlossary: '',
        autoGenerateNotes: false,
    });
    const [uiLanguage, setUiLanguage] = useState<UILanguage>(() => {
        const stored = localStorage.getItem('uiLanguage') as UILanguage;
        return stored || 'en';
    });
    const [theme, setTheme] = useState<Theme>('dark');

    const [transcription, setTranscription] = useState('');
    const [notes, setNotes] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const transcriptionRef = useRef('');

    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    // Pre-initialize Gemini AI
    const ai = useRef(new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string }));

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (storedTheme) {
            setTheme(storedTheme);
        } else {
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = uiLanguage;
        document.documentElement.dir = uiLanguage === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('uiLanguage', uiLanguage);
    }, [uiLanguage]);

    const handleGenerateNotes = useCallback(async (textToProcess: string) => {
        if (!textToProcess || isGeneratingNotes) return;

        setIsGeneratingNotes(true);
        setError(null);
        setNotes('');

        try {
            const prompt = generateNotesPrompt(textToProcess, settings);
            const response = await ai.current.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });
            setNotes(response.text || '');
        } catch (err: any) {
            console.error(err);
            let errorMessageKey = 'notes.errorGeneric';
            const errorString = err.toString();
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                 errorMessageKey = 'transcription.errorApiQuota';
            }
            setError(t(errorMessageKey, uiLanguage));
            setNotes('');
        } finally {
            setIsGeneratingNotes(false);
        }
    }, [isGeneratingNotes, settings, uiLanguage]);

    const stopAudioProcessing = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => session.close());
            sessionPromiseRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close().catch(() => {});
            outputAudioContextRef.current = null;
        }
        for (const source of sourcesRef.current) {
            try { source.stop(); } catch(e) {}
        }
        sourcesRef.current.clear();
        nextStartTimeRef.current = 0;
        currentInputTranscriptionRef.current = '';
        currentOutputTranscriptionRef.current = '';

        if (settings.autoGenerateNotes && transcriptionRef.current) {
            handleGenerateNotes(transcriptionRef.current);
        }

        setIsRecording(false);
        setIsProcessing(false);
    }, [settings, handleGenerateNotes]);

    const startAudioProcessing = useCallback(async (getAudioSource: (context: AudioContext) => Promise<AudioNode>) => {
        if (isRecording || isProcessing) return;

        setTranscription('');
        transcriptionRef.current = '';
        setNotes('');
        setError(null);
        setIsProcessing(true);

        try {
            const onMessage = async (message: LiveServerMessage) => {
                if (message.serverContent?.outputTranscription) {
                    const text = message.serverContent.outputTranscription.text;
                    currentOutputTranscriptionRef.current += text;
                } 
                
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentInputTranscriptionRef.current += text;
                    setTranscription(prev => {
                        const newTranscription = `${prev}${text}`;
                        transcriptionRef.current = newTranscription;
                        return newTranscription;
                    });
                }

                const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64EncodedAudioString && outputAudioContextRef.current) {
                    const outputAudioContext = outputAudioContextRef.current;
                    nextStartTimeRef.current = Math.max(
                        nextStartTimeRef.current,
                        outputAudioContext.currentTime,
                    );
                    const audioBuffer = await decodeAudioData(
                        decode(base64EncodedAudioString),
                        outputAudioContext,
                        24000,
                        1,
                    );
                    const source = outputAudioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.addEventListener('ended', () => {
                        sourcesRef.current.delete(source);
                    });

                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                    sourcesRef.current.add(source);
                }

                const interrupted = message.serverContent?.interrupted;
                if (interrupted) {
                    for (const source of sourcesRef.current.values()) {
                        try { source.stop(); } catch(e) {}
                        sourcesRef.current.delete(source);
                    }
                    nextStartTimeRef.current = 0;
                }
            };
            
            sessionPromiseRef.current = ai.current.live.connect({
                model: 'gemini-3.1-flash-live-preview',
                callbacks: {
                    onopen: () => console.log('Session opened.'),
                    onmessage: onMessage,
                    onerror: (e: any) => {
                        console.error('Session error:', e);
                        setError(t('transcription.errorGeneric', uiLanguage));
                        stopAudioProcessing();
                    },
                    onclose: (e: any) => {
                       console.log('Session closed.');
                       stopAudioProcessing();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    systemInstruction: getSystemInstruction(),
                },
            });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const sourceNode = await getAudioSource(audioContextRef.current);
            processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            processorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                
                sessionPromiseRef.current?.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
            };

            sourceNode.connect(processorRef.current);
            processorRef.current.connect(audioContextRef.current.destination);
            
            setIsProcessing(false);
            setIsRecording(true);

        } catch (err: any) {
            console.error(err);
            let errorMessageKey = 'transcription.errorMicrophone';
            const errorString = err.toString();
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                errorMessageKey = 'transcription.errorApiQuota';
            }
            setError(t(errorMessageKey, uiLanguage));
            setIsProcessing(false);
        }
    }, [isRecording, isProcessing, stopAudioProcessing, uiLanguage]);

    const handleStartLive = useCallback(() => {
        const getMicSource = async (context: AudioContext) => {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamSourceRef.current = context.createMediaStreamSource(stream);
            return mediaStreamSourceRef.current;
        };
        startAudioProcessing(getMicSource);
    }, [startAudioProcessing]);

    const handleFileUpload = useCallback((file: File) => {
        const getFileSource = async (context: AudioContext) => {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await context.decodeAudioData(arrayBuffer);
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.onended = stopAudioProcessing;
            source.start(0);
            return source;
        };
        startAudioProcessing(getFileSource);
    }, [startAudioProcessing, stopAudioProcessing]);


    return (
        <div className="min-h-screen font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/50">
            <Header 
                uiLanguage={uiLanguage} 
                onLanguageChange={setUiLanguage} 
                theme={theme}
                onThemeChange={setTheme}
            />
            
            <main className="max-w-7xl mx-auto p-4 md:p-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    <div className="lg:col-span-4 xl:col-span-3">
                       <SettingsPanel 
                            settings={settings} 
                            onSettingsChange={setSettings} 
                            disabled={isRecording || isProcessing} 
                            uiLanguage={uiLanguage} 
                        />
                    </div>
                    
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                        <AnimatePresence mode="wait">
                            <TranscriptionPanel
                                key="transcription"
                                transcription={transcription}
                                isRecording={isRecording}
                                isProcessing={isProcessing}
                                onStartLive={handleStartLive}
                                onStop={stopAudioProcessing}
                                onFileUpload={handleFileUpload}
                                fontSize={settings.fontSize}
                                error={error}
                                uiLanguage={uiLanguage}
                            />
                            
                            <NotesPanel
                                key="notes"
                                notes={notes}
                                isGenerating={isGeneratingNotes}
                                onGenerate={() => handleGenerateNotes(transcription)}
                                fontSize={settings.fontSize}
                                hasTranscription={transcription.length > 0}
                                isProcessing={isRecording || isProcessing}
                                uiLanguage={uiLanguage}
                                noteLanguage={settings.noteLanguage}
                            />
                        </AnimatePresence>
                    </div>
                </motion.div>
            </main>
            
            {/* Background mesh/atmosphere inspired by Recipe 7 */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-600/5" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-600/5" />
            </div>
        </div>
    );
};

export default App;


import React, { useState, useCallback, useRef } from 'react';
// Fix: Import Blob for createBlob function
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from '@google/genai';
import { SettingsPanel } from './components/SettingsPanel';
import { TranscriptionPanel } from './components/TranscriptionPanel';
import { NotesPanel } from './components/NotesPanel';
import { Header } from './components/Header';
import { Settings, TranscriptionMode, NoteLanguage } from './types';
import { generateNotesPrompt, getSystemInstruction } from './services/promptService';

// Fix: Add audio encoding/decoding helper functions as per @google/genai guidelines.
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

    // Fix: Add refs for output audio processing and transcription accumulation, as per guidelines.
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    // Fix: Remove `transcription` from dependency array to prevent re-creating the function on every update.
    // The transcription text should always be passed as an argument.
    const handleGenerateNotes = useCallback(async (textToProcess: string) => {
        if (!textToProcess || isGeneratingNotes) return;

        setIsGeneratingNotes(true);
        setError(null);
        setNotes('Generating notes...');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = generateNotesPrompt(textToProcess, settings);
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            setNotes(response.text);
        } catch (err: any) {
            console.error(err);
            let errorMessage = 'Failed to generate notes.';
            const errorString = err.toString();
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = `You've exceeded your API usage quota. Please check your plan and billing details. For more information, see <a href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noopener noreferrer" class="font-bold underline">API Rate Limits</a> or <a href="https://ai.dev/usage?tab=rate-limit" target="_blank" rel="noopener noreferrer" class="font-bold underline">your usage dashboard</a>.`;
            }
            setError(errorMessage);
            setNotes('');
        } finally {
            setIsGeneratingNotes(false);
        }
    }, [isGeneratingNotes, settings]);

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
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        // Fix: Add cleanup for output audio context and sources.
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        for (const source of sourcesRef.current) {
            source.stop();
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

    // Fix: Rewrote startAudioProcessing to fully comply with @google/genai Live API guidelines.
    const startAudioProcessing = useCallback(async (getAudioSource: (context: AudioContext) => Promise<AudioNode>) => {
        if (isRecording || isProcessing) return;

        setTranscription('');
        transcriptionRef.current = '';
        setNotes('');
        setError(null);
        setIsProcessing(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            // Fix: Re-implement onMessage to handle all server messages correctly.
            const onMessage = async (message: LiveServerMessage) => {
                
                // Process the model's transcribed audio response, but do not display it.
                // This prevents the AI's conversational replies from appearing in the transcript.
                if (message.serverContent?.outputTranscription) {
                    const text = message.serverContent.outputTranscription.text;
                    currentOutputTranscriptionRef.current += text;
                } 
                
                // Process the user's transcribed speech from the microphone and display it.
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentInputTranscriptionRef.current += text;
                    setTranscription(prev => {
                        const newTranscription = `${prev}${text}`;
                        transcriptionRef.current = newTranscription;
                        return newTranscription;
                    });
                }

                if (message.serverContent?.turnComplete) {
                    // Note generation now happens once in stopAudioProcessing.
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                }

                // Fix: Handle audio output from the model, as required by the SDK.
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
                    // NOTE: source is not connected to destination, so audio is processed but not played.
                    // This is intentional for a deafness-aware application.
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
                        source.stop();
                        sourcesRef.current.delete(source);
                    }
                    nextStartTimeRef.current = 0;
                }
            };
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => console.log('Session opened.'),
                    onmessage: onMessage,
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setError('An error occurred with the transcription service.');
                        stopAudioProcessing();
                    },
                    onclose: (e: CloseEvent) => {
                       console.log('Session closed.');
                       stopAudioProcessing();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    // Fix: Enable output transcription to get model's spoken response as text.
                    outputAudioTranscription: {},
                    systemInstruction: getSystemInstruction(),
                },
            });

            // Fix: Cast window to `any` to resolve TypeScript error for `webkitAudioContext`.
            audioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            const sourceNode = await getAudioSource(audioContextRef.current);
            processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            processorRef.current.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                // Fix: Use createBlob helper for cleaner code.
                const pcmBlob = createBlob(inputData);
                
                // Fix: Use sessionPromise to prevent race conditions.
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
            let errorMessage = 'Failed to start transcription. Please check microphone permissions.';
            const errorString = err.toString();
            if (errorString.includes('429') || errorString.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = `You've exceeded your API usage quota. Please check your plan and billing details. For more information, see <a href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noopener noreferrer" class="font-bold underline">API Rate Limits</a> or <a href="https://ai.dev/usage?tab=rate-limit" target="_blank" rel="noopener noreferrer" class="font-bold underline">your usage dashboard</a>.`;
            }
            setError(errorMessage);
            setIsProcessing(false);
        }
    // Fix: Update dependencies to prevent stale closures and infinite loops.
    }, [isRecording, isProcessing, stopAudioProcessing]);

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
        <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
            <Header />
            <main className="p-4 md:p-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 xl:col-span-3">
                       <SettingsPanel settings={settings} onSettingsChange={setSettings} disabled={isRecording || isProcessing}/>
                    </div>
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                        <TranscriptionPanel
                            transcription={transcription}
                            isRecording={isRecording}
                            isProcessing={isProcessing}
                            onStartLive={handleStartLive}
                            onStop={stopAudioProcessing}
                            onFileUpload={handleFileUpload}
                            fontSize={settings.fontSize}
                            error={error}
                        />
                        <NotesPanel
                            notes={notes}
                            isGenerating={isGeneratingNotes}
                            // Fix: Pass current transcription when generating notes manually.
                            onGenerate={() => handleGenerateNotes(transcription)}
                            fontSize={settings.fontSize}
                            hasTranscription={transcription.length > 0}
                            isProcessing={isRecording || isProcessing}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;


import { Settings, NoteLanguage } from '../types';

export const getSystemInstruction = (): string => {
    return "You are an AI transcription service. Your sole purpose is to accurately transcribe the audio you receive. Do not answer questions, provide information, or engage in any form of conversation. Only return the transcribed text from the audio input. The audio may contain a mix of English and Arabic.";
};

export const generateNotesPrompt = (transcription: string, settings: Settings): string => {
    let prompt = `Based on the following lecture transcription, generate structured notes.
The notes should be clear, concise, and well-organized. Focus on key concepts, definitions, and important takeaways.
`;

    if (settings.isSimplified) {
        prompt += "\n**IMPORTANT**: Use simple language that is easy to understand, as if explaining to a beginner. Avoid jargon where possible or explain it clearly.\n";
    }

    switch (settings.noteLanguage) {
        case NoteLanguage.ARABIC:
            prompt += "\n**IMPORTANT**: The entire output of the notes must be in Arabic.\n";
            break;
        case NoteLanguage.BILINGUAL:
            prompt += "\n**IMPORTANT**: Provide the notes bilingually. For each key point, provide the English version first, followed by the Arabic translation.\n";
            break;
        default:
            prompt += "\n**IMPORTANT**: The entire output of the notes must be in English.\n";
            break;
    }

    if (settings.customGlossary && settings.customGlossary !== 'e.g., Photosynthesis, Mitochondria, Quantum Mechanics') {
        prompt += `\nPay special attention to the following technical terms and ensure they are used correctly in the notes: ${settings.customGlossary}\n`;
    }

    prompt += `\n---\n\n**TRANSCRIPTION:**\n\n${transcription}`;

    return prompt;
};

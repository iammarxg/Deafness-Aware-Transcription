
export enum NoteLanguage {
    ENGLISH = 'ENGLISH',
    ARABIC = 'ARABIC',
    BILINGUAL = 'BILINGUAL',
}

export enum TranscriptionMode {
    LIVE = 'Live',
    FILE = 'File',
}

export interface Settings {
    isSimplified: boolean;
    fontSize: number;
    noteLanguage: NoteLanguage;
    customGlossary: string;
    autoGenerateNotes: boolean;
}

export type UILanguage = 'en' | 'ar';

export type Theme = 'light' | 'dark';

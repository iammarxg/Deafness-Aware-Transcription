
export enum NoteLanguage {
    ENGLISH = 'English',
    ARABIC = 'Arabic',
    BILINGUAL = 'Bilingual (English & Arabic)',
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

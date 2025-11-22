export interface Language {
  code: string;
  name: string;
  flag: string;
  locale: string; // e.g., 'en-US', 'ur-PK' for SpeechRecognition
}

export enum TranslationStatus {
  IDLE = 'IDLE',
  TRANSLATING = 'TRANSLATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type TranslationTone = 'Standard' | 'Professional' | 'Casual' | 'Creative';

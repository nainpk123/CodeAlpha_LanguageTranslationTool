import { Language } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', locale: 'en-US' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', locale: 'ur-PK' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', locale: 'es-ES' },
  { code: 'fr', name: 'French', flag: '🇫🇷', locale: 'fr-FR' },
  { code: 'de', name: 'German', flag: '🇩🇪', locale: 'de-DE' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', locale: 'it-IT' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', locale: 'pt-PT' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', locale: 'ru-RU' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', locale: 'ja-JP' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', locale: 'ko-KR' },
  { code: 'zh', name: 'Chinese (Simplified)', flag: '🇨🇳', locale: 'zh-CN' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', locale: 'ar-SA' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', locale: 'hi-IN' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', locale: 'tr-TR' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', locale: 'nl-NL' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳', locale: 'vi-VN' },
  { code: 'th', name: 'Thai', flag: '🇹🇭', locale: 'th-TH' },
  { code: 'id', name: 'Indonesian', flag: '🇮🇩', locale: 'id-ID' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱', locale: 'pl-PL' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', locale: 'bn-BD' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', locale: 'pa-IN' },
];

export const DEFAULT_SOURCE = LANGUAGES[0]; // English
export const DEFAULT_TARGET = LANGUAGES[1]; // Urdu

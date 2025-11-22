import React from 'react';
import { LANGUAGES } from '../constants';
import { Language } from '../types';
import { ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  label: string;
  selected: Language;
  onChange: (lang: Language) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  label,
  selected,
  onChange,
  disabled
}) => {
  return (
    <div className="flex flex-col space-y-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="relative">
        <select
          value={selected.code}
          onChange={(e) => {
            const lang = LANGUAGES.find(l => l.code === e.target.value);
            if (lang) onChange(lang);
          }}
          disabled={disabled}
          className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-3 px-4 pr-8 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
               {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

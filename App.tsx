import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LanguageSelector } from './components/LanguageSelector';
import { LANGUAGES, DEFAULT_SOURCE, DEFAULT_TARGET } from './constants';
import { Language, TranslationStatus, TranslationTone } from './types';
import { translateText, playTextToSpeech } from './services/geminiService';
import { ArrowRightLeft, Copy, Volume2, Check, Sparkles, Loader2, X, Mic, MicOff, Wand2 } from 'lucide-react';

const TONES: TranslationTone[] = ['Standard', 'Professional', 'Casual', 'Creative'];

const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<Language>(DEFAULT_SOURCE);
  const [targetLang, setTargetLang] = useState<Language>(DEFAULT_TARGET);
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [status, setStatus] = useState<TranslationStatus>(TranslationStatus.IDLE);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [selectedTone, setSelectedTone] = useState<TranslationTone>('Standard');
  const [isListening, setIsListening] = useState<boolean>(false);

  // Use a ref to track the latest text to prevent race conditions
  const latestTextRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);

  // --- Handlers ---

  const handleSwapLanguages = useCallback(() => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
    // Trigger immediate re-translation logic via the effect
  }, [targetLang, sourceLang, translatedText, inputText]);

  const performTranslation = useCallback(async (textToTranslate: string) => {
    if (!textToTranslate.trim()) {
      setStatus(TranslationStatus.IDLE);
      return;
    }

    setStatus(TranslationStatus.TRANSLATING);
    
    try {
      const result = await translateText(textToTranslate, sourceLang.name, targetLang.name, selectedTone);
      
      // Only update if this result corresponds to the latest input
      if (textToTranslate === latestTextRef.current) {
        setTranslatedText(result);
        setStatus(TranslationStatus.SUCCESS);
      }
    } catch (error) {
      console.error(error);
      if (textToTranslate === latestTextRef.current) {
        setStatus(TranslationStatus.ERROR);
      }
    }
  }, [sourceLang, targetLang, selectedTone]);

  // Real-time translation effect with debounce
  useEffect(() => {
    latestTextRef.current = inputText;

    if (!inputText.trim()) {
      setTranslatedText('');
      setStatus(TranslationStatus.IDLE);
      return;
    }

    const timeoutId = setTimeout(() => {
      performTranslation(inputText);
    }, 800); // 800ms debounce for "type-as-you-go" feel

    return () => clearTimeout(timeoutId);
  }, [inputText, performTranslation]);

  // Re-translate when tone changes
  useEffect(() => {
    if (inputText) {
      performTranslation(inputText);
    }
  }, [selectedTone]);

  const handleSpeak = useCallback(async () => {
    if (!translatedText || isSpeaking) return;

    setIsSpeaking(true);
    try {
      await playTextToSpeech(translatedText);
    } catch (error) {
      console.error("TTS failed", error);
    } finally {
      setIsSpeaking(false);
    }
  }, [translatedText, isSpeaking]);

  const handleCopy = useCallback(async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  }, [translatedText]);

  // --- Speech Recognition Logic ---
  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang.locale;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setInputText(prev => {
            const newText = prev ? `${prev} ${finalTranscript}` : finalTranscript;
            return newText;
        });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();

  }, [isListening, sourceLang.locale]);

  // --- Render ---

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col font-sans">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <Header />

      <main className="flex-grow flex flex-col items-center p-4 sm:p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-6xl">
          
          {/* Tone Selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 bg-white/40 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm">
                {TONES.map((t) => (
                    <button
                        key={t}
                        onClick={() => setSelectedTone(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            selectedTone === t 
                            ? 'bg-white text-fuchsia-600 shadow-md' 
                            : 'text-slate-600 hover:bg-white/50'
                        }`}
                    >
                       {t === 'Standard' ? 'Std' : t}
                    </button>
                ))}
            </div>
          </div>

          {/* Language Controls */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-2 mb-8 flex flex-col md:flex-row items-center justify-between gap-2 max-w-3xl mx-auto transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex-1 w-full p-2">
              <LanguageSelector 
                label="From" 
                selected={sourceLang} 
                onChange={setSourceLang} 
              />
            </div>
            
            <button 
              onClick={handleSwapLanguages}
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:rotate-180 transition-all duration-500 text-slate-400 hover:text-fuchsia-600 border border-slate-100 z-10"
              title="Swap Languages"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>

            <div className="flex-1 w-full p-2">
              <LanguageSelector 
                label="To" 
                selected={targetLang} 
                onChange={setTargetLang} 
              />
            </div>
          </div>

          {/* Main Translation Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
            
            {/* Source Card */}
            <div className="group relative bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 flex flex-col h-[300px] md:h-[500px] overflow-hidden focus-within:ring-2 focus-within:ring-fuchsia-500/30 transition-all duration-300 hover:shadow-fuchsia-500/10">
              <div className="flex-grow relative">
                <textarea
                  className="w-full h-full p-6 md:p-8 text-xl md:text-2xl text-slate-700 resize-none outline-none placeholder:text-slate-300 bg-transparent leading-relaxed"
                  placeholder="Type or speak to translate..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  spellCheck="false"
                  autoFocus
                />
                
                <div className="absolute top-4 right-4 flex space-x-2">
                   {/* Mic Button */}
                   <button 
                     onClick={toggleListening}
                     className={`p-2 rounded-full transition-all duration-300 ${
                        isListening 
                        ? 'bg-red-50 text-red-500 animate-pulse ring-2 ring-red-200' 
                        : 'hover:bg-slate-100 text-slate-300 hover:text-fuchsia-500'
                     }`}
                     title="Voice Input"
                   >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                   </button>

                    {inputText && (
                    <button 
                        onClick={() => {
                        setInputText('');
                        latestTextRef.current = ''; 
                        setTranslatedText('');
                        }}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    )}
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100/50 flex justify-between items-center text-sm text-slate-400">
                 <span className="font-medium">{inputText.length} chars</span>
                 {status === TranslationStatus.TRANSLATING && (
                   <span className="flex items-center text-fuchsia-500 animate-pulse">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                   </span>
                 )}
              </div>
            </div>

            {/* Target Card */}
            <div className="relative bg-gradient-to-br from-slate-50/90 to-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 flex flex-col h-[300px] md:h-[500px] overflow-hidden transition-all duration-300 hover:shadow-cyan-500/10">
              <div className="flex-grow p-6 md:p-8 relative">
                 {/* Loading Overlay */}
                 {status === TranslationStatus.TRANSLATING && (
                   <div className="absolute top-6 right-6">
                      <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-ping"></div>
                   </div>
                 )}
                 
                 {translatedText ? (
                    <textarea 
                      readOnly
                      value={translatedText}
                      className="w-full h-full text-xl md:text-2xl text-slate-800 bg-transparent resize-none outline-none leading-relaxed"
                    />
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-slate-300 select-none">
                     <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                     <span className="text-lg font-medium">Translation appears here</span>
                   </div>
                 )}
                 
                 {/* Tone Indicator */}
                 {translatedText && selectedTone !== 'Standard' && (
                     <div className="absolute bottom-20 right-8 opacity-50 pointer-events-none">
                         <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-300 flex items-center gap-1">
                            <Wand2 className="w-3 h-3" /> {selectedTone}
                         </span>
                     </div>
                 )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-slate-100/50 flex justify-end space-x-3 bg-white/30">
                <button
                  onClick={handleSpeak}
                  disabled={!translatedText || isSpeaking}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-fuchsia-50 text-slate-600 hover:text-fuchsia-600 shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  title="Listen"
                >
                  {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={handleCopy}
                  disabled={!translatedText}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white hover:bg-cyan-50 text-slate-600 hover:text-cyan-600 shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                  title="Copy"
                >
                  {copySuccess ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

          </div>
          
          {status === TranslationStatus.ERROR && (
            <div className="mt-6 text-center animate-fade-in-up">
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-sm shadow-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Connection interrupted. Please try again.
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-8 text-center text-slate-400/60 text-sm font-medium relative z-10">
        <p>© {new Date().getFullYear()} LinguaFlow.</p>
      </footer>
    </div>
  );
};

export default App;

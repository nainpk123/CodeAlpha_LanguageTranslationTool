import React from 'react';
import { Waves } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-white/30 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer select-none">
          <div className="bg-gradient-to-br from-fuchsia-500 to-cyan-500 p-2.5 rounded-xl shadow-lg shadow-fuchsia-500/20 group-hover:shadow-fuchsia-500/40 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Waves className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 group-hover:from-fuchsia-600 group-hover:to-cyan-600 transition-all duration-300">
            LinguaFlow
          </h1>
        </div>
        <div className="hidden sm:flex items-center space-x-4">
           <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Real-time Translation</span>
        </div>
      </div>
    </header>
  );
};
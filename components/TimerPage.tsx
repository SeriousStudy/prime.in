
import React from 'react';
import Timer from './Timer';
import MusicPlayer from './MusicPlayer';

interface TimerPageProps {
  onBack: () => void;
}

const TimerPage: React.FC<TimerPageProps> = ({ onBack }) => {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-6 sm:p-12 animate-fade">
      <div className="max-w-[1200px] w-full space-y-12">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="group flex items-center space-x-4 transition-all">
            <div className="w-12 h-12 rounded-full border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
              ←
            </div>
            <span className="font-black text-[10px] uppercase tracking-[0.4em] text-indigo-500 opacity-60 group-hover:opacity-100">Exit Command Node</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <MusicPlayer />
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Active Environment</p>
              <p className="text-sm font-black text-indigo-500 uppercase">Focus Protocol</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-center sm:text-left">
          <h2 className="text-6xl sm:text-9xl font-black tracking-tighter leading-none italic">
            COMMAND <br/>
            <span className="text-indigo-600">CENTER.</span>
          </h2>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] opacity-30">Concentration Engine • Manual Audit Mode</p>
        </div>

        <div className="stagger-in">
          <Timer />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-in">
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Focus Stability</p>
             <p className="text-2xl font-black">98.4%</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Ambient Sync</p>
             <p className="text-2xl font-black uppercase">Active</p>
          </div>
          <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-2">Neural Load</p>
             <p className="text-2xl font-black">Optimal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimerPage;

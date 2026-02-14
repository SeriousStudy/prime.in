
import React, { useState, useEffect, useRef } from 'react';

const PRESETS = [
  { label: 'Paper Simulation', mins: 180, icon: '📄' },
  { label: 'Audit / Correction', mins: 45, icon: '⚖️' },
  { label: 'Deep Focus Sprint', mins: 25, icon: '🔥' },
  { label: 'Tactical Break', mins: 10, icon: '☕' },
];

const Timer: React.FC = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const [duration, setDuration] = useState(180); 
  const [timeLeft, setTimeLeft] = useState(180 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activePreset, setActivePreset] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 0) {
            setIsRunning(false);
            new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play().catch(() => {});
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectPreset = (idx: number) => {
    if (isRunning) return;
    setActivePreset(idx);
    setDuration(PRESETS[idx].mins);
    setTimeLeft(PRESETS[idx].mins * 60);
  };

  const progress = (timeLeft / (duration * 60)) * 100;

  return (
    <div className={`w-full apple-card p-8 sm:p-12 flex flex-col space-y-10 transition-all duration-1000 border-2 ${isRunning ? 'timer-active border-indigo-500/50' : 'border-indigo-500/10'}`}>
      <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
        {/* LEFT: TIME DISPLAY */}
        <div className="flex flex-col items-center xl:items-start text-center xl:text-left space-y-2">
          <div className="flex items-center space-x-3 mb-2">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-indigo-500 animate-ping' : 'bg-zinc-400'}`}></span>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">
              {isRunning ? 'Protocol Execution Active' : 'Standby Mode'}
            </h3>
          </div>
          <p className="text-8xl sm:text-[9rem] font-black tabular-nums tracking-tighter leading-none text-current">
            {formatTime(timeLeft)}
          </p>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-30">
            {PRESETS[activePreset].label}
          </p>
        </div>

        {/* CENTER: PRESET GRID */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {PRESETS.map((p, i) => (
            <button
              key={p.label}
              disabled={isRunning}
              onClick={() => selectPreset(i)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between aspect-[1.5/1] ${
                activePreset === i 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl scale-105' 
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-40 hover:opacity-100'
              } disabled:opacity-20`}
            >
              <span className="text-xl">{p.icon}</span>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest">{p.label}</p>
                <p className="text-xs font-bold">{p.mins}M</p>
              </div>
            </button>
          ))}
        </div>

        {/* RIGHT: MAIN CONTROLS */}
        <div className="flex flex-col items-center space-y-6">
           <div className="flex space-x-3">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center space-y-1 transition-all shadow-2xl ${
                  isRunning 
                  ? 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200' 
                  : 'bg-indigo-600 text-white shadow-indigo-500/40 hover:scale-110 active:scale-95'
                }`}
              >
                <span className="text-3xl">{isRunning ? '❙❙' : '▶'}</span>
                <span className="text-[8px] font-black uppercase tracking-widest">{isRunning ? 'HOLD' : 'LAUNCH'}</span>
              </button>
              
              <button 
                onClick={() => { setIsRunning(false); setTimeLeft(duration * 60); }}
                className={`w-14 h-14 rounded-full flex items-center justify-center border self-end mb-2 transition-all ${isDark ? 'border-white/10 hover:bg-white/5 text-white/40' : 'border-black/5 hover:bg-black/5 text-black/40'}`}
                title="Reset Cycle"
              >
                ↺
              </button>
           </div>
        </div>
      </div>

      {/* FOOTER: PROGRESS & STATUS */}
      <div className="space-y-4">
        <div className="relative w-full h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(99,102,241,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] opacity-20 px-1">
          <span>00:00:00 Start</span>
          <div className="flex items-center space-x-4">
             <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span> Focus Sync</span>
             <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> Health Check</span>
          </div>
          <span>Target End</span>
        </div>
      </div>
    </div>
  );
};

export default Timer;

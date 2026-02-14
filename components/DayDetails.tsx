
import React, { useMemo, useEffect, useState } from 'react';
import { DayProgress } from '../types';
import Timer from './Timer';
import LiveConsultant from './LiveConsultant';

interface DayDetailsProps {
  day: DayProgress;
  onBack: () => void;
  onToggleTask: (dayNum: number, sessionId: string, taskId: string) => void;
  onUpdateMistakes: (dayNum: number, value: string) => void;
  onUpdateMarks: (dayNum: number, score: number) => void;
  onDayComplete: () => void;
}

const DayDetails: React.FC<DayDetailsProps> = ({ day, onBack, onToggleTask, onUpdateMistakes, onUpdateMarks, onDayComplete }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const [localMarks, setLocalMarks] = useState(day.marks?.toString() || '0');
  const [isAiActive, setIsAiActive] = useState(false);

  // One session/task logic
  const mainSession = day.sessions[0];
  const mainTask = mainSession?.tasks[0];
  const isCompleted = mainTask?.completed || false;

  useEffect(() => {
    if (isCompleted) {
      onDayComplete();
    }
  }, [isCompleted, onDayComplete]);

  const handleMarksBlur = () => {
    const val = parseInt(localMarks);
    if (!isNaN(val)) {
      const finalVal = Math.min(80, Math.max(0, val));
      setLocalMarks(finalVal.toString());
      onUpdateMarks(day.dayNumber, finalVal);
    }
  };

  if (isAiActive) {
    return (
      <LiveConsultant 
        onBack={() => setIsAiActive(false)} 
        context={`The user scored ${day.marks}/80 on Day ${day.dayNumber}. Their recorded mistakes are: "${day.mistakes}". Provide high-level technical accountancy feedback.`} 
      />
    );
  }

  return (
    <div className="space-y-12 animate-fade max-w-[1200px] mx-auto pb-48 px-4 pt-12">
      {/* NAVIGATION & STATUS */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center space-x-3 group transition-all">
          <div className="w-10 h-10 rounded-full border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">←</div>
          <span className="font-black text-[10px] uppercase tracking-[0.4em] opacity-40 group-hover:opacity-100 transition-all text-indigo-500">System Return</span>
        </button>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-30">Protocol Phase</p>
            <p className="text-sm font-black text-indigo-500">Day {day.dayNumber}</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl ${isCompleted ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-indigo-600 shadow-indigo-500/20'}`}>
            {isCompleted ? '✓' : day.dayNumber}
          </div>
        </div>
      </div>

      {/* WORKSPACE HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
        <div className="space-y-4">
          <h2 className="text-7xl sm:text-9xl font-black tracking-tighter leading-[0.8] italic">
             MISSION <br/>
             <span className="text-indigo-600">CRITICAL.</span>
          </h2>
          <p className="text-[12px] font-black uppercase tracking-[0.6em] opacity-30">Execution Node • Feb {day.dayNumber}, 2026</p>
        </div>
        <div className="pb-4 border-l-4 border-indigo-500 pl-8">
           <p className="text-lg font-bold opacity-60 leading-relaxed max-w-md italic">
             "Precision is the difference between an asset and a liability. Execute the protocol, audit the variance, and master the ledger."
           </p>
        </div>
      </div>

      {/* TASK EXECUTION & SCORING */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className={`xl:col-span-8 apple-card p-10 sm:p-16 border-2 transition-all duration-700 ${isCompleted ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-indigo-500/10'}`}>
          <div className="flex flex-col space-y-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10">
              <div className="space-y-3">
                <h3 className="text-4xl font-black tracking-tight uppercase">Execute Paper Simulation</h3>
                <p className="text-xs font-bold opacity-50 max-w-sm">Strict 3-hour window. Use the command center presets for precision timing.</p>
              </div>
              
              <button 
                onClick={() => onToggleTask(day.dayNumber, mainSession.id, mainTask.id)}
                className={`flex items-center space-x-8 px-10 py-6 rounded-[3rem] border-2 transition-all group ${isCompleted ? 'bg-emerald-500 border-emerald-400 text-white shadow-2xl shadow-emerald-500/30' : 'border-indigo-500/20 hover:border-indigo-500 hover:scale-105'}`}
              >
                <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-white/20 border-white' : 'border-indigo-500/30 group-hover:bg-indigo-500/10'}`}>
                  {isCompleted ? <span className="text-3xl">✓</span> : <span className="text-xl">!</span>}
                </div>
                <div className="text-left pr-4">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mission Status</p>
                  <p className="text-lg font-black uppercase tracking-tight">{isCompleted ? 'Success' : 'Ready'}</p>
                </div>
              </button>
            </div>

            <div className="h-px bg-indigo-500/10 w-full"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-12">
              <div className="flex-1 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">Post-Simulation Audit</h4>
                <p className="text-sm font-bold opacity-60">Enter your score out of 80 to update your Performance Momentum graph.</p>
              </div>
              
              <div className="relative group flex items-center">
                <p className="absolute -top-8 right-0 text-[10px] font-black uppercase tracking-widest text-indigo-500 opacity-0 group-focus-within:opacity-100 transition-opacity">FINAL MARKER / 80</p>
                <input 
                  type="number" 
                  value={localMarks}
                  onChange={(e) => setLocalMarks(e.target.value)}
                  onBlur={handleMarksBlur}
                  className="bg-transparent text-[8rem] sm:text-[12rem] font-black text-indigo-600 w-56 text-right outline-none tracking-tighter hover:scale-105 transition-all focus:text-indigo-500"
                />
                <span className="text-4xl font-black opacity-10 translate-y-12 ml-4">/ 80</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-10">
          <section className="apple-card p-10 sm:p-12 border border-indigo-500/10 bg-black/5 flex flex-col h-full relative group">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Strategic Variance</h3>
                <p className="text-[9px] font-bold uppercase opacity-30 tracking-[0.3em] mt-1">Logic Errors & Concept Gaps</p>
              </div>
              <button 
                onClick={() => setIsAiActive(true)}
                className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center shadow-xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all group/ai"
              >
                <span className="text-xl animate-pulse">◈</span>
                <span className="text-[6px] font-black mt-1">LIVE AI</span>
              </button>
            </div>
            
            <textarea 
              placeholder="List variances (errors), identify weak accounts (e.g., Cash Flow, Partners), and document logical gaps experienced during the simulation..." 
              value={day.mistakes} 
              onChange={(e) => onUpdateMistakes(day.dayNumber, e.target.value)} 
              className={`flex-1 w-full min-h-[350px] rounded-[2.5rem] p-8 outline-none transition-all font-bold text-sm leading-relaxed border-2 ${isDark ? 'bg-zinc-950 border-white/5 focus:border-indigo-500/40' : 'bg-white border-black/5 focus:border-indigo-500'}`} 
            />
            
            <div className="mt-8 flex items-center justify-between">
               <div className="flex items-center space-x-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                 <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">Protocol Sync: Active</span>
               </div>
               <button 
                  onClick={() => setIsAiActive(true)}
                  className="text-[9px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-500/5 px-4 py-2 rounded-full hover:bg-indigo-500/10 transition-all"
               >
                 Activate AI Auditor
               </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DayDetails;

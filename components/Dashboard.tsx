
import React, { useMemo } from 'react';
import { UserProgress, VitalityStats } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { RANKS } from '../constants';
import VitalityMonitor from './VitalityMonitor';

interface DashboardProps {
  progress: UserProgress;
  unlockedDay: number;
  onSelectDay: (day: number) => void;
  onOpenSupport: () => void;
  onOpenTimer: () => void;
  onUpdateVitals: (v: Partial<VitalityStats>) => void;
  onAboutClick: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ progress, unlockedDay, onSelectDay, onOpenSupport, onOpenTimer, onUpdateVitals }) => {
  const isDark = document.documentElement.classList.contains('dark');
  
  const currentRankInfo = useMemo(() => {
    const totalPoints = progress.points;
    const rank = RANKS.find(r => r.name === progress.rank) || RANKS[0];
    const rankIndex = RANKS.indexOf(rank);
    const nextRank = RANKS[rankIndex + 1] || rank;
    const diff = nextRank.threshold - rank.threshold;
    const progressToNext = diff > 0 ? ((totalPoints - rank.threshold) / diff) * 100 : 100;
    return { ...rank, progressToNext: Math.min(progressToNext, 100) };
  }, [progress]);

  const avgScore = useMemo(() => {
    const scores = progress.days.map(d => d.marks || 0).filter(s => s > 0);
    if (scores.length === 0) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  }, [progress.days]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pb-48 space-y-8 pt-6">
      <div className="grid grid-cols-12 gap-8 stagger-in">
        <div className={`col-span-12 xl:col-span-9 p-10 sm:p-20 rounded-[3rem] border apple-card relative overflow-hidden flex flex-col justify-between ${isDark ? 'bg-zinc-950/50' : 'bg-white'}`}>
          <div className="relative z-10">
            <h2 className={`text-6xl sm:text-[9.5rem] font-black tracking-tighter leading-[0.8] mb-12 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
               9 DAY <br/> 
               <span className="text-indigo-500 italic">GRIND.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
               <div className="space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                    <span>Protocol Level: {currentRankInfo.name}</span>
                    <span>{Math.round(currentRankInfo.progressToNext)}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-[2s]" style={{ width: `${currentRankInfo.progressToNext}%` }}></div>
                  </div>
               </div>
               <div className="flex items-center space-x-12">
                  <div>
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em] mb-1">Avg Score (80)</p>
                    <p className="text-4xl sm:text-6xl font-black tabular-nums text-indigo-500">{avgScore}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap gap-4 relative z-10">
             <button onClick={() => onSelectDay(unlockedDay)} className="px-12 py-6 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Day {unlockedDay} Protocol</button>
             <button onClick={onOpenTimer} className={`px-10 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.4em] border border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/5 transition-all`}>Launch Command Center</button>
             <button onClick={onOpenSupport} className={`px-10 py-6 rounded-full font-black text-[10px] uppercase tracking-[0.4em] border transition-all ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>Protocol Assistant</button>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-6 flex flex-col">
           <VitalityMonitor vitals={progress.vitals} onUpdate={onUpdateVitals} />
           <div className={`flex-1 p-8 rounded-[3rem] border apple-card ${isDark ? 'bg-zinc-950/50' : 'bg-white shadow-2xl'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8">Grid Timeline</h3>
              <div className="grid grid-cols-3 gap-3">
                 {progress.days.map(d => (
                   <button 
                    key={d.dayNumber} 
                    onClick={() => onSelectDay(d.dayNumber)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all ${
                      d.dayNumber === unlockedDay ? 'bg-indigo-600 text-white border-indigo-500 scale-105 shadow-xl' :
                      d.marks && d.marks > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      'bg-zinc-100 dark:bg-white/5 border-transparent text-current opacity-40 hover:opacity-100'
                    }`}
                   >
                     <span className="text-[8px] font-black">{d.dayNumber}</span>
                     {d.marks ? <span className="text-[10px] font-black mt-1">{d.marks}</span> : null}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <div className={`p-10 sm:p-12 rounded-[4rem] border apple-card stagger-in ${isDark ? 'bg-zinc-950/50' : 'bg-white shadow-2xl'}`}>
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-10">Performance Momentum</h3>
        <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={progress.days.map(d => ({ day: d.dayNumber, score: d.marks || 0 }))}>
                 <defs>
                   <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={6} fillOpacity={1} fill="url(#colorScore)" />
                 <XAxis dataKey="day" hide />
                 <YAxis hide domain={[0, 80]} />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DayProgress, UserProgress, UserRank, VitalityStats } from './types';
import { generateDefaultSessions, RANKS, MOTIVATIONAL_THOUGHTS, START_DATE } from './constants';
import Dashboard from './components/Dashboard';
import DayDetails from './components/DayDetails';
import Header from './components/Header';
import Confetti from './components/Confetti';
import Login from './components/Login';
import SupportChat from './components/SupportChat';
import CasualChat from './components/CasualChat';
import About from './components/About';
import TimerPage from './components/TimerPage';

const DEFAULT_VITALS: VitalityStats = {
  energy: 85,
  focus: 90,
  hydration: 0,
  sleep: 8
};

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('is_logged_in') === 'true');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [currentView, setCurrentView] = useState<{ type: 'dashboard' | 'day' | 'support' | 'timer'; dayNum?: number; initialContext?: string }>({ type: 'dashboard' });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme_preference') === 'dark' || localStorage.getItem('theme_preference') === null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const storageKey = 'wprime_9day_protocol_v2';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      const initialDays: DayProgress[] = Array.from({ length: 9 }, (_, i) => {
        const d = new Date(START_DATE);
        d.setDate(START_DATE.getDate() + i);
        const dayNum = 15 + i;
        return {
          dayNumber: dayNum,
          dateString: d.toISOString(),
          sessions: generateDefaultSessions(dayNum, d),
          mistakes: "",
          marks: 0
        };
      });
      const newProgress: UserProgress = {
        startDate: START_DATE.toISOString(),
        days: initialDays,
        points: 0,
        streak: 0,
        rank: UserRank.BEGINNER,
        lastVisitDate: new Date().toISOString(),
        vitals: DEFAULT_VITALS
      };
      setProgress(newProgress);
    }
  }, []);

  useEffect(() => {
    if (progress) localStorage.setItem('wprime_9day_protocol_v2', JSON.stringify(progress));
  }, [progress]);

  const handleToggleTask = useCallback((dayNum: number, sessionId: string, taskId: string) => {
    setProgress(prev => {
      if (!prev) return null;
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber !== dayNum) return day;
        const updatedSessions = day.sessions.map(session => {
          if (session.id !== sessionId) return session;
          const updatedTasks = session.tasks.map(task => {
            if (task.id !== taskId) return task;
            return { ...task, completed: !task.completed };
          });
          const allCompleted = updatedTasks.every(t => t.completed);
          return { ...session, tasks: updatedTasks, completed: allCompleted };
        });
        return { ...day, sessions: updatedSessions };
      });
      const totalCompletedSessions = updatedDays.reduce((acc, d) => acc + d.sessions.filter(s => s.completed).length, 0);
      const newPoints = totalCompletedSessions * 100;
      let newRank = UserRank.BEGINNER;
      for (const r of RANKS) {
        if (newPoints >= r.threshold) newRank = r.name;
      }
      return { ...prev, days: updatedDays, points: newPoints, rank: newRank };
    });
  }, []);

  const handleUpdateMarks = useCallback((dayNum: number, score: number) => {
    setProgress(prev => {
      if (!prev) return null;
      const newDays = prev.days.map(day => {
        if (day.dayNumber !== dayNum) return day;
        return { ...day, marks: score };
      });
      return { ...prev, days: newDays };
    });
  }, []);

  const handleUpdateMistakes = useCallback((dayNum: number, value: string) => {
    setProgress(prev => {
      if (!prev) return null;
      const newDays = prev.days.map(day => {
        if (day.dayNumber !== dayNum) return day;
        return { ...day, mistakes: value };
      });
      return { ...prev, days: newDays };
    });
  }, []);

  const updateVitals = useCallback((v: Partial<VitalityStats>) => {
    setProgress(p => p ? ({ ...p, vitals: { ...p.vitals, ...v } }) : null);
  }, []);

  const unlockedDay = useMemo(() => {
    const today = new Date();
    const start = new Date(START_DATE);
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(15 + diff, 15), 23);
  }, []);

  const handleCommand = (e?: React.FormEvent, overrideCmd?: string) => {
    e?.preventDefault();
    const cmd = (overrideCmd || searchQuery).toLowerCase().trim();
    setSearchQuery('');
    setSearchOpen(false);

    if (cmd === 'reset') {
      if(confirm("Purge Wprime protocol data?")) { 
        localStorage.clear(); 
        window.location.reload(); 
      }
      return;
    }
    if (cmd === 'support' || cmd === 'help' || cmd === 'wprime') { setCurrentView({ type: 'support' }); return; }
    if (cmd === 'theme' || cmd === 'mode') { setIsDarkMode(!isDarkMode); return; }
    if (cmd === 'about' || cmd === 'piyush') { setAboutOpen(true); return; }
    if (cmd === 'home' || cmd === 'dashboard') { setCurrentView({ type: 'dashboard' }); return; }
    if (cmd === 'timer' || cmd === 'focus' || cmd === 'command') { setCurrentView({ type: 'timer' }); return; }
    
    const dayMatch = cmd.match(/day\s*(\d+)/i) || cmd.match(/^(\d+)$/);
    if (dayMatch) {
      const num = parseInt(dayMatch[1]);
      if (num >= 15 && num <= 23) {
        setCurrentView({ type: 'day', dayNum: num });
      }
    }
  };

  if (!isLoggedIn) return <Login onLogin={(p) => { setUserProfile(p); localStorage.setItem('user_profile', JSON.stringify(p)); localStorage.setItem('is_logged_in', 'true'); setIsLoggedIn(true); }} isDarkMode={isDarkMode} />;
  if (!progress) return null;

  return (
    <div className={`min-h-screen transition-all duration-1000 ${isDarkMode ? 'bg-black text-white' : 'bg-[#fbfbfd] text-zinc-950'}`}>
      <Header 
        points={progress.points} 
        rank={progress.rank} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        resetProgress={() => {}}
        quote={MOTIVATIONAL_THOUGHTS[0]}
        userProfile={userProfile}
        onSearchClick={() => setSearchOpen(true)}
        onAboutClick={() => setAboutOpen(true)}
      />
      
      <main className="w-full mx-auto relative">
        {currentView.type === 'dashboard' ? (
          <Dashboard 
            progress={progress} 
            unlockedDay={unlockedDay} 
            onSelectDay={(n) => setCurrentView({ type: 'day', dayNum: n })} 
            onOpenSupport={() => setCurrentView({ type: 'support' })} 
            onOpenTimer={() => setCurrentView({ type: 'timer' })}
            onUpdateVitals={updateVitals} 
            onAboutClick={() => setAboutOpen(true)} 
          />
        ) : currentView.type === 'day' ? (
          <DayDetails 
            day={progress.days.find(d => d.dayNumber === currentView.dayNum)!} 
            onBack={() => setCurrentView({ type: 'dashboard' })} 
            onToggleTask={handleToggleTask} 
            onUpdateMistakes={handleUpdateMistakes} 
            onUpdateMarks={handleUpdateMarks}
            onDayComplete={() => setShowCelebration(true)} 
          />
        ) : currentView.type === 'timer' ? (
          <TimerPage onBack={() => setCurrentView({ type: 'dashboard' })} />
        ) : (
          <SupportChat onBack={() => setCurrentView({ type: 'dashboard' })} initialMessage={currentView.initialContext} />
        )}
      </main>

      {searchOpen && (
        <div className="fixed inset-0 z-[300] backdrop-blur-3xl bg-black/60 flex items-start justify-center pt-[10vh] px-4" onClick={() => setSearchOpen(false)}>
           <div className={`w-full max-w-2xl rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-pop ${isDarkMode ? 'bg-zinc-950 border border-white/10' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
              <form onSubmit={handleCommand}>
                <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Wprime Command..." className="w-full bg-transparent border-none outline-none text-3xl sm:text-5xl font-black placeholder:opacity-5 text-current mb-8" />
              </form>
              <div className="space-y-2 max-h-[40vh] overflow-y-auto hide-scrollbar">
                {[
                  { id: '0', label: 'Command Center (Timer)', cmd: 'timer' },
                  { id: '1', label: 'Day 15-23 Protocol', cmd: '15' },
                  { id: '2', label: 'Wprime Support', cmd: 'help' },
                  { id: '3', label: 'Export Protocol', cmd: 'export' },
                  { id: '4', label: 'Theme Toggle', cmd: 'theme' }
                ].filter(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()) || s.cmd.includes(searchQuery.toLowerCase())).map(s => (
                  <button key={s.id} onClick={() => handleCommand(undefined, s.cmd)} className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border ${isDarkMode ? 'hover:bg-white/5 border-transparent' : 'hover:bg-black/5 border-transparent'}`}>
                    <span className="text-sm font-black uppercase tracking-widest">{s.label}</span>
                    <span className="text-[10px] opacity-40 font-mono">[{s.cmd}]</span>
                  </button>
                ))}
              </div>
           </div>
        </div>
      )}

      {aboutOpen && <About onClose={() => setAboutOpen(false)} />}
      <CasualChat />
      {showCelebration && <Confetti />}
    </div>
  );
};

export default App;

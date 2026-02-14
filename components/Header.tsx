
import React, { useState, useEffect } from 'react';
import { MOTIVATIONAL_THOUGHTS } from '../constants';

interface HeaderProps {
  points: number;
  rank: string;
  isDarkMode: boolean;
  setIsDarkMode: (v: boolean) => void;
  resetProgress: () => void;
  quote: string;
  userProfile?: { name: string; picture: string } | null;
  onSearchClick: () => void;
  onAboutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  points, 
  rank, 
  isDarkMode, 
  setIsDarkMode, 
  onSearchClick, 
  onAboutClick,
  userProfile 
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentThoughtIndex, setCurrentThoughtIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const thoughtTimer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentThoughtIndex(Math.floor(Math.random() * MOTIVATIONAL_THOUGHTS.length));
        setFade(true);
      }, 800);
    }, 60000);
    return () => clearInterval(thoughtTimer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  return (
    <header className={`sticky top-0 z-[100] w-full border-b transition-all duration-700 ${isDarkMode ? 'bg-black/95 border-white/5' : 'bg-white/95 border-black/5'} backdrop-blur-3xl shadow-sm`}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
             <span className="text-white font-black italic text-lg sm:text-xl">W</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-black tracking-widest leading-none uppercase text-current">WPRIME.</h1>
            <div className="flex items-center space-x-2 mt-1">
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
               <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 opacity-80">Feb 15-23 Protocol</span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center justify-center border-x border-black/5 dark:border-white/5 px-10 h-full">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-1">{formattedDate}</p>
           <p className="text-xl font-black tabular-nums tracking-tighter uppercase">{formattedTime}</p>
        </div>

        <div className="hidden xl:flex items-center space-x-12 px-12 h-full">
           <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-current">XP</p>
              <p className="text-lg font-black tabular-nums text-indigo-600 leading-none mt-1">{points}</p>
           </div>
           <div className="text-center">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-current">Status</p>
              <p className="text-lg font-black uppercase tracking-tight text-current leading-none mt-1">{rank}</p>
           </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button onClick={onAboutClick} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}>ⓘ</button>
            <button onClick={onSearchClick} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-black/5 hover:bg-black/10 text-black'}`}>🔍</button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'bg-white text-black' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20'}`}>
              {isDarkMode ? '☼' : '☾'}
            </button>
          </div>
          {userProfile?.picture && <img src={userProfile.picture} className="w-8 h-8 rounded-full border border-indigo-500/20" alt="Profile" />}
        </div>
      </div>

      <div className={`w-full h-10 flex items-center justify-center overflow-hidden border-t ${isDarkMode ? 'bg-indigo-600/5 border-white/5' : 'bg-indigo-50 border-black/5'}`}>
         <div className={`flex items-center space-x-4 px-6 transition-all duration-700 transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded">DIRECTIVE</span>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] text-current/80">
              {MOTIVATIONAL_THOUGHTS[currentThoughtIndex]}
            </p>
         </div>
      </div>
    </header>
  );
};

export default Header;

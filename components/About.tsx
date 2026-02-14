
import React from 'react';

const About: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-10 animate-fade">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={onClose}></div>
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3.5rem] p-10 sm:p-16 border shadow-2xl hide-scrollbar ${isDark ? 'bg-zinc-950 border-white/5 text-white' : 'bg-white border-black/5 text-black'}`}>
        <button onClick={onClose} className="absolute top-10 right-10 text-3xl font-light hover:rotate-90 transition-transform">✕</button>
        <div className="space-y-16">
          <section>
            <div className="inline-flex items-center space-x-3 px-5 py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Wprime Protocol Architect</span>
            </div>
            <h2 className="text-6xl sm:text-8xl font-black tracking-tighter leading-[0.85] italic mb-6">MR. PIYUSH <br/><span className="text-blue-600">PANDEY.</span></h2>
            <p className="text-lg sm:text-xl font-bold opacity-40 uppercase tracking-widest leading-none">Developer & Lead Architect</p>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">The Wprime Mission</h4>
              <p className="text-sm font-bold opacity-60 italic">"Mr. Piyush built this website to forge a path to accounting mastery through discipline and manual practice. We eliminate the noise and focus on paper solving."</p>
            </div>
            <div className="space-y-8">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500">Protocol Features</h4>
              <ul className="space-y-4">
                {["9-Day Countdown", "Paper Marks Log (80)", "Weak Area Remediation"].map(f => (
                  <li key={f} className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest opacity-60">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-[8px] font-bold opacity-10 uppercase tracking-widest text-center pt-20">Established 2026 • Mr. Piyush Built This Website</p>
        </div>
      </div>
    </div>
  );
};

export default About;

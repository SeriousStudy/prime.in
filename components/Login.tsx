
import React, { useEffect, useRef, useState } from 'react';

interface LoginProps {
  onLogin: (profile: any) => void;
  isDarkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, isDarkMode }) => {
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showOverride, setShowOverride] = useState(false);

  useEffect(() => {
    const clientId = "62202277899-nmj96l8qmjilhm0q27c358aohr3iq255.apps.googleusercontent.com"; 

    const initializeGoogle = () => {
      const google = (window as any).google;
      if (google && google.accounts) {
        setIsScriptLoaded(true);
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (res: any) => {
              const token = res.credential;
              const payload = JSON.parse(atob(token.split('.')[1]));
              onLogin({
                name: payload.name,
                email: payload.email,
                picture: payload.picture
              });
            },
            auto_select: false,
            use_fedcm_for_prompt: false,
          });

          if (googleBtnRef.current) {
            google.accounts.id.renderButton(googleBtnRef.current, {
              theme: isDarkMode ? "filled_black" : "outline",
              size: "large",
              shape: "pill",
              width: 320,
              text: "continue_with",
            });
          }
        } catch (err) {
          setShowOverride(true);
        }
      }
    };

    const interval = setInterval(() => {
      if ((window as any).google) {
        initializeGoogle();
        clearInterval(interval);
      }
    }, 500);

    const timeout = setTimeout(() => setShowOverride(true), 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onLogin, isDarkMode]);

  const handleOverride = () => {
    onLogin({
      name: "Elite Candidate",
      email: "guest@protocol.elite",
      picture: "" 
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-1000 ${isDarkMode ? 'bg-black text-white' : 'bg-[#fafafa] text-zinc-950'}`}>
      <div className="max-w-md w-full text-center space-y-12">
        <div className="animate-fade">
          <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] mx-auto mb-10 flex items-center justify-center shadow-2xl shadow-blue-500/30 group cursor-pointer hover:rotate-12 transition-transform duration-500">
            <span className="text-white text-5xl font-black italic">A</span>
          </div>
          <h1 className="text-6xl font-black tracking-tighter mb-4">Elite Entry.</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] opacity-30 italic">Protocol Authentication v3.0</p>
        </div>

        <div className={`apple-card p-12 flex flex-col items-center border relative overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-black/5 shadow-2xl'}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
          
          <div className="mb-12 space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-600/20">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Secure Node Enabled</span>
            </div>
            <p className="text-xs font-medium opacity-60 max-w-[280px] mx-auto leading-relaxed">Verification required for 2026 Fiscal Command access.</p>
          </div>
          
          <div className="w-full space-y-4">
            <div ref={googleBtnRef} className={`${!isScriptLoaded ? 'hidden' : 'block animate-pop'}`}></div>
            
            {showOverride && (
              <button 
                onClick={handleOverride}
                className="w-full py-5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-blue-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                Enter as Guest Candidate
              </button>
            )}
          </div>

          {!isScriptLoaded && !showOverride && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-20">Authenticating Pulse...</p>
            </div>
          )}
        </div>

        <div className="opacity-10 text-[9px] font-black uppercase tracking-[0.4em]">
          Big Four Standard Study Suite
        </div>
      </div>
    </div>
  );
};

export default Login;

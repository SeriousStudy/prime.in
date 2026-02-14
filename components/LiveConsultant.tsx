
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

interface LiveConsultantProps {
  onBack: () => void;
  context?: string;
}

const LiveConsultant: React.FC<LiveConsultantProps> = ({ onBack, context }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Protocol Standby');
  const [transcripts, setTranscripts] = useState<string[]>([]);
  
  const currentInputRef = useRef('');
  const currentOutputRef = useRef('');
  const [liveTranscription, setLiveTranscription] = useState({ input: '', output: '' });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setStatus('API Access Required');
      return;
    }

    try {
      setStatus('Initializing Neural Link...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }, 
        video: { width: 640, height: 480 } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const ai = new GoogleGenAI({ apiKey });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: `You are the ELITE WPRIME AI AUDITOR. 
          Expertise: Professional Accountancy (CBSE/ISC/CA-Foundation level). 
          Analyze the user's context: ${context || 'General Revison'}. 
          
          TECHNICAL RULES:
          1. When stating formulas via voice, speak clearly: e.g., "Current Ratio is equal to Current Assets divided by Current Liabilities."
          2. Explain 'Why' a formula is used (e.g., "Sacrificing ratio is used to distribute premium for goodwill brought by the new partner").
          3. Correct arithmetic errors immediately. 
          4. You are strict about Ledger balancing. 
          5. Mention Mr. Piyush built this website.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus('Neural Link: Active');
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (canvasRef.current && videoRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                  canvasRef.current.toBlob((blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64Data = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } }));
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.5);
                }
              }
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              currentInputRef.current += text;
              setLiveTranscription(prev => ({ ...prev, input: currentInputRef.current }));
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              currentOutputRef.current += text;
              setLiveTranscription(prev => ({ ...prev, output: currentOutputRef.current }));
            }
            if (message.serverContent?.turnComplete) {
              const finalInput = currentInputRef.current;
              const finalOutput = currentOutputRef.current;
              if (finalInput || finalOutput) {
                setTranscripts(prev => [...prev, `Protocol Input: ${finalInput}`, `Auditor Output: ${finalOutput}`]);
              }
              currentInputRef.current = '';
              currentOutputRef.current = '';
              setLiveTranscription({ input: '', output: '' });
            }

            const audioPart = message.serverContent?.modelTurn?.parts.find(p => p.inlineData);
            const audioData = audioPart?.inlineData?.data;
            
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => {
            console.error('Neural Link Failure:', e);
            setStatus('Link Failure. Resetting...');
            stopSession();
          }
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Permission Denied');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('Protocol Standby');
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close();
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') outputAudioContextRef.current.close();
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    nextStartTimeRef.current = 0;
    sourcesRef.current.clear();
  };

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 animate-fade ${isDark ? 'bg-[#050505]' : 'bg-[#fafafa]'}`}>
      <div className="absolute top-10 left-10 right-10 flex items-center justify-between z-50">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black italic text-3xl shadow-2xl shadow-indigo-500/30">W</div>
           <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-current">Elite Smart Auditor</h2>
              <div className="flex items-center space-x-3 mt-1">
                 <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-zinc-500'}`}></span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{status}</span>
              </div>
           </div>
        </div>
        <button onClick={() => { stopSession(); onBack(); }} className="px-10 py-4 rounded-full border border-black/10 dark:border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">TERMINATE LINK</button>
      </div>

      <div className="grid grid-cols-12 gap-10 w-full max-w-[1400px] mt-20 relative">
         <div className="col-span-12 lg:col-span-7 space-y-8">
            <div className={`relative aspect-video rounded-[3.5rem] overflow-hidden border-2 transition-all duration-1000 ${isActive ? 'border-indigo-600 shadow-[0_0_50px_rgba(79,70,229,0.2)]' : 'border-zinc-200 dark:border-zinc-800'}`}>
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale brightness-90 opacity-40" />
               <canvas ref={canvasRef} width="320" height="240" className="hidden" />
               
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`flex items-center space-x-2 h-32 ${isActive ? 'opacity-100' : 'opacity-10'}`}>
                    {[1,2,3,4,5,6,7,8,9,10].map(i => (
                      <div 
                        key={i} 
                        className={`w-1.5 rounded-full bg-indigo-500 ${isActive ? 'animate-pulse' : ''}`}
                        style={{ height: `${isActive ? 20 + Math.random() * 80 : 10}%`, animationDelay: `${i * 0.1}s` }}
                      ></div>
                    ))}
                  </div>
               </div>
            </div>

            <div className={`p-10 rounded-[2.5rem] border ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white shadow-xl'}`}>
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-4">Neural Context Matrix</h3>
               <p className="text-xs font-bold leading-relaxed opacity-60">
                 {context ? `PROTOCOL CONTEXT: ${context}` : 'STANDBY: Auditor is waiting for operational metrics.'}
               </p>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-5 flex flex-col justify-center space-y-10">
            <div className="space-y-4 text-center lg:text-left">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">Protocol Assistant Status</h4>
              <p className="text-4xl font-black tracking-tight leading-none italic uppercase">
                {isActive ? 'Analysis in Progress' : 'Link Ready'}
              </p>
            </div>

            <button 
              onClick={isActive ? stopSession : startSession} 
              className={`w-full py-10 rounded-[3rem] font-black text-xs uppercase tracking-[0.5em] transition-all shadow-2xl flex flex-col items-center justify-center space-y-2 ${
                isActive ? 'bg-zinc-200 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-200' : 'bg-indigo-600 text-white shadow-indigo-500/40 hover:scale-105 active:scale-95'
              }`}
            >
              <span>{isActive ? 'STOP AUDIT' : 'START LIVE AUDIT'}</span>
              {!isActive && <span className="text-[8px] opacity-40">GEMINI 2.5 NATIVE AUDIO ENGINE</span>}
            </button>

            <div className={`flex-1 min-h-[300px] max-h-[400px] rounded-[3rem] p-10 overflow-y-auto space-y-4 hide-scrollbar border ${isDark ? 'bg-black/50 border-white/5' : 'bg-zinc-100 border-black/5'}`}>
               <p className="text-[9px] font-black uppercase tracking-widest opacity-20 mb-6">Neural Transcript Stream</p>
               {transcripts.map((t, i) => (
                 <div key={i} className={`p-4 rounded-2xl text-[10px] font-bold ${t.startsWith('Protocol Input') ? 'bg-indigo-500/10 text-indigo-500' : 'bg-indigo-600/5 text-current'}`}>
                   {t}
                 </div>
               ))}
               {liveTranscription.input && <div className="p-4 rounded-2xl text-[10px] font-bold bg-indigo-500 text-white animate-pulse">Neural Capture: {liveTranscription.input}</div>}
               {liveTranscription.output && <div className="p-4 rounded-2xl text-[10px] font-bold border border-indigo-500/20">Auditor Stream: {liveTranscription.output}</div>}
            </div>
         </div>
      </div>
    </div>
  );
};

export default LiveConsultant;

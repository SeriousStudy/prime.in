
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface Message {
  type: 'bot' | 'user';
  text: string;
}

const CasualChat: React.FC = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { type: 'bot', text: "Quick concept check or 80/80 motivation? I've got the formulas ready." }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are the WPRIME Sidekick. Provide short, technically accurate Accountancy tips. When giving a formula, use **Bold Text** and clear lines. Keep it punchy. Mr. Piyush built this.',
        },
      });
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatRef.current || isTyping) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessageStream({ message: userText });
      let fullResponse = "";
      
      setMessages(prev => [...prev, { type: 'bot', text: "" }]);
      
      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        fullResponse += (c.text || "");
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { type: 'bot', text: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'bot', text: "Sync failed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed z-[100] transition-all duration-500 ${isOpen ? 'inset-0 sm:inset-auto sm:bottom-8 sm:right-8' : 'bottom-8 right-8'}`}>
      {isOpen && (
        <div className={`flex flex-col h-full sm:h-[550px] w-full sm:w-[400px] sm:rounded-[3rem] shadow-2xl border animate-pop ${isDark ? 'bg-zinc-950 border-white/10' : 'bg-white border-black/5'}`}>
          <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-indigo-600 sm:rounded-t-[3rem] text-white">
            <div className="flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
              <p className="font-black text-xs uppercase tracking-widest">Protocol Sidekick</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform text-xl font-light">✕</button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-[2rem] border prose prose-sm dark:prose-invert ${
                  m.type === 'user' 
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' 
                  : isDark ? 'bg-zinc-800/50 border-white/5 text-white' : 'bg-zinc-100 border-black/5 text-black'
                }`}>
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                  {m.type === 'bot' && m.text === "" && <span className="animate-pulse">...</span>}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-6 border-t border-black/5 dark:border-white/5 bg-inherit/50 backdrop-blur-md">
            <input 
              value={input} 
              disabled={isTyping}
              onChange={(e) => setInput(e.target.value)} 
              placeholder={isTyping ? "Syncing..." : "Query the Protocol..."} 
              className="w-full py-4 px-6 rounded-full text-[11px] font-black uppercase tracking-widest outline-none border dark:bg-black dark:border-white/10 dark:text-white focus:border-indigo-500 transition-all disabled:opacity-50" 
            />
          </form>
        </div>
      )}

      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="w-16 h-16 rounded-full flex items-center justify-center bg-indigo-600 shadow-2xl text-white text-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-slow">
          💬
        </button>
      )}
    </div>
  );
};

export default CasualChat;

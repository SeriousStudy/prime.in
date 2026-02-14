
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const SupportChat: React.FC<{ onBack: () => void; initialMessage?: string }> = ({ onBack, initialMessage }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{ type: 'bot' | 'user', text: string }[]>([
    { type: 'bot', text: "Wprime Support Node active. Calibrated for Class 12 Accountancy. How can I assist with your paper logic?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<Chat | null>(null);

  useEffect(() => {
    // Only initialize if API_KEY is present to avoid crash
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `You are the ELITE WPRIME ACCOUNTANCY PROFESSOR. 
          Expertise: Partnership, Company Accounts, Cash Flow, Ratio Analysis.
          
          FORMULA PROTOCOL:
          1. Use clear Markdown formatting. 
          2. Example: **Sacrificing Ratio = Old Ratio - New Ratio**.
          3. Use code blocks for ledger entries.
          4. Show step-by-step working notes.
          5. Mention Mr. Piyush built this website.`,
        },
      });
    }
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || !chatRef.current) return;
    
    const userMsg = { type: 'user' as const, text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatRef.current.sendMessageStream({ message: text });
      let fullResponse = "";
      
      setMessages(prev => [...prev, { type: 'bot', text: "" }]);
      
      for await (const chunk of response) {
        const c = chunk as GenerateContentResponse;
        const newText = c.text || "";
        fullResponse += newText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { type: 'bot', text: fullResponse };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { type: 'bot', text: "Audit system failed. Check your API key or connection." }]);
    } finally {
      setIsTyping(false);
    }
  }, []);

  useEffect(() => {
    if (initialMessage && messages.length === 1) handleSendMessage(initialMessage);
  }, [initialMessage, handleSendMessage, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col animate-pop ${isDark ? 'bg-black text-white' : 'bg-[#fafafa] text-zinc-950'}`}>
      <div className="h-28 border-b border-white/5 flex items-center justify-between px-10 glass sticky top-0 bg-inherit/80">
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-3xl flex items-center justify-center text-white font-black italic shadow-2xl shadow-indigo-500/20 text-2xl">W</div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter uppercase">Wprime Professor</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Expert Logic Node</p>
          </div>
        </div>
        <button onClick={onBack} className="px-8 py-4 rounded-full border border-current font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Exit</button>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-12 space-y-8 hide-scrollbar pb-52">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-8 rounded-[2.5rem] text-[14px] leading-relaxed border prose dark:prose-invert ${
                m.type === 'user' ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' : isDark ? 'bg-white/5 border-white/10' : 'bg-white border-black/5'
              }`}>
                {/* Ensure children is always a string to prevent Error 31 */}
                <ReactMarkdown>{String(m.text || '')}</ReactMarkdown>
                {m.type === 'bot' && m.text === "" && <span className="animate-pulse">Processing Ledger...</span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="absolute bottom-10 left-10 right-10 p-2 glass bg-inherit/80 border border-black/5 dark:border-white/5 rounded-[3rem]">
          <form onSubmit={e => { e.preventDefault(); handleSendMessage(input); }} className="relative">
            <input 
              value={input} 
              disabled={isTyping}
              onChange={e => setInput(e.target.value)} 
              placeholder={isTyping ? "Calculating..." : "Query a formula..."} 
              className={`w-full py-7 px-10 rounded-full outline-none font-black text-sm transition-all ${isDark ? 'bg-black text-white focus:bg-zinc-900' : 'bg-white text-black focus:bg-zinc-50'}`} 
            />
            <button 
              type="submit" 
              disabled={isTyping}
              className={`absolute right-3 top-3 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold transition-transform hover:scale-105 active:scale-95 ${isTyping ? 'bg-zinc-500' : 'bg-indigo-600 shadow-xl'}`}
            >
              {isTyping ? '⌛' : '▶'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupportChat;

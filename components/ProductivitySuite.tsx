
import React, { useState, useMemo } from 'react';

interface ToolProps { onOpenAI: () => void; }

const ProductivitySuite: React.FC<ToolProps> = ({ onOpenAI }) => {
  const isDark = document.documentElement.classList.contains('dark');
  const [activeTool, setActiveTool] = useState('ledger');

  const [ledgerEntries, setLedgerEntries] = useState<{ id: number; amt: number; side: 'DR' | 'CR'; label: string }[]>([]);
  const [ledgerAmt, setLedgerAmt] = useState('');
  const [ledgerLabel, setLedgerLabel] = useState('');
  const [ca, setCa] = useState('');
  const [cl, setCl] = useState('');

  const tools = [
    { id: 'ledger', name: 'T-Ledger Node', icon: '📓', desc: 'Double-entry auditor' },
    { id: 'ratios', name: 'Ratio Intelligence', icon: '📊', desc: 'Liquidity & Solvency' },
    { id: 'partnership', name: 'PSR Allocator', icon: '🤝', desc: 'Gaining & Sacrificing' },
    { id: 'goodwill', name: 'Goodwill Valuer', icon: '💎', desc: 'Super Profit Engine' },
  ];

  const currentRatio = useMemo(() => {
    const a = parseFloat(ca), l = parseFloat(cl);
    return (l !== 0 && !isNaN(a)) ? (a / l).toFixed(2) : '0.00';
  }, [ca, cl]);

  const addLedgerEntry = (side: 'DR' | 'CR') => {
    const val = parseFloat(ledgerAmt);
    if (!isNaN(val)) {
      setLedgerEntries([...ledgerEntries, { id: Date.now(), amt: val, side, label: ledgerLabel || 'Journal' }]);
      setLedgerAmt('');
      setLedgerLabel('');
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6 lg:gap-10 items-start">
      <div className="col-span-12 lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
        <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[800px] pb-4 hide-scrollbar">
          {tools.map((t) => (
            <button 
              key={t.id} 
              onClick={() => setActiveTool(t.id)}
              className={`flex-shrink-0 w-64 lg:w-full p-6 rounded-[2rem] text-left transition-all flex items-center space-x-4 border ${
                activeTool === t.id 
                ? 'bg-blue-600 border-blue-500 text-white shadow-2xl' 
                : 'bg-white dark:bg-zinc-950 border-black/5 dark:border-white/5 hover:border-blue-500/50'
              }`}
            >
              <span className="text-2xl">{t.icon}</span>
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest">{t.name}</p>
                <p className="text-[8px] font-bold mt-1 opacity-50 truncate">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className={`col-span-12 lg:col-span-8 xl:col-span-9 p-8 sm:p-14 rounded-[3rem] border apple-card min-h-[600px] flex flex-col order-1 lg:order-2 ${isDark ? 'bg-zinc-950 border-white/5' : 'bg-white border-black/5'}`}>
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
               <h4 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic opacity-10">{activeTool.replace('_', ' ')} Node</h4>
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mt-2">Manual Calculation Protocol</p>
            </div>
            <button onClick={onOpenAI} className="px-8 py-4 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center space-x-2">
               <span>Protocol Help</span>
            </button>
         </div>

         <div className="flex-1">
           {activeTool === 'ledger' && (
             <div className="flex flex-col h-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                   <input value={ledgerLabel} onChange={e => setLedgerLabel(e.target.value)} placeholder="Narrative..." className={`p-5 rounded-2xl border outline-none font-bold text-sm ${isDark ? 'bg-black border-white/5' : 'bg-zinc-50 border-black/5'}`} />
                   <div className="flex space-x-2">
                      <input type="number" value={ledgerAmt} onChange={e => setLedgerAmt(e.target.value)} placeholder="Amt..." className={`w-full p-5 rounded-2xl border outline-none font-bold text-sm ${isDark ? 'bg-black border-white/5' : 'bg-zinc-50 border-black/5'}`} />
                      <button onClick={() => addLedgerEntry('DR')} className="px-6 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase">DR</button>
                      <button onClick={() => addLedgerEntry('CR')} className="px-6 rounded-2xl bg-zinc-600 text-white font-black text-[10px] uppercase">CR</button>
                   </div>
                </div>
                <div className="flex-1 grid grid-cols-2 divide-x-2 divide-black/5 dark:divide-white/10 min-h-[300px] overflow-y-auto mb-10 pr-2">
                   <div className="pr-10 text-right space-y-4">
                      {ledgerEntries.filter(e => e.side === 'DR').map(e => <div key={e.id} className="font-bold flex justify-between text-sm"><span>{e.label}</span> <span>{e.amt.toLocaleString()}</span></div>)}
                   </div>
                   <div className="pl-10 space-y-4">
                      {ledgerEntries.filter(e => e.side === 'CR').map(e => <div key={e.id} className="font-bold flex justify-between text-sm"><span>{e.amt.toLocaleString()}</span> <span>{e.label}</span></div>)}
                   </div>
                </div>
                <div className="p-10 rounded-[2.5rem] bg-zinc-100 dark:bg-black/40 border border-black/5 dark:border-white/5 flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase opacity-30">Status: Tracking</p>
                   <p className="text-5xl font-black text-blue-600">
                    {ledgerEntries.reduce((a,b) => a + (b.side==='DR' ? b.amt : -b.amt), 0).toLocaleString()}
                   </p>
                </div>
             </div>
           )}
           {activeTool === 'ratios' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-8">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Current Assets</p>
                      <input type="number" value={ca} onChange={e => setCa(e.target.value)} className={`w-full p-8 rounded-[2rem] border outline-none font-black text-2xl ${isDark ? 'bg-black border-white/5' : 'bg-zinc-50 border-black/5'}`} />
                   </div>
                   <div className="space-y-3">
                      <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Current Liabilities</p>
                      <input type="number" value={cl} onChange={e => setCl(e.target.value)} className={`w-full p-8 rounded-[2rem] border outline-none font-black text-2xl ${isDark ? 'bg-black border-white/5' : 'bg-zinc-50 border-black/5'}`} />
                   </div>
                </div>
                <div className="flex flex-col items-center justify-center p-16 rounded-[4rem] bg-blue-600/5 border-2 border-dashed border-blue-600/20 text-center">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-6">Current Ratio</p>
                   <p className="text-[10rem] font-black text-blue-600 tracking-tighter leading-none">{currentRatio}</p>
                </div>
             </div>
           )}
         </div>
      </div>
    </div>
  );
};

export default ProductivitySuite;

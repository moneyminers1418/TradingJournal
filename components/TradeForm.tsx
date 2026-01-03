
import React, { useState, useEffect, useRef } from 'react';
import { Trade, TradeType, AssetClass } from '../types';
import { FEELINGS } from '../constants';
// Added missing ArrowUpRight and ArrowDownRight icons from lucide-react
import { X, Check, Upload, Image as ImageIcon, Plus, Trash2, Clock, Calendar as CalendarIcon, Hash, Target, Brain, FileText, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TradeFormProps {
  initialData?: Trade | null;
  onSave: (trade: Trade) => void;
  onCancel: () => void;
  availableSetups: string[];
  availableRules?: string[];
  availableMistakes?: string[];
  onAddSetup: (newSetup: string) => void;
  onRemoveSetup: (setup: string) => void;
  onAddRule?: (newRule: string) => void;
  onRemoveRule?: (rule: string) => void;
  onAddMistake?: (newMistake: string) => void;
  onRemoveMistake?: (mistake: string) => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ 
  initialData, 
  onSave, 
  onCancel, 
  availableSetups, 
  onAddSetup, 
  onRemoveSetup,
  availableRules = [],
  availableMistakes = [],
  onAddRule,
  onRemoveRule,
  onAddMistake,
  onRemoveMistake
}) => {
  const [formData, setFormData] = useState<Partial<Trade>>({
    id: crypto.randomUUID(),
    entryDate: new Date().toISOString(),
    exitDate: '',
    symbol: '',
    type: TradeType.LONG,
    assetClass: AssetClass.STOCKS,
    entryPrice: 0,
    exitPrice: 0,
    quantity: 0,
    fees: 0,
    notes: '',
    setup: '',
    mistakes: [],
    followedSetup: true,
    entryReason: '',
    feeling: 'Calm',
    lessonLearned: '',
    tags: [],
    screenshot: ''
  });

  const [isAddingSetup, setIsAddingSetup] = useState(false);
  const [newSetupName, setNewSetupName] = useState('');
  
  const [isAddingMistake, setIsAddingMistake] = useState(false);
  const [newMistakeName, setNewMistakeName] = useState('');

  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [entryTimeConfirmed, setEntryTimeConfirmed] = useState(false);
  const [exitTimeConfirmed, setExitTimeConfirmed] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Only generate new ID for new trades, not when editing
      setFormData(prev => ({
        ...prev,
        id: crypto.randomUUID()
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (['entryPrice', 'exitPrice', 'quantity', 'fees'].includes(name)) {
        const numValue = value === '' ? 0 : parseFloat(value);
        setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'entryDate' | 'exitDate') => {
    const val = e.target.value;
    if (field === 'entryDate') setEntryTimeConfirmed(false);
    if (field === 'exitDate') setExitTimeConfirmed(false);
    setFormData(prev => ({
        ...prev,
        [field]: val ? new Date(val).toISOString() : ''
    }));
  };

  const handleMistakeToggle = (mistake: string) => {
    setFormData(prev => {
      const current = prev.mistakes || [];
      const updated = current.includes(mistake) 
        ? current.filter(m => m !== mistake)
        : [...current, mistake];
      return { ...prev, mistakes: updated };
    });
  };

  const calculatePnL = () => {
    if (!formData.entryPrice || !formData.exitPrice || !formData.quantity) return;
    let gross = formData.type === TradeType.LONG 
      ? (formData.exitPrice - formData.entryPrice) * formData.quantity
      : (formData.entryPrice - formData.exitPrice) * formData.quantity;
    const net = gross - (formData.fees || 0);
    setFormData(prev => ({ ...prev, pnl: parseFloat(net.toFixed(2)) }));
  };

  const handleAddSetupInline = () => {
    const name = newSetupName.trim();
    if (name) {
      onAddSetup(name);
      setFormData(prev => ({ ...prev, setup: name }));
      setNewSetupName('');
      setIsAddingSetup(false);
    }
  };

  const handleAddMistakeInline = () => {
    const name = newMistakeName.trim();
    if (name && onAddMistake) {
      onAddMistake(name);
      handleMistakeToggle(name);
      setNewMistakeName('');
      setIsAddingMistake(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags?.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag.startsWith('#') ? tag : `#${tag}`] }));
        setTagInput('');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Trade);
  };

  const getDateString = (isoString?: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : '';

  const netPnLValue = formData.pnl || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-scale-in">
        
        {/* Header */}
        <div className="flex justify-between items-center px-10 py-6 border-b border-gray-700 bg-gray-900 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {initialData ? 'Edit Trade Log' : 'New Journal Entry'}
              </h2>
              <p className="text-xs text-gray-500 font-mono tracking-widest uppercase">{formData.id?.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12 custom-scrollbar">
          
          {/* STEP 1: EXECUTION DATA */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold border border-blue-500/20">01</span>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Execution Data</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Symbol</label>
                <div className="relative">
                   <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                   <input name="symbol" required value={formData.symbol} onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})} className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-lg" placeholder="RELIANCE" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Asset Class</label>
                <select name="assetClass" value={formData.assetClass} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-[60px]">
                  {Object.values(AssetClass).map(ac => <option key={ac} value={ac}>{ac}</option>)}
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Direction</label>
                <div className="flex bg-gray-900 rounded-2xl p-1.5 border border-gray-700 h-[60px]">
                  <button type="button" onClick={() => setFormData({...formData, type: TradeType.LONG})} className={`flex-1 flex items-center justify-center gap-2 text-sm font-black rounded-xl transition-all ${formData.type === TradeType.LONG ? 'bg-trading-green text-white shadow-lg shadow-trading-green/20' : 'text-gray-500 hover:text-gray-300'}`}>
                    <ArrowUpRight size={18} /> LONG
                  </button>
                  <button type="button" onClick={() => setFormData({...formData, type: TradeType.SHORT})} className={`flex-1 flex items-center justify-center gap-2 text-sm font-black rounded-xl transition-all ${formData.type === TradeType.SHORT ? 'bg-trading-red text-white shadow-lg shadow-trading-red/20' : 'text-gray-500 hover:text-gray-300'}`}>
                    <ArrowDownRight size={18} /> SHORT
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Entry Timestamp</label>
                 <div className="flex gap-2">
                    <input type="datetime-local" name="entryDate" value={getDateString(formData.entryDate)} onChange={(e) => handleDateChange(e, 'entryDate')} className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white text-sm outline-none" required />
                    <button type="button" onClick={() => setEntryTimeConfirmed(true)} className={`px-6 rounded-2xl font-black text-[10px] transition-all border ${entryTimeConfirmed ? 'bg-trading-green/10 border-trading-green text-trading-green' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'}`}>
                       {entryTimeConfirmed ? 'SET' : 'OK'}
                    </button>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Exit Timestamp</label>
                 <div className="flex gap-2">
                    <input type="datetime-local" name="exitDate" value={getDateString(formData.exitDate)} onChange={(e) => handleDateChange(e, 'exitDate')} className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white text-sm outline-none" />
                    <button type="button" onClick={() => setExitTimeConfirmed(true)} className={`px-6 rounded-2xl font-black text-[10px] transition-all border ${exitTimeConfirmed ? 'bg-trading-green/10 border-trading-green text-trading-green' : 'bg-gray-800 border-gray-700 text-gray-500 hover:text-white'}`}>
                       {exitTimeConfirmed ? 'SET' : 'OK'}
                    </button>
                 </div>
              </div>
            </div>
          </section>

          {/* STEP 2: FINANCIALS */}
          <section className="space-y-6">
             <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/20">02</span>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Financial Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Avg Entry Price</label>
                <input type="number" step="any" name="entryPrice" value={formData.entryPrice || ''} onChange={handleChange} onBlur={calculatePnL} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-mono outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Avg Exit Price</label>
                <input type="number" step="any" name="exitPrice" value={formData.exitPrice || ''} onChange={handleChange} onBlur={calculatePnL} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-mono outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Quantity / Size</label>
                <input type="number" step="any" name="quantity" value={formData.quantity || ''} onChange={handleChange} onBlur={calculatePnL} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-mono outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Brokerage & Fees</label>
                <input type="number" step="any" name="fees" value={formData.fees || ''} onChange={handleChange} onBlur={calculatePnL} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-mono outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="0" />
              </div>
            </div>

            {/* Prominent P&L Display */}
            <div className={`p-8 rounded-[2rem] border transition-all flex flex-col items-center justify-center space-y-1 ${
              netPnLValue > 0 ? 'bg-trading-green/5 border-trading-green/20' : 
              netPnLValue < 0 ? 'bg-trading-red/5 border-trading-red/20' : 
              'bg-gray-900/50 border-gray-700'
            }`}>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Estimated Net Result</p>
               <h4 className={`text-5xl font-black font-mono tracking-tighter ${
                 netPnLValue > 0 ? 'text-trading-green' : 
                 netPnLValue < 0 ? 'text-trading-red' : 
                 'text-gray-400'
               }`}>
                 {netPnLValue >= 0 ? '+' : ''}{netPnLValue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
               </h4>
            </div>
          </section>

          {/* STEP 3: STRATEGY & PSYCHOLOGY */}
          <section className="space-y-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold border border-purple-500/20">03</span>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Strategy & Psychology</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Selected Setup</label>
                      <button type="button" onClick={() => setIsAddingSetup(true)} className="text-[10px] font-black text-blue-400 hover:text-blue-300 transition-colors">+ NEW STRATEGY</button>
                    </div>
                    
                    {isAddingSetup ? (
                      <div className="flex gap-2 animate-scale-in">
                         <input type="text" value={newSetupName} onChange={e => setNewSetupName(e.target.value)} className="flex-1 bg-gray-900 border border-blue-600 rounded-2xl p-4 text-white text-sm outline-none" autoFocus placeholder="e.g. VCP Breakout" />
                         <button type="button" onClick={handleAddSetupInline} className="bg-blue-600 px-6 rounded-2xl text-white font-black text-xs">ADD</button>
                         <button type="button" onClick={() => setIsAddingSetup(false)} className="text-gray-500 px-2"><X size={20}/></button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                          <select name="setup" value={formData.setup} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none appearance-none">
                            <option value="">Select Edge...</option>
                            {availableSetups.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        {formData.setup && (
                          <button 
                            type="button" 
                            onClick={() => { if(confirm(`Delete "${formData.setup}"?`)) onRemoveSetup(formData.setup!); setFormData(p => ({...p, setup: ''})); }} 
                            className="p-4 bg-gray-900 border border-red-900/30 text-red-500 rounded-2xl hover:bg-red-900/20 transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Followed Plan?</label>
                      <div className="flex bg-gray-900 rounded-2xl p-1.5 border border-gray-700 h-[56px]">
                        <button type="button" onClick={() => setFormData({...formData, followedSetup: true})} className={`flex-1 text-xs font-black rounded-xl transition-all ${formData.followedSetup ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500'}`}>YES</button>
                        <button type="button" onClick={() => setFormData({...formData, followedSetup: false})} className={`flex-1 text-xs font-black rounded-xl transition-all ${!formData.followedSetup ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500'}`}>NO</button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Trade Mood</label>
                      <select name="feeling" value={formData.feeling} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white font-bold outline-none h-[56px]">
                          {FEELINGS.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Behavioral Mistakes (Manage List)</label>
                    <button type="button" onClick={() => setIsAddingMistake(true)} className="text-[10px] font-black text-red-400 hover:text-red-300 transition-colors">+ ADD CATEGORY</button>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                    {availableMistakes.map(mistake => (
                      <div key={mistake} className="group relative flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-2xl px-4 py-2 hover:border-red-500/50 transition-all">
                        <button 
                          type="button" 
                          onClick={() => handleMistakeToggle(mistake)}
                          className={`text-[11px] font-black transition-all ${formData.mistakes?.includes(mistake) ? 'text-red-400' : 'text-gray-500 group-hover:text-gray-300'}`}
                        >
                          {mistake}
                        </button>
                        <button 
                           type="button" 
                           onClick={(e) => { e.stopPropagation(); if(confirm(`Remove "${mistake}" permanently?`)) onRemoveMistake?.(mistake); }} 
                           className="text-gray-600 hover:text-red-500 transition-colors"
                        >
                           <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                 </div>

                 {isAddingMistake && (
                   <div className="flex gap-2 animate-scale-in p-2 bg-gray-900 rounded-2xl border border-red-500/50">
                     <input type="text" name="newMistakeName" value={newMistakeName} onChange={e => setNewMistakeName(e.target.value)} className="flex-1 bg-transparent px-4 py-2 text-sm text-white outline-none" autoFocus placeholder="e.g. Revenge Trading..." />
                     <button type="button" onClick={handleAddMistakeInline} className="bg-red-600 px-4 rounded-xl text-white font-black text-[10px]">SAVE</button>
                     <button type="button" onClick={() => setIsAddingMistake(false)} className="text-gray-500 px-2"><X size={18}/></button>
                   </div>
                 )}
              </div>
            </div>
          </section>

          {/* STEP 4: REVIEW & MEDIA */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/20">04</span>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Documentation & Review</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-1 space-y-6">
                 <div className="group relative h-56 w-full border-2 border-dashed border-gray-700 rounded-[2rem] bg-gray-900/30 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-900/50 hover:border-blue-500/50 transition-all overflow-hidden" onClick={() => fileInputRef.current?.click()}>
                    {formData.screenshot ? (
                      <>
                        <img src={formData.screenshot} className="w-full h-full object-cover rounded-[1.8rem]" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Trash2 size={24} className="text-red-400" onClick={(e) => { e.stopPropagation(); setFormData({...formData, screenshot: ''}); }} />
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                           <ImageIcon className="text-gray-500" size={24} />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upload Chart Screenshot</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Contextual Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags?.map(tag => (
                        <span key={tag} className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => setFormData(p => ({...p, tags: p.tags?.filter(t => t !== tag)}))}><X size={10}/></button>
                        </span>
                      ))}
                    </div>
                    <input type="text" name="tagInput" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-white text-xs outline-none" placeholder="Add #tags and press Enter..." />
                 </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pl-1">
                    <Target size={14} className="text-gray-500" />
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Entry Rationale</label>
                  </div>
                  <textarea name="entryReason" rows={2} value={formData.entryReason} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="Technical/Fundamental triggers for this trade..." />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 pl-1">
                    <FileText size={14} className="text-gray-500" />
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Detailed Journal Notes</label>
                  </div>
                  <textarea name="notes" rows={8} value={formData.notes} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-5 text-sm text-white outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="Mental flow, market dynamics, and post-trade reflection..." />
                </div>
              </div>
            </div>
          </section>

          {/* Sticky Actions */}
          <div className="pt-10 border-t border-gray-700 flex justify-end gap-6 sticky bottom-0 bg-gray-800 pb-2 -mx-2">
            <button type="button" onClick={onCancel} className="px-10 py-4 text-xs font-black text-gray-500 hover:text-white transition-colors tracking-widest">DISCARD</button>
            <button type="submit" className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.5rem] shadow-2xl shadow-blue-900/40 transition-all flex items-center justify-center gap-3 transform hover:scale-[1.02] active:scale-95 text-sm tracking-widest">
               <Check size={20} />
               {initialData ? 'UPDATE ENTRY' : 'COMMIT TO JOURNAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

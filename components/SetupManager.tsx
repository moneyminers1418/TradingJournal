import React, { useState, useMemo } from 'react';
import { Trade } from '../types';
import { SETUP_TYPES } from '../constants';
import { Plus, Trash2, TrendingUp, Target, BarChart, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface SetupManagerProps {
  trades: Trade[];
  customSetups: string[];
  onAddSetup: (name: string) => void;
  onRemoveSetup: (name: string) => void;
}

interface SetupStats {
  name: string;
  count: number;
  pnl: number;
  winRate: number;
  profitFactor: number;
  avgPnL: number;
  isCustom: boolean;
}

export const SetupManager: React.FC<SetupManagerProps> = ({ trades, customSetups, onAddSetup, onRemoveSetup }) => {
  const [newSetupName, setNewSetupName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const allSetupsList = useMemo(() => [...SETUP_TYPES, ...customSetups], [customSetups]);

  const setupStats = useMemo(() => {
    return allSetupsList.map(setupName => {
      const setupTrades = trades.filter(t => t.setup === setupName && t.exitDate);
      const wins = setupTrades.filter(t => (t.pnl || 0) > 0);
      const losses = setupTrades.filter(t => (t.pnl || 0) < 0);
      
      const totalPnL = setupTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const grossProfit = wins.reduce((acc, t) => acc + (t.pnl || 0), 0);
      const grossLoss = Math.abs(losses.reduce((acc, t) => acc + (t.pnl || 0), 0));
      
      const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 100 : 0) : grossProfit / grossLoss;
      const winRate = setupTrades.length > 0 ? (wins.length / setupTrades.length) * 100 : 0;
      const avgPnL = setupTrades.length > 0 ? totalPnL / setupTrades.length : 0;

      return {
        name: setupName,
        count: setupTrades.length,
        pnl: totalPnL,
        winRate,
        profitFactor,
        avgPnL,
        isCustom: customSetups.includes(setupName)
      };
    }).sort((a, b) => b.pnl - a.pnl);
  }, [trades, allSetupsList, customSetups]);

  const bestSetup = setupStats[0]?.pnl > 0 ? setupStats[0] : null;
  const worstSetup = setupStats[setupStats.length - 1]?.pnl < 0 ? setupStats[setupStats.length - 1] : null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSetupName.trim()) {
      onAddSetup(newSetupName.trim());
      setNewSetupName('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Header Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-900/20 to-gray-900 border border-emerald-900/30 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Champion Strategy</p>
            <h3 className="text-2xl font-black text-white">{bestSetup ? bestSetup.name : 'N/A'}</h3>
            {bestSetup && <p className="text-emerald-500 font-mono text-sm mt-2">+{bestSetup.pnl.toLocaleString('en-IN', {style:'currency', currency:'INR'})}</p>}
          </div>
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
             <ArrowUpRight className="text-white" size={28} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-900/20 to-gray-900 border border-red-900/30 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1">Strategy in Drawdown</p>
            <h3 className="text-2xl font-black text-white">{worstSetup ? worstSetup.name : 'N/A'}</h3>
            {worstSetup && <p className="text-red-500 font-mono text-sm mt-2">{worstSetup.pnl.toLocaleString('en-IN', {style:'currency', currency:'INR'})}</p>}
          </div>
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
             <ArrowDownRight className="text-white" size={28} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">Your Strategies</h2>
          <p className="text-gray-500 text-xs">Define and track the performance of your trading edges.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> ADD CUSTOM SETUP
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-gray-900 border border-blue-500/50 p-4 rounded-xl flex gap-3 animate-scale-in">
           <input 
             autoFocus
             className="flex-1 bg-transparent border-none outline-none text-white text-sm"
             placeholder="e.g. Mean Reversion, VCP Breakout..."
             value={newSetupName}
             onChange={(e) => setNewSetupName(e.target.value)}
           />
           <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-white text-xs font-bold">CANCEL</button>
           <button type="submit" className="bg-blue-600 px-4 py-2 rounded-lg text-xs font-bold text-white">SAVE SETUP</button>
        </form>
      )}

      {/* Strategy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {setupStats.map(stat => (
          <div key={stat.name} className="group bg-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-blue-500/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-white font-bold text-lg leading-none">{stat.name}</h4>
                <p className="text-gray-500 text-[10px] mt-2 uppercase tracking-widest font-bold">
                  {stat.isCustom ? 'User Strategy' : 'System Standard'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <div className={`p-2 rounded-lg ${stat.pnl >= 0 ? 'bg-trading-green/10 text-trading-green' : 'bg-trading-red/10 text-trading-red'}`}>
                    <BarChart size={16} />
                 </div>
                 {stat.isCustom && (
                   <button 
                    onClick={() => onRemoveSetup(stat.name)}
                    className="p-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Win Rate</p>
                <div className="flex items-center gap-2">
                   <span className="text-white font-mono font-bold">{stat.winRate.toFixed(1)}%</span>
                   <div className="flex-1 h-1 bg-gray-900 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{width: `${stat.winRate}%`}} />
                   </div>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Trades</p>
                <p className="text-white font-mono font-bold">{stat.count}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Net P&L</p>
                <p className={`font-mono font-bold ${stat.pnl >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                  {stat.pnl >= 0 ? '+' : ''}{stat.pnl.toLocaleString('en-IN', {style:'currency', currency:'INR'})}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Profit Factor</p>
                <p className="text-white font-mono font-bold">{stat.profitFactor.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-between items-center">
              <span className="text-gray-500 text-[10px] flex items-center gap-1">
                <Info size={10} /> Average: {stat.avgPnL.toLocaleString('en-IN', {style:'currency', currency:'INR'})} / trade
              </span>
              {stat.count === 0 && (
                <span className="text-amber-500 text-[10px] font-bold italic animate-pulse">NO DATA LOGGED</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
import React from 'react';
import { Trade, TradeType } from '../types';
import { CheckCircle2, IndianRupee, ArrowRight, Share2, PartyPopper } from 'lucide-react';

interface SuccessCelebrationProps {
  trade: Trade;
  onClose: () => void;
}

export const SuccessCelebration: React.FC<SuccessCelebrationProps> = ({ trade, onClose }) => {
  const isWin = (trade.pnl || 0) > 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Confetti Background Effect */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="confetti-particle animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: isWin ? (Math.random() > 0.5 ? '#10B981' : '#3B82F6') : '#EF4444',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              transform: `scale(${0.5 + Math.random()})`
            }}
          />
        ))}
      </div>

      <div className="relative bg-gray-900 border border-gray-700 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce-subtle ${
          isWin ? 'bg-trading-green/20 text-trading-green' : 'bg-trading-red/20 text-trading-red'
        }`}>
          <PartyPopper size={40} />
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Trade Logged!</h2>
        <p className="text-gray-400 mb-8">Excellent discipline. Your journal has been updated with {trade.symbol}.</p>

        <div className="w-full bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 mb-8 space-y-4">
           <div className="flex justify-between items-center">
             <span className="text-gray-500 text-sm">Outcome</span>
             <span className={`font-mono font-bold text-xl ${isWin ? 'text-trading-green' : 'text-trading-red'}`}>
               {isWin ? '+' : ''}{trade.pnl?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
             </span>
           </div>
           <div className="h-px bg-gray-700/50 w-full" />
           <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">Symbol</span>
             <span className="text-white font-semibold">{trade.symbol}</span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">Setup</span>
             <span className="text-gray-300">{trade.setup || 'Organic'}</span>
           </div>
        </div>

        <div className="flex gap-4 w-full">
           <button 
             onClick={onClose}
             className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2"
           >
             Continue Journaling
             <ArrowRight size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};
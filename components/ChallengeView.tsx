
import React, { useState, useEffect } from 'react';
import { Trade, GrowthChallenge } from '../types';
import { Trophy, TrendingUp, Flag, Target, Zap, IndianRupee, Edit3, Check, X, Info, Award, Calendar, History, ArrowRight } from 'lucide-react';

interface ChallengeViewProps {
  trades: Trade[];
  challenge: GrowthChallenge;
  onUpdateChallenge: (newChallenge: GrowthChallenge) => void;
  completedChallenges?: GrowthChallenge[];
  onArchiveChallenge?: (challenge: GrowthChallenge) => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ 
  trades, 
  challenge, 
  onUpdateChallenge, 
  completedChallenges = [], 
  onArchiveChallenge 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedChallenge, setEditedChallenge] = useState<GrowthChallenge>(challenge);

  // Synchronize internal state when the challenge prop changes (e.g., after archiving)
  useEffect(() => {
    setEditedChallenge(challenge);
  }, [challenge]);

  const totalPnL = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const currentCapital = challenge.startingCapital + totalPnL;
  
  const gap = challenge.targetCapital - challenge.startingCapital;
  const earned = currentCapital - challenge.startingCapital;
  const progress = gap > 0 ? Math.min(Math.max((earned / gap) * 100, 0), 100) : 0;
  const isGoalReached = progress >= 100;

  const handleSave = () => {
    onUpdateChallenge(editedChallenge);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedChallenge(challenge);
    setIsEditing(false);
  };

  const handleArchive = () => {
    if (confirm("Congratulations! Archive this milestone and set a new professional goal?")) {
      onArchiveChallenge?.(challenge);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Main Challenge Hero Section */}
      <div className={`relative overflow-hidden transition-all duration-700 rounded-3xl p-8 border ${
        isGoalReached 
        ? 'bg-gradient-to-br from-emerald-900/40 via-blue-900/40 to-purple-900/40 border-emerald-500/30 ring-4 ring-emerald-500/10' 
        : 'bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-blue-700/30'
      }`}>
        {/* Victory Overlay for reached goal */}
        {isGoalReached && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-yellow-400 to-emerald-400 animate-pulse" />
        )}

        <div className="absolute top-[-10%] right-[-5%] opacity-10 pointer-events-none transform rotate-12">
          <Trophy size={200} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-3 transition-all ${
                isGoalReached ? 'bg-emerald-500 shadow-emerald-500/30 scale-110' : 'bg-blue-600 shadow-blue-500/30'
              }`}>
                {isGoalReached ? <Award className="text-white" size={32} /> : <Trophy className="text-white" size={28} />}
              </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-blue-300 uppercase tracking-widest pl-1">Goal Title</label>
                    <input 
                      type="text" 
                      value={editedChallenge.title} 
                      onChange={e => setEditedChallenge({...editedChallenge, title: e.target.value})}
                      className="bg-gray-950/50 border border-blue-500/50 text-2xl font-bold text-white tracking-tight rounded-xl px-4 py-2 outline-none w-full md:w-96 focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Enter Goal Title"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                      {challenge.title}
                      {isGoalReached && <span className="bg-emerald-500 text-white text-[10px] uppercase font-black px-2 py-1 rounded">ACHIEVED</span>}
                    </h2>
                    <p className="text-blue-300 text-sm mt-1 flex items-center gap-2">
                       <Calendar size={14} className="opacity-70" />
                       Active since {new Date(challenge.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
               {isEditing ? (
                 <>
                   <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/40">
                     <Check size={18} /> Save Changes
                   </button>
                   <button onClick={handleCancel} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all border border-gray-700">
                     <X size={18} /> Cancel
                   </button>
                 </>
               ) : (
                 <div className="flex gap-3">
                   {isGoalReached && (
                     <button onClick={handleArchive} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-xl shadow-emerald-900/40 animate-bounce-subtle">
                        <Award size={18} /> Archive Success
                     </button>
                   )}
                   <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold py-2.5 px-5 rounded-xl transition-all border border-blue-600/30 group">
                     <Edit3 size={18} className="group-hover:scale-110 transition-transform" /> {isGoalReached ? 'Reset Milestones' : 'Edit Milestone'}
                   </button>
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className={`p-5 rounded-2xl border transition-all ${isEditing ? 'bg-gray-900/80 border-blue-500/30 ring-2 ring-blue-500/10' : 'bg-gray-900/40 border-white/5'}`}>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-black mb-2">Starting Capital</p>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-lg">₹</span>
                  <input 
                    type="number"
                    value={editedChallenge.startingCapital}
                    onChange={e => setEditedChallenge({...editedChallenge, startingCapital: parseFloat(e.target.value) || 0})}
                    className="bg-transparent text-2xl font-mono font-bold text-white outline-none w-full pl-6"
                    placeholder="0"
                  />
                </div>
              ) : (
                <p className="text-2xl font-mono font-bold text-white">
                  {challenge.startingCapital.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </p>
              )}
            </div>

            <div className={`p-5 rounded-2xl border transition-all ${isEditing ? 'bg-gray-900/80 border-blue-500/30 ring-2 ring-blue-500/10' : 'bg-gray-900/40 border-white/5'}`}>
              <p className="text-gray-400 text-xs uppercase tracking-widest font-black mb-2">Target Goal</p>
              {isEditing ? (
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-lg">₹</span>
                  <input 
                    type="number"
                    value={editedChallenge.targetCapital}
                    onChange={e => setEditedChallenge({...editedChallenge, targetCapital: parseFloat(e.target.value) || 0})}
                    className="bg-transparent text-2xl font-mono font-bold text-blue-400 outline-none w-full pl-6"
                    placeholder="0"
                  />
                </div>
              ) : (
                <p className="text-2xl font-mono font-bold text-blue-400">
                  {challenge.targetCapital.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </p>
              )}
            </div>

            <div className={`p-5 rounded-2xl border transition-colors ${isGoalReached ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-900/40 border-white/5'}`}>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest font-black mb-2">Current Equity</p>
                <p className={`text-2xl font-mono font-bold ${isGoalReached ? 'text-emerald-400' : 'text-white'}`}>
                   {currentCapital.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}
                </p>
              </div>
              <p className={`text-xs font-bold mt-1 ${totalPnL >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
                {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })} Total Profit
              </p>
            </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-end px-1">
               <span className="text-sm font-bold text-white uppercase tracking-wider opacity-80">Challenge Progress</span>
               <div className="text-right flex items-baseline gap-2">
                  <span className={`text-3xl font-black tracking-tighter transition-colors ${isGoalReached ? 'text-emerald-400' : 'text-blue-400'}`}>{progress.toFixed(1)}%</span>
               </div>
             </div>
             <div className="h-6 bg-gray-900/80 rounded-2xl overflow-hidden border border-gray-700 p-1">
               <div 
                 className={`h-full transition-all duration-1000 ease-out relative shadow-lg rounded-xl ${
                    isGoalReached 
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-emerald-500/30' 
                    : 'bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 shadow-blue-500/30'
                 }`}
                 style={{ width: `${progress}%` }}
               >
                  <div className="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse-slow" />
               </div>
             </div>
             <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">
                <span>Milestone Start</span>
                <span>Final Target</span>
             </div>
          </div>
        </div>
      </div>

      {/* Hall of Fame / Completed Challenges */}
      {completedChallenges.length > 0 && (
        <section className="space-y-6">
           <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                 <History size={20} />
              </div>
              <h3 className="text-xl font-bold text-white">Hall of Fame</h3>
              <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full font-bold">{completedChallenges.length}</span>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedChallenges.map((past) => {
                const profit = past.targetCapital - past.startingCapital;
                const gainPct = past.startingCapital > 0 ? ((past.targetCapital / past.startingCapital) - 1) * 100 : 0;
                return (
                  <div key={past.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 hover:border-amber-500/30 transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-amber-500/50 group-hover:text-amber-500 transition-colors shadow-inner">
                              <Award size={24} />
                           </div>
                           <div>
                              <h4 className="text-white font-bold">{past.title}</h4>
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                                {new Date(past.startDate).toLocaleDateString()} — {past.endDate ? new Date(past.endDate).toLocaleDateString() : 'N/A'}
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="text-emerald-400 font-black font-mono">+{gainPct.toFixed(0)}%</span>
                           <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Growth Achieved</div>
                        </div>
                     </div>

                     <div className="flex items-center justify-between gap-4 p-4 bg-gray-950/50 rounded-xl border border-gray-800/50">
                        <div className="text-center flex-1">
                           <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Started With</p>
                           <p className="text-sm font-mono text-gray-300">₹{past.startingCapital.toLocaleString('en-IN')}</p>
                        </div>
                        <ArrowRight className="text-gray-700" size={16} />
                        <div className="text-center flex-1">
                           <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ended At</p>
                           <p className="text-sm font-mono text-white font-bold">₹{past.targetCapital.toLocaleString('en-IN')}</p>
                        </div>
                     </div>
                  </div>
                );
              })}
           </div>
        </section>
      )}

      {/* Goal Analytics */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
           <Info size={40} className="text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
           <TrendingUp size={20} className="text-blue-500" />
           Goal Analytics
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
            {isGoalReached ? (
              <span>You have successfully scaled your account! Archive this milestone to start the next compounding phase.</span>
            ) : (
              <span>To reach your target of <span className="text-blue-400 font-bold">{challenge.targetCapital.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>, 
              you need a net profit of <span className="text-white font-bold">{Math.max(0, challenge.targetCapital - currentCapital).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span> from your current equity.</span>
            )}
          </p>
          <div className="flex flex-wrap gap-4">
             <div className="bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-700/50 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Avg PnL/Trade Required</span>
                <span className="text-sm font-mono font-bold text-white">₹{trades.length > 0 ? (Math.max(0, challenge.targetCapital - currentCapital) / 20).toFixed(0) : '0'}</span>
             </div>
             <div className="bg-gray-900/50 px-4 py-2 rounded-xl border border-gray-700/50 flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Velocity Status</span>
                <span className={`text-sm font-bold ${progress > 50 ? 'text-emerald-400' : 'text-blue-400'}`}>
                  {progress > 50 ? 'Strong Trend' : 'Building Base'}
                </span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

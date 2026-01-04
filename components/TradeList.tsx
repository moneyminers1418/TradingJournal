import React, { useState } from 'react';
import { Trade, TradeType, AssetClass } from '../types';
import { Edit2, Trash2, Search, Filter, X, Image as ImageIcon, Clock, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

interface TradeListProps {
   trades: Trade[];
   onEdit: (trade: Trade) => void;
   onDelete: (id: string) => void;
   availableSetups: string[];
   initialSetupFilter?: string;
}

export const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete, availableSetups, initialSetupFilter }) => {
   const [textFilter, setTextFilter] = useState('');
   const [assetFilter, setAssetFilter] = useState<string>('All');
   const [typeFilter, setTypeFilter] = useState<string>('All');
   const [setupFilter, setSetupFilter] = useState<string>(initialSetupFilter || 'All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Zoom/Pan State for Lightbox
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const filteredTrades = trades.filter(t => {
    const matchesText = 
      t.symbol.toLowerCase().includes(textFilter.toLowerCase()) || 
      t.notes.toLowerCase().includes(textFilter.toLowerCase()) ||
      (t.setup?.toLowerCase() || '').includes(textFilter.toLowerCase());
    
    const matchesAsset = assetFilter === 'All' || t.assetClass === assetFilter;
    const matchesType = typeFilter === 'All' || t.type === typeFilter;
    const matchesSetup = setupFilter === 'All' || t.setup === setupFilter;
    
    const tradeDate = new Date(t.entryDate);
    const matchesFromDate = dateFrom === '' || tradeDate >= new Date(dateFrom);
    const matchesToDate = dateTo === '' || tradeDate <= new Date(new Date(dateTo).setHours(23, 59, 59, 999));

    return matchesText && matchesAsset && matchesType && matchesSetup && matchesFromDate && matchesToDate;
  }).sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

  const clearFilters = () => {
    setTextFilter('');
    setAssetFilter('All');
    setTypeFilter('All');
    setSetupFilter('All');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = textFilter !== '' || assetFilter !== 'All' || typeFilter !== 'All' || setupFilter !== 'All' || dateFrom !== '' || dateTo !== '';

  const selectClass = "bg-gray-900 border border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 text-white outline-none cursor-pointer hover:bg-gray-850 transition-colors";
  const inputClass = "bg-gray-900 border border-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 text-white outline-none";

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col h-full relative">
      
      {/* Enhanced Lightbox with Manual Zoom & Pan */}
      {selectedImage && !selectedTrade && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => { setSelectedImage(null); setIsZoomed(false); }}
        >
          <div className="absolute top-6 left-6 flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <ImageIcon className="text-white" size={20} />
             </div>
             <div>
                <h4 className="text-white font-bold text-sm">Evidence Inspection</h4>
                <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest">Click to toggle zoom • Drag to pan</p>
             </div>
          </div>

          <button 
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors bg-gray-800/80 hover:bg-gray-700 rounded-2xl p-3 z-10 border border-gray-700"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setIsZoomed(false); }}
          >
            <X size={24} />
          </button>
          
          <div 
            className={`relative max-w-[95vw] max-h-[85vh] overflow-hidden rounded-2xl border border-gray-700 shadow-2xl transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onMouseMove={handleMouseMove}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
          >
            <img 
              src={selectedImage} 
              alt="Trade Evidence Full" 
              className="max-w-full max-h-[85vh] object-contain transition-transform duration-300 ease-out select-none pointer-events-none"
              style={{
                transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`
              }}
            />
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 pointer-events-none uppercase tracking-widest">
               {isZoomed ? (
                 <>
                   <ZoomOut size={14} className="text-blue-400" /> CLICK TO RESET VIEW
                 </>
               ) : (
                 <>
                   <ZoomIn size={14} className="text-blue-400" /> CLICK TO INSPECT DETAILS
                 </>
               )}
            </div>
          </div>
        </div>
      )}

      {/* Full Trade Detail Modal */}
      {selectedTrade && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedTrade(null)}
        >
          <div 
            className="bg-gray-850 border border-gray-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900 sticky top-0">
              <h3 className="text-xl font-bold text-white tracking-tight">Trade Analysis</h3>
              <button 
                onClick={() => setSelectedTrade(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-900">
               <div className="p-6 bg-gray-800 rounded-2xl border border-gray-700 flex justify-between items-start shadow-inner">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl font-black text-white tracking-tighter">{selectedTrade.symbol}</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          selectedTrade.type === TradeType.LONG ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {selectedTrade.type}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                           <Clock size={14} className="text-blue-500" />
                           Entry: <span className="text-gray-300">{new Date(selectedTrade.date).toLocaleDateString()} at {new Date(selectedTrade.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                        <span>Asset: <span className="text-gray-300">{selectedTrade.assetClass}</span></span>
                        <span>Setup: <span className="text-blue-400 font-bold">{selectedTrade.setup || 'None'}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className={`text-3xl font-mono font-black ${
                         (selectedTrade.pnl || 0) >= 0 ? 'text-trading-green' : 'text-trading-red'
                       }`}>
                         {(selectedTrade.pnl || 0) >= 0 ? '+' : ''}
                         {(selectedTrade.pnl || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                       </div>
                       <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Net Performance</div>
                    </div>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1 block">Entry</span>
                    <div className="text-sm text-gray-200 font-mono font-bold">₹{selectedTrade.entryPrice.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1 block">Exit</span>
                    <div className="text-sm text-gray-200 font-mono font-bold">₹{selectedTrade.exitPrice?.toLocaleString() || '-'}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1 block">Qty</span>
                    <div className="text-sm text-gray-200 font-mono font-bold">{selectedTrade.quantity}</div>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1 block">Fees</span>
                    <div className="text-sm text-red-400 font-mono font-bold">₹{selectedTrade.fees}</div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Psychology & Discipline</h4>
                    <div className="space-y-2">
                       <div className="flex justify-between p-4 bg-gray-800 rounded-xl text-sm border border-gray-700 shadow-sm">
                         <span className="text-gray-500 font-bold uppercase text-[10px]">Dominant Feeling</span>
                         <span className="text-white font-bold">{selectedTrade.feeling || 'Neutral'}</span>
                       </div>
                       <div className="flex justify-between p-4 bg-gray-800 rounded-xl text-sm border border-gray-700 shadow-sm">
                         <span className="text-gray-500 font-bold uppercase text-[10px]">Followed Edge?</span>
                         <span className={`font-black ${selectedTrade.followedSetup ? 'text-emerald-400' : 'text-red-400'}`}>
                           {selectedTrade.followedSetup ? 'YES' : 'NO'}
                         </span>
                       </div>
                    </div>
                    {selectedTrade.mistakes && selectedTrade.mistakes.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedTrade.mistakes.map(m => (
                          <span key={m} className="px-2 py-1 bg-red-900/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-900/30 uppercase tracking-wider">
                            {m}
                          </span>
                        ))}
                      </div>
                    )}
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Strategic Context</h4>
                    <div className="space-y-3">
                       {selectedTrade.entryReason && (
                        <div>
                           <span className="text-[10px] text-gray-500 block mb-1 font-bold uppercase">Rationale:</span>
                           <p className="text-xs text-gray-300 bg-gray-800 p-4 rounded-xl border border-gray-700 italic leading-relaxed">"{selectedTrade.entryReason}"</p>
                        </div>
                       )}
                       {selectedTrade.lessonLearned && (
                        <div>
                           <span className="text-[10px] text-gray-500 block mb-1 font-bold uppercase">Key Lesson:</span>
                           <p className="text-xs text-emerald-400 bg-emerald-900/10 p-4 rounded-xl border border-emerald-900/20 italic leading-relaxed">"{selectedTrade.lessonLearned}"</p>
                        </div>
                       )}
                    </div>
                 </div>
               </div>

               {selectedTrade.notes && (
                 <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 mb-2">Detailed Reflection</h4>
                    <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 text-sm text-gray-300 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {selectedTrade.notes}
                    </div>
                 </div>
               )}

               {selectedTrade.screenshot && (
                 <div>
                    <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1 mb-2">Visual Evidence</h4>
                    <img 
                      src={selectedTrade.screenshot} 
                      alt="Trade Evidence" 
                      className="w-full rounded-2xl border border-gray-700 shadow-xl cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => { setSelectedImage(selectedTrade.screenshot!); setSelectedTrade(null); }}
                    />
                 </div>
               )}
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(selectedTrade);
                    setSelectedTrade(null);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-gray-700"
               >
                 <Edit2 size={16} /> Edit Entry
               </button>
               <button 
                  onClick={() => setSelectedTrade(null)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/40"
               >
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-b border-gray-700 bg-gray-800 flex flex-col space-y-4">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 whitespace-nowrap uppercase tracking-tight">
            Journal Database
            <span className="text-[10px] font-black text-gray-400 bg-gray-700 px-2 py-0.5 rounded-full border border-gray-600">
              {filteredTrades.length} RECORDED
            </span>
          </h3>
          
          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:min-w-[240px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Search size={16} className="text-gray-500" />
              </div>
              <input 
                type="text" 
                placeholder="Search symbol, strategy, notes..." 
                className="bg-gray-950 border border-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/50 block w-full pl-11 p-3 text-white placeholder-gray-600 outline-none transition-all"
                value={textFilter}
                onChange={(e) => setTextFilter(e.target.value)}
              />
              {textFilter && (
                <button 
                  onClick={() => setTextFilter('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-700 rounded-xl px-2 py-1">
                <input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)} 
                    className="bg-transparent text-xs text-white outline-none cursor-pointer p-1"
                    title="From Date"
                />
                <span className="text-gray-700 font-black">/</span>
                <input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)} 
                    className="bg-transparent text-xs text-white outline-none cursor-pointer p-1"
                    title="To Date"
                />
              </div>

               <select 
                value={assetFilter} 
                onChange={(e) => setAssetFilter(e.target.value)}
                className={selectClass + " rounded-xl px-4 py-2.5"}
              >
                <option value="All">All Assets</option>
                {Object.values(AssetClass).map(ac => (
                  <option key={ac} value={ac}>{ac}</option>
                ))}
              </select>

              <select 
                value={typeFilter} 
                onChange={(e) => setTypeFilter(e.target.value)}
                className={selectClass + " rounded-xl px-4 py-2.5"}
              >
                <option value="All">All Types</option>
                {Object.values(TradeType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select 
                value={setupFilter} 
                onChange={(e) => setSetupFilter(e.target.value)}
                className={selectClass + " rounded-xl px-4 py-2.5"}
                style={{maxWidth: '180px'}}
              >
                <option value="All">All Setups</option>
                {availableSetups.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {hasActiveFilters && (
                 <button 
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-400/10 hover:bg-red-400/20 border border-red-400/30 rounded-xl transition-all flex items-center gap-2"
                 >
                   <X size={14} /> Reset
                 </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-[10px] text-gray-500 uppercase font-black tracking-[0.15em] bg-gray-900/80 sticky top-0 z-10 border-b border-gray-700">
            <tr>
              <th scope="col" className="px-6 py-4">Security / Asset</th>
              <th scope="col" className="px-6 py-4">Action</th>
              <th scope="col" className="px-6 py-4">Edge / Strategy</th>
              <th scope="col" className="px-6 py-4 text-right">Entry Price</th>
              <th scope="col" className="px-6 py-4 text-right">Exit Price</th>
              <th scope="col" className="px-6 py-4 text-right">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Net P&L</th>
              <th scope="col" className="px-6 py-4 text-center">Chart</th>
              <th scope="col" className="px-6 py-4 text-center">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {filteredTrades.map((trade) => (
              <tr 
                key={trade.id} 
                className="hover:bg-gray-700/30 transition-all cursor-pointer group/row"
                onClick={() => setSelectedTrade(trade)}
              >
                <td className="px-6 py-5">
                  <div className="font-black text-white text-base tracking-tight">{trade.symbol}</div>
                  <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">{trade.assetClass}</div>
                  <div className="text-[10px] font-mono text-gray-600 mt-1 opacity-0 group-hover/row:opacity-100 transition-opacity">#{trade.id.slice(0, 8)}</div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${
                    trade.type === TradeType.LONG 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="bg-gray-800 text-gray-300 py-1.5 px-3 rounded-lg text-[10px] font-bold border border-gray-700 whitespace-nowrap uppercase tracking-tighter">
                    {trade.setup || 'ORGANIC'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right font-mono text-sm text-gray-300 font-medium">
                  ₹{trade.entryPrice.toLocaleString()}
                </td>
                <td className="px-6 py-5 text-right font-mono text-sm text-gray-300 font-medium">
                  {trade.exitPrice ? `₹${trade.exitPrice.toLocaleString()}` : '—'}
                </td>
                <td className="px-6 py-5 text-right font-mono text-[10px] text-gray-400">
                  {trade.exitDate ? (
                     <div className="flex flex-col items-end">
                        <span className="font-bold text-gray-500 uppercase tracking-widest mb-0.5">Closed</span>
                        <div className="opacity-60">{new Date(trade.exitDate).toLocaleDateString()}</div>
                     </div>
                  ) : (
                    <span className="text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-[10px] font-black border border-blue-400/20 uppercase tracking-widest">ACTIVE</span>
                  )}
                </td>
                <td className={`px-6 py-5 text-right font-mono text-base font-black ${
                  (trade.pnl || 0) > 0 ? 'text-trading-green' : (trade.pnl || 0) < 0 ? 'text-trading-red' : 'text-gray-600'
                }`}>
                  {trade.pnl ? (
                    <div className="flex flex-col items-end">
                       <span>{trade.pnl > 0 ? '+' : ''}{trade.pnl.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                       <span className="text-[8px] font-black uppercase opacity-40">Post-Fees</span>
                    </div>
                  ) : '—'}
                </td>
                <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                  {trade.screenshot ? (
                    <button 
                      onClick={(e) => {
                         e.stopPropagation();
                         setSelectedImage(trade.screenshot!);
                      }}
                      className="relative group h-12 w-16 mx-auto block overflow-hidden rounded-xl border border-gray-700 shadow-sm transition-all hover:border-blue-500/50"
                      title="View Analysis Chart"
                    >
                      <img 
                        src={trade.screenshot} 
                        alt="Thumbnail" 
                        className="h-full w-full rounded object-cover transition-transform group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 size={16} className="text-white" />
                      </div>
                    </button>
                  ) : (
                    <div className="h-12 w-16 mx-auto flex items-center justify-center bg-gray-900 rounded-xl border border-gray-800 opacity-20">
                      <ImageIcon size={18} />
                    </div>
                  )}
                </td>
                <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(trade);
                      }}
                      className="text-gray-500 hover:text-blue-400 p-2.5 hover:bg-blue-400/10 rounded-xl transition-all border border-transparent hover:border-blue-400/20"
                      title="Edit Entry"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(trade.id);
                      }}
                      className="text-gray-500 hover:text-red-400 p-2.5 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20"
                      title="Purge Entry"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTrades.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-500 bg-gray-900/20">
            <div className="bg-gray-800 p-6 rounded-3xl mb-4 border border-gray-700 shadow-inner">
              <Filter className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-white font-black text-lg uppercase tracking-tight">Zero Records Found</p>
            <p className="text-sm text-gray-600 mt-1 mb-6">No trades match the current data filtering criteria.</p>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-blue-400 hover:text-blue-300 text-xs font-black uppercase tracking-widest bg-blue-400/10 px-6 py-3 rounded-2xl border border-blue-400/20 transition-all"
              >
                Clear all active filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
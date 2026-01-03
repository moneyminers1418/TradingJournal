import React, { useState } from 'react';
import { Trade, TradeType } from '../types';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, 
  Clock, Image as ImageIcon, Target 
} from 'lucide-react';

interface TradeCalendarProps {
  trades: Trade[];
}

export const TradeCalendar: React.FC<TradeCalendarProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateTrades, setSelectedDateTrades] = useState<Trade[] | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    const newDate = new Date(currentDate.getFullYear(), newMonth, 1);
    setCurrentDate(newDate);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    const newDate = new Date(newYear, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: number) => {
    const selectedTrades = trades.filter(t => {
      const tDate = new Date(t.entryDate);
      return (
        tDate.getDate() === day &&
        tDate.getMonth() === currentDate.getMonth() &&
        tDate.getFullYear() === currentDate.getFullYear() &&
        t.exitDate // Only closed trades
      );
    });

    if (selectedTrades.length > 0) {
      setSelectedDateTrades(selectedTrades);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate); // 0 = Sunday
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Group trades by day and Calculate Monthly PnL
  const tradesByDay: Record<number, { pnl: number, count: number, wins: number, losses: number }> = {};
  let monthlyPnL = 0;

  trades.forEach(t => {
    const tDate = new Date(t.entryDate);
    if (tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear() && t.exitDate) {
      const day = tDate.getDate();
      if (!tradesByDay[day]) {
        tradesByDay[day] = { pnl: 0, count: 0, wins: 0, losses: 0 };
      }
      tradesByDay[day].pnl += (t.pnl || 0);
      tradesByDay[day].count += 1;
      if ((t.pnl || 0) > 0) tradesByDay[day].wins += 1;
      else tradesByDay[day].losses += 1;

      monthlyPnL += (t.pnl || 0);
    }
  });

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 11}, (_, i) => currentYear - 5 + i);

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm overflow-hidden h-full flex flex-col relative">
      
      {/* Trade Details Modal */}
      {selectedDateTrades && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-gray-850 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900 rounded-t-xl sticky top-0">
              <div>
                <h3 className="text-xl font-bold text-white">Daily Recap</h3>
                <p className="text-sm text-gray-400">
                  {new Date(selectedDateTrades[0].date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedDateTrades(null)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-900/50">
              {selectedDateTrades.map((trade) => (
                <div key={trade.id} className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-sm hover:border-gray-600 transition-all">
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-700/50 flex justify-between items-start bg-gray-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white">{trade.symbol}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          trade.type === TradeType.LONG ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {trade.type}
                        </span>
                        <span className="text-[10px] text-gray-400 border border-gray-700 bg-gray-700/30 px-1.5 py-0.5 rounded">
                          {trade.assetClass}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 gap-3">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(trade.entryDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>•</span>
                        <span>{trade.setup || 'No Setup'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className={`text-xl font-mono font-bold ${
                         (trade.pnl || 0) >= 0 ? 'text-trading-green' : 'text-trading-red'
                       }`}>
                         {(trade.pnl || 0) >= 0 ? '+' : ''}
                         {(trade.pnl || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                       </div>
                       <div className="text-[10px] text-gray-500 uppercase tracking-wide">Net P&L</div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 grid grid-cols-2 gap-4 bg-gray-800/50">
                    
                    {/* Stats Grid */}
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Entry</span>
                          <span className="text-gray-300 font-mono">{trade.entryPrice.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Exit</span>
                          <span className="text-gray-300 font-mono">{trade.exitPrice?.toLocaleString() || '-'}</span>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Qty</span>
                          <span className="text-gray-300 font-mono">{trade.quantity}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Fees</span>
                          <span className="text-red-400 font-mono">-{trade.fees.toFixed(2)}</span>
                       </div>
                    </div>
                  </div>
                  
                  {/* Context & Notes */}
                   {(trade.entryReason || trade.mistakes?.length > 0 || trade.notes || trade.screenshot) && (
                      <div className="p-3 bg-gray-900 border-t border-gray-700/50 text-xs space-y-2">
                          {trade.entryReason && (
                              <div className="flex gap-2">
                                  <span className="text-gray-500 min-w-[50px]">Reason:</span>
                                  <span className="text-gray-300">{trade.entryReason}</span>
                              </div>
                          )}
                          {trade.mistakes && trade.mistakes.length > 0 && (
                             <div className="flex gap-2 items-center">
                                  <span className="text-gray-500 min-w-[50px]">Mistakes:</span>
                                  <div className="flex gap-1 flex-wrap">
                                      {trade.mistakes.map(m => (
                                          <span key={m} className="text-red-300 bg-red-900/20 px-1.5 py-0.5 rounded border border-red-900/30">{m}</span>
                                      ))}
                                  </div>
                              </div>
                          )}
                          {trade.screenshot && (
                              <div className="pt-2">
                                  <div className="flex items-center gap-1 text-blue-400 mb-1">
                                      <ImageIcon size={10} />
                                      <span>Evidence attached</span>
                                  </div>
                                  <img src={trade.screenshot} className="h-20 rounded border border-gray-700 opacity-80 hover:opacity-100 transition-opacity" />
                              </div>
                          )}
                      </div>
                   )}
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-end">
               <button 
                  onClick={() => setSelectedDateTrades(null)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-sm font-medium transition-colors"
               >
                 Close Recap
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex flex-col sm:flex-row justify-between items-center bg-gray-850 gap-4">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CalendarIcon size={18} className="text-gray-400" />
            Performance Calendar
          </h3>
          <button 
            onClick={goToToday} 
            className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20 transition-colors font-medium"
          >
            Today
          </button>
        </div>

        {/* Monthly PnL Badge */}
        <div className={`px-4 py-1.5 rounded-lg border flex items-center gap-2 shadow-sm ${
           monthlyPnL >= 0 
           ? 'bg-trading-green/10 border-trading-green/30 text-trading-green' 
           : 'bg-trading-red/10 border-trading-red/30 text-trading-red'
        }`}>
            <span className="text-xs uppercase font-semibold opacity-80">Monthly Net:</span>
            <span className="font-mono font-bold text-lg">
                {monthlyPnL >= 0 ? '+' : ''}{monthlyPnL.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
            </span>
        </div>
        
        <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg p-1">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center px-2 space-x-2 border-l border-r border-gray-800 mx-1">
             <div className="relative group">
                <select 
                    value={currentDate.getMonth()} 
                    onChange={handleMonthChange}
                    className="appearance-none bg-transparent text-white font-medium text-sm py-1 pr-6 pl-2 cursor-pointer outline-none hover:text-blue-400 transition-colors"
                >
                    {monthNames.map((m, i) => <option key={i} value={i} className="bg-gray-800 text-gray-300">{m}</option>)}
                </select>
             </div>

             <div className="relative group">
                <select 
                    value={currentDate.getFullYear()} 
                    onChange={handleYearChange}
                    className="appearance-none bg-transparent text-white font-medium text-sm py-1 pr-6 pl-2 cursor-pointer outline-none hover:text-blue-400 transition-colors font-mono"
                >
                    {years.map(y => <option key={y} value={y} className="bg-gray-800 text-gray-300">{y}</option>)}
                </select>
             </div>
          </div>

          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-gray-700 bg-gray-900/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-7 auto-rows-fr flex-1 bg-gray-900 overflow-y-auto">
        {days.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} className="border-b border-r border-gray-800 bg-gray-950/30 min-h-[120px]"></div>;
          
          const data = tradesByDay[day];
          const isProfitable = data && data.pnl > 0;
          const isLoss = data && data.pnl < 0;
          const hasTrades = data && data.count > 0;
          
          // Calculate win bar width percentage
          const winPct = hasTrades ? (data.wins / data.count) * 100 : 0;
          
          return (
            <div 
              key={day} 
              onClick={() => hasTrades && handleDayClick(day)}
              className={`min-h-[120px] border-b border-r border-gray-800 p-2 relative transition-all group flex flex-col justify-between ${
                isProfitable ? 'bg-emerald-900/5 hover:bg-emerald-900/10' : 
                isLoss ? 'bg-red-900/5 hover:bg-red-900/10' : 
                'hover:bg-gray-800/50'
              } ${hasTrades ? 'cursor-pointer' : ''}`}
            >
              <div className="flex justify-between items-start">
                 <span className={`text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full ${
                    data 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-600'
                 }`}>
                    {day}
                 </span>
                 {hasTrades && (
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1 -translate-y-1">
                      <div className="bg-blue-600 p-1 rounded-bl-lg rounded-tr-lg shadow-sm">
                        <Target size={10} className="text-white" />
                      </div>
                   </div>
                 )}
              </div>
              
              {data && (
                <div className="flex flex-col items-center justify-end h-full mt-2">
                   <div className={`text-lg font-mono font-bold tracking-tight mb-1 ${
                       isProfitable ? 'text-trading-green' : isLoss ? 'text-trading-red' : 'text-gray-400'
                   }`}>
                     {data.pnl >= 0 ? '+' : ''}{Math.round(data.pnl)}
                   </div>
                   
                   <div className="w-full flex flex-col gap-1 px-2">
                        {/* Win/Loss Bar Visual */}
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden flex">
                            <div style={{ width: `${winPct}%` }} className="h-full bg-trading-green" />
                            <div style={{ width: `${100 - winPct}%` }} className="h-full bg-trading-red" />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium px-0.5">
                            <span>{data.wins}W</span>
                            <span>{data.losses}L</span>
                        </div>
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
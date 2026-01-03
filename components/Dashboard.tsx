import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, ReferenceLine
} from 'recharts';
import { Trade } from '../types';
import { StatCard } from './StatCard';
import { TrendingUp, IndianRupee, Target, Zap, CalendarDays, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
}

export const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const goToPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
   
  // Use exitDate to determine closed trades
  const closedTrades = useMemo(() => trades.filter(t => t.exitDate).sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime()), [trades]);
  const monthTrades = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
    return closedTrades.filter(t => {
      const exit = new Date(t.exitDate!);
      return exit >= start && exit <= end;
    }).sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime());
  }, [closedTrades, currentMonth]);
   
  // Calculate Stats
  const totalPnL = closedTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const winTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
  const lossTrades = closedTrades.filter(t => (t.pnl || 0) <= 0);
  
  const winRate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 0;
  
  const grossProfit = winTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const grossLoss = Math.abs(lossTrades.reduce((acc, t) => acc + (t.pnl || 0), 0));
  
  const avgWin = winTrades.length > 0 ? grossProfit / winTrades.length : 0;
  const avgLoss = lossTrades.length > 0 ? grossLoss / lossTrades.length : 0;

  // Streak Calculation
  let currentStreak = 0;
  let maxWinStreak = 0;
  let tempWinStreak = 0;

  closedTrades.forEach(t => {
      const isWin = (t.pnl || 0) > 0;
      
      // Max Win Streak Calculation
      if (isWin) {
          tempWinStreak++;
          if (tempWinStreak > maxWinStreak) maxWinStreak = tempWinStreak;
      } else {
          tempWinStreak = 0;
      }
  });

  // Current Streak Calculation (iterate backwards)
  if (closedTrades.length > 0) {
      const lastTradeWin = (closedTrades[closedTrades.length - 1].pnl || 0) > 0;
      for (let i = closedTrades.length - 1; i >= 0; i--) {
          const isWin = (closedTrades[i].pnl || 0) > 0;
          if (isWin === lastTradeWin) {
              currentStreak = lastTradeWin ? currentStreak + 1 : currentStreak - 1;
          } else {
              break;
          }
      }
  }

  // Daily Performance (Day of Week) Calculation
  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyStats: Record<string, { wins: number, total: number }> = {
    'Mon': { wins: 0, total: 0 },
    'Tue': { wins: 0, total: 0 },
    'Wed': { wins: 0, total: 0 },
    'Thu': { wins: 0, total: 0 },
    'Fri': { wins: 0, total: 0 },
    'Sat': { wins: 0, total: 0 },
    'Sun': { wins: 0, total: 0 },
  };

  closedTrades.forEach(t => {
      const d = new Date(t.exitDate!);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (dailyStats[dayName]) {
        dailyStats[dayName].total++;
        if ((t.pnl || 0) > 0) dailyStats[dayName].wins++;
      }
  });

  const dailyData = daysOrder.map(day => ({
      name: day,
      winRate: dailyStats[day].total > 0 ? (dailyStats[day].wins / dailyStats[day].total) * 100 : 0,
      total: dailyStats[day].total
  })).filter(d => d.total > 0 || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d.name)); // Keep Mon-Fri visible even if empty

  // Weekly PnL Calculation
  const weeklyPnLStats: Record<string, number> = {};
   
  monthTrades.forEach(t => {
      const d = new Date(t.exitDate!);
      // Get Monday of the week
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(d);
      monday.setDate(diff);
      monday.setHours(0,0,0,0);
      
      const weekKey = monday.toISOString();
      weeklyPnLStats[weekKey] = (weeklyPnLStats[weekKey] || 0) + (t.pnl || 0);
  });

  const weeklyPnLData = Object.entries(weeklyPnLStats)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([dateStr, pnl]) => ({
        name: new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        pnl: pnl,
        dateFull: new Date(dateStr).toLocaleDateString()
    }));

  // Equity Curve Data
  let cumulative = 0;
  const equityData = monthTrades.map(t => {
    cumulative += (t.pnl || 0);
    return {
      date: new Date(t.exitDate!).toLocaleDateString(),
      equity: cumulative,
      pnl: t.pnl
    };
  });

  // Setup Performance Data
  const setupStats: Record<string, number> = {};
  closedTrades.forEach(t => {
    const setup = t.setup || 'Unknown';
    setupStats[setup] = (setupStats[setup] || 0) + (t.pnl || 0);
  });
  const setupData = Object.entries(setupStats).map(([name, value]) => ({ name, value }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded shadow-lg z-50">
          <p className="text-gray-300 text-sm mb-1">{label}</p>
          <p className={`font-mono font-bold ${payload[0].value >= 0 ? 'text-trading-green' : 'text-trading-red'}`}>
            {payload[0].name === 'winRate' ? `${payload[0].value.toFixed(1)}%` : `₹${payload[0].value.toFixed(2)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Net P&L" 
          value={`₹${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={<IndianRupee size={18} />}
          trendDirection={totalPnL >= 0 ? 'up' : 'down'}
          trend={totalPnL >= 0 ? "Profitable" : "Drawdown"}
        />
        <StatCard 
          title="Win Rate" 
          value={`${winRate.toFixed(1)}%`}
          icon={<Target size={18} />}
          subValue={`(${winTrades.length}W / ${lossTrades.length}L)`}
          trendDirection={winRate > 50 ? 'up' : 'neutral'}
        />
        <StatCard 
          title="Avg R:R" 
          value={avgLoss === 0 ? '∞' : (avgWin / avgLoss).toFixed(2)}
          icon={<TrendingUp size={18} />}
          subValue={`Win: ₹${avgWin.toFixed(0)} / Loss: ₹${avgLoss.toFixed(0)}`}
        />
        <StatCard 
          title="Streaks" 
          value={maxWinStreak.toString()}
          icon={<Zap size={18} />}
          subValue={`Current: ${currentStreak > 0 ? '+' : ''}${currentStreak}`}
          trend={currentStreak > 0 ? "Hot" : "Cold"}
          trendDirection={currentStreak > 0 ? 'up' : 'down'}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Equity Curve */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <span>Equity Curve</span>
            <div className="flex items-center gap-2">
              <button onClick={goToPrevMonth} className="p-1 hover:bg-gray-700 rounded text-gray-300"><ChevronLeft size={16} /></button>
              <span className="text-sm text-gray-300">{currentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
              <button onClick={goToNextMonth} className="p-1 hover:bg-gray-700 rounded text-gray-300"><ChevronRight size={16} /></button>
            </div>
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={totalPnL >= 0 ? "#10B981" : "#EF4444"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={totalPnL >= 0 ? "#10B981" : "#EF4444"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12} 
                  tickFormatter={(val) => `₹${val}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="equity" 
                  stroke={totalPnL >= 0 ? "#10B981" : "#EF4444"} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorEquity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Win % (Day of Week) */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
             <CalendarDays size={18} className="text-gray-400"/>
             Win % by Day
          </h3>
          <div className="h-48 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                 <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                 <Tooltip content={<CustomTooltip />} />
                 <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                   {dailyData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? '#10B981' : '#EF4444'} />
                   ))}
                 </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 border-t border-gray-700 pt-4">
             <h3 className="text-sm font-semibold text-white mb-3">Performance by Setup</h3>
             <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setupData} layout="vertical" margin={{ left: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#D1D5DB" fontSize={10} width={80} />
                    <Tooltip cursor={{fill: '#374151', opacity: 0.2}} content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {setupData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#10B981' : '#EF4444'} />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>

      {/* Weekly PnL Chart */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-gray-400"/>
            Weekly Net P&L
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToPrevMonth} className="p-1 hover:bg-gray-700 rounded text-gray-300"><ChevronLeft size={16} /></button>
            <span className="text-sm text-gray-300">{currentMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
            <button onClick={goToNextMonth} className="p-1 hover:bg-gray-700 rounded text-gray-300"><ChevronRight size={16} /></button>
          </div>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyPnLData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
               <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis 
                 stroke="#9CA3AF" 
                 fontSize={12} 
                 tickFormatter={(val) => `₹${val}`}
                 tickLine={false} 
                 axisLine={false} 
               />
               <Tooltip content={<CustomTooltip />} />
               <ReferenceLine y={0} stroke="#6B7280" />
               <Bar dataKey="pnl" radius={[2, 2, 2, 2]}>
                 {weeklyPnLData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                 ))}
               </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
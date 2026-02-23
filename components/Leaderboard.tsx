
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, MapPin, Search, TrendingUp, User as UserIcon, ChevronRight, Calculator, PieChart, Activity, Star, Clock, ChevronDown, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricRollup, User } from '../types';
import { db } from '../services/mockDatabase';
import HandbookLink from './HandbookLink';

interface LeaderboardProps {
  data: MetricRollup[];
  isAdmin?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data, isAdmin }) => {
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [growthData, setGrowthData] = useState<{ month: string, score: number }[]>([]);
  const leaderboardData = data || [];
  const topThree = leaderboardData.slice(0, 3);

  useEffect(() => {
    const fetchData = async () => {
      const [users, allSubmissions, tasks] = await Promise.all([
        db.getAllUsers(),
        db.getSubmissions(),
        db.getTasks()
      ]);

      const map: Record<string, User> = {};
      users.forEach(u => map[u.id] = u);
      setUserMap(map);

      // Calculate monthly growth data
      const approvedSubmissions = allSubmissions.filter(s => s.status === 'approved');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      const monthlyScores: Record<string, number> = {};
      // Initialize months up to current
      for (let i = 0; i <= currentMonth; i++) {
        monthlyScores[months[i]] = 0;
      }

      approvedSubmissions.forEach(s => {
        const date = new Date(s.createdAt);
        const monthName = months[date.getMonth()];
        if (monthlyScores[monthName] !== undefined) {
          const task = tasks.find(t => t.id === s.taskId);
          if (task) {
            monthlyScores[monthName] += task.points;
          }
        }
      });

      const formattedData = Object.keys(monthlyScores).map(m => ({
        month: m,
        score: monthlyScores[m]
      }));

      // If we only have one month of data, add a zero-point previous month for better visualization
      if (formattedData.length === 1 && currentMonth > 0) {
        formattedData.unshift({ month: months[currentMonth - 1], score: 0 });
      } else if (formattedData.length === 0) {
        // Fallback if no data at all
        setGrowthData([
          { month: months[Math.max(0, currentMonth - 1)], score: 0 },
          { month: months[currentMonth], score: 0 }
        ]);
        return;
      }

      setGrowthData(formattedData);
    };
    fetchData();
  }, []);

  const Avatar = ({ userId, size = 20 }: { userId: string, size?: number }) => {
    const user = userMap[userId];
    return (
      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
        ) : (
          <UserIcon size={size * 0.6} className="text-slate-300" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="flex items-center gap-4">
          <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">
            Ranks
          </h2>
          <HandbookLink label="Scoring info" />
        </div>
      </header>

      <section className="bg-white p-10 md:p-14 rounded-[56px] swiggy-shadow border border-slate-50/80 premium-card-shadow relative overflow-hidden">
         <div className="absolute top-0 right-0 p-16 opacity-[0.02] text-swiggy-orange pointer-events-none">
            <TrendingUp size={240} strokeWidth={1} />
         </div>
         
         <div className="flex items-center justify-between mb-12 relative">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-swiggy-light text-swiggy-orange rounded-[18px] flex items-center justify-center shadow-inner shadow-orange-100/50">
                  <TrendingUp size={24} strokeWidth={2.5} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1.5">Monthly Score</h3>
               </div>
            </div>
         </div>
         
         <div className="h-72 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB5404" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#FB5404" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F8FAFC" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} 
                    dy={15}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 20px 40px rgba(0,0,0,0.06)', 
                      fontWeight: 900,
                      padding: '12px 20px'
                    }} 
                    itemStyle={{ textTransform: 'capitalize' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    name="score"
                    stroke="#FB5404" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </section>

      <section className="bg-white p-10 rounded-[48px] swiggy-shadow border border-slate-50 flex flex-col md:flex-row items-center gap-8 premium-card-shadow">
        <div className="w-16 h-16 bg-orange-50 text-swiggy-orange rounded-[22px] flex items-center justify-center shrink-0 shadow-inner">
          <BarChart3 size={32} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2.5">Leaderboard Calculation</h3>
          <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-4xl tracking-tight">
            Your rank is determined based on the impact you create on campus, your consistency across tasks, and the quality of your submissions. Focus on driving real results to climb the leaderboard.
          </p>
        </div>
      </section>

      {/* Podium Section - The Top 3 Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end py-16 px-6 relative">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100/50 rounded-full"></div>
        
        {/* Rank #2 */}
        <div className="order-2 md:order-1 flex flex-col items-center">
          {topThree[1] && (
            <div className="text-center animate-in slide-in-from-bottom duration-1000 delay-200 group">
              <div className="w-24 h-24 rounded-[36px] border-[5px] border-slate-100 p-1 mb-6 relative mx-auto bg-white shadow-xl transition-transform group-hover:scale-105">
                <Avatar userId={topThree[1].userId} size={24} />
                <div className="absolute -bottom-2 -right-2 bg-slate-400 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white font-black text-[13px]">2</span>
                </div>
              </div>
              <h4 className="font-black text-slate-900 text-lg mb-1 tracking-tight">{userMap[topThree[1].userId]?.displayName}</h4>
              <p className="text-[11px] text-slate-400 font-bold flex items-center justify-center gap-1.5 tracking-tight">
                <MapPin size={12} strokeWidth={2.5} /> {db.getCampusName(userMap[topThree[1].userId]?.campusId || '')}
              </p>
              <div className="mt-6 bg-white px-8 py-3 rounded-[24px] shadow-lg border border-slate-100 group-hover:swiggy-shadow transition-all">
                <span className="font-black text-slate-400 text-lg tracking-tight">{topThree[1].score} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Rank #1 */}
        <div className="order-1 md:order-2 flex flex-col items-center mb-8 md:mb-0">
          {topThree[0] && (
            <div className="text-center animate-in slide-in-from-bottom duration-1000 group">
              <div className="w-32 h-32 rounded-[48px] border-[6px] border-swiggy-orange p-1 mb-8 relative mx-auto shadow-2xl shadow-orange-100/60 scale-110 bg-white transition-transform group-hover:scale-[1.15]">
                <Avatar userId={topThree[0].userId} size={32} />
                <div className="absolute -top-9 left-1/2 -translate-x-1/2">
                  <Crown size={44} className="text-swiggy-orange fill-swiggy-orange filter drop-shadow-md" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-swiggy-orange w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                  <span className="text-white font-black text-lg leading-none">1</span>
                </div>
              </div>
              <h4 className="font-black text-2xl text-slate-900 mb-1.5 tracking-tighter">{userMap[topThree[0].userId]?.displayName}</h4>
              <p className="text-xs text-slate-400 font-bold flex items-center justify-center gap-2 tracking-tight">
                <MapPin size={14} strokeWidth={3} className="text-swiggy-orange" /> {db.getCampusName(userMap[topThree[0].userId]?.campusId || '')}
              </p>
              <div className="mt-8 swiggy-btn-gradient px-10 py-4 rounded-[28px] shadow-2xl shadow-orange-200 scale-110 active:scale-105 transition-transform cursor-default">
                <span className="font-black text-white text-xl tracking-tight">{topThree[0].score} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Rank #3 */}
        <div className="order-3 flex flex-col items-center">
          {topThree[2] && (
            <div className="text-center animate-in slide-in-from-bottom duration-1000 delay-300 group">
              <div className="w-24 h-24 rounded-[36px] border-[5px] border-amber-50 p-1 mb-6 relative mx-auto bg-white shadow-xl transition-transform group-hover:scale-105">
                <Avatar userId={topThree[2].userId} size={24} />
                <div className="absolute -bottom-2 -right-2 bg-amber-600 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-white font-black text-[13px]">3</span>
                </div>
              </div>
              <h4 className="font-black text-slate-900 text-lg mb-1 tracking-tight">{userMap[topThree[2].userId]?.displayName}</h4>
              <p className="text-[11px] text-slate-400 font-bold flex items-center justify-center gap-1.5 tracking-tight">
                <MapPin size={12} strokeWidth={2.5} /> {db.getCampusName(userMap[topThree[2].userId]?.campusId || '')}
              </p>
              <div className="mt-6 bg-white px-8 py-3 rounded-[24px] shadow-lg border border-slate-100 group-hover:swiggy-shadow transition-all">
                <span className="font-black text-slate-400 text-lg tracking-tight">{topThree[2].score} pts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-[56px] swiggy-shadow border border-slate-50/80 overflow-hidden premium-card-shadow">
        <div className="grid grid-cols-12 px-10 py-6 bg-slate-50/50 text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-widest">
          <div className="col-span-2">Position</div>
          <div className="col-span-7">Name</div>
          <div className="col-span-3 text-right">Score</div>
        </div>
        <div className="divide-y divide-slate-50">
          {leaderboardData.length > 0 ? leaderboardData.map((catalyst, idx) => {
            const u = userMap[catalyst.userId];
            return (
              <div key={catalyst.userId} className="grid grid-cols-12 px-10 py-6 items-center hover:bg-slate-50/50 transition-all group cursor-default">
                <div className="col-span-2 font-black text-slate-300 text-2xl group-hover:text-swiggy-orange transition-colors">#{idx + 1}</div>
                <div className="col-span-7 flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden shrink-0 border border-slate-100 swiggy-shadow p-1 group-hover:scale-105 transition-transform">
                    {u?.avatarUrl ? (
                      <img src={u.avatarUrl} className="w-full h-full object-cover rounded-[18px]" alt="Profile" />
                    ) : (
                      <UserIcon size={24} className="text-slate-200 m-auto mt-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-base font-black text-slate-900 truncate mb-0.5 tracking-tight">{u?.displayName || 'Loading...'}</h5>
                    <p className="text-[10px] text-slate-400 font-bold truncate tracking-widest uppercase">{db.getCampusName(u?.campusId || '')}</p>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-2xl font-black text-slate-900 leading-none group-hover:text-swiggy-orange transition-colors">{catalyst.score}</span>
                </div>
              </div>
            );
          }) : (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-bold text-sm">No leaderboard data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

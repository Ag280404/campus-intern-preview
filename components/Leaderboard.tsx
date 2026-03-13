
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
          <h2 className="heading-display text-[34px] text-[#141414] leading-none">
            Ranks
          </h2>
          <HandbookLink label="Scoring info" />
        </div>
      </header>

      <section className="bg-white p-8 md:p-12 rounded-2xl premium-card-shadow border border-[#E3DDD5] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-14 opacity-[0.025] text-swiggy-orange pointer-events-none">
            <TrendingUp size={200} strokeWidth={1} />
         </div>

         <div className="flex items-center justify-between mb-10 relative">
            <div className="flex items-center gap-3.5">
               <div className="w-10 h-10 bg-[#FEF0E6] text-swiggy-orange rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} strokeWidth={2.5} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-[#141414] tracking-tight leading-none mb-1">Monthly Score</h3>
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
                      borderRadius: '10px',
                      border: '1px solid #E3DDD5',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      fontWeight: 700,
                      padding: '8px 14px',
                      fontSize: '12px'
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

      <section className="bg-white p-8 rounded-xl premium-card-shadow border border-[#E3DDD5] flex flex-col md:flex-row items-center gap-7">
        <div className="w-12 h-12 bg-[#FEF0E6] text-swiggy-orange rounded-xl flex items-center justify-center shrink-0">
          <BarChart3 size={24} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-base font-black text-[#141414] tracking-tight leading-none mb-2">Leaderboard Calculation</h3>
          <p className="text-[13px] text-[#72665C] font-semibold leading-relaxed max-w-4xl">
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
            <div className="text-center animate-in slide-in-from-bottom duration-700 delay-200 group">
              <div className="w-20 h-20 rounded-2xl border-[3px] border-[#E3DDD5] p-1 mb-5 relative mx-auto bg-white premium-card-shadow transition-transform group-hover:scale-105 group-hover:-translate-y-1">
                <Avatar userId={topThree[1].userId} size={24} />
                <div className="absolute -bottom-2 -right-2 bg-[#8B9099] w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white shadow-md">
                  <span className="text-white font-black text-[11px]">2</span>
                </div>
              </div>
              <h4 className="font-black text-[#141414] text-base mb-1 tracking-tight">{userMap[topThree[1].userId]?.displayName}</h4>
              <p className="text-[10px] text-[#A09488] font-bold flex items-center justify-center gap-1.5">
                <MapPin size={10} strokeWidth={2.5} /> {db.getCampusName(userMap[topThree[1].userId]?.campusId || '')}
              </p>
              <div className="mt-5 bg-white px-6 py-2.5 rounded-lg premium-card-shadow border border-[#E3DDD5] group-hover:border-[#D4CEC7] transition-all">
                <span className="font-black text-[#8B9099] text-base tracking-tight">{topThree[1].score} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Rank #1 */}
        <div className="order-1 md:order-2 flex flex-col items-center mb-8 md:mb-0">
          {topThree[0] && (
            <div className="text-center animate-in slide-in-from-bottom duration-700 group">
              <div className="w-28 h-28 rounded-[28px] border-[4px] border-swiggy-orange p-1 mb-7 relative mx-auto scale-105 bg-white transition-all group-hover:scale-110 group-hover:-translate-y-2" style={{boxShadow:'0 12px 40px rgba(251,84,4,0.25), 0 4px 12px rgba(0,0,0,0.1)'}}>
                <Avatar userId={topThree[0].userId} size={32} />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <Crown size={36} className="text-swiggy-orange fill-swiggy-orange drop-shadow" strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-swiggy-orange w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-white shadow-lg">
                  <span className="text-white font-black text-base leading-none">1</span>
                </div>
              </div>
              <h4 className="font-black text-xl text-[#141414] mb-1.5 tracking-tight">{userMap[topThree[0].userId]?.displayName}</h4>
              <p className="text-[11px] text-[#A09488] font-bold flex items-center justify-center gap-1.5">
                <MapPin size={12} strokeWidth={2.5} className="text-swiggy-orange" /> {db.getCampusName(userMap[topThree[0].userId]?.campusId || '')}
              </p>
              <div className="mt-6 swiggy-btn-gradient px-8 py-3.5 rounded-xl scale-105 cursor-default">
                <span className="font-black text-white text-lg tracking-tight">{topThree[0].score} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Rank #3 */}
        <div className="order-3 flex flex-col items-center">
          {topThree[2] && (
            <div className="text-center animate-in slide-in-from-bottom duration-700 delay-300 group">
              <div className="w-20 h-20 rounded-2xl border-[3px] border-amber-100 p-1 mb-5 relative mx-auto bg-white premium-card-shadow transition-transform group-hover:scale-105 group-hover:-translate-y-1">
                <Avatar userId={topThree[2].userId} size={24} />
                <div className="absolute -bottom-2 -right-2 bg-amber-600 w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-white shadow-md">
                  <span className="text-white font-black text-[11px]">3</span>
                </div>
              </div>
              <h4 className="font-black text-[#141414] text-base mb-1 tracking-tight">{userMap[topThree[2].userId]?.displayName}</h4>
              <p className="text-[10px] text-[#A09488] font-bold flex items-center justify-center gap-1.5">
                <MapPin size={10} strokeWidth={2.5} /> {db.getCampusName(userMap[topThree[2].userId]?.campusId || '')}
              </p>
              <div className="mt-5 bg-white px-6 py-2.5 rounded-lg premium-card-shadow border border-[#E3DDD5] group-hover:border-amber-200 transition-all">
                <span className="font-black text-amber-600 text-base tracking-tight">{topThree[2].score} pts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl premium-card-shadow border border-[#E3DDD5] overflow-hidden">
        <div className="grid grid-cols-12 px-8 py-4 bg-[#F8F5F1] text-[10px] font-bold text-[#A09488] border-b border-[#E3DDD5] uppercase tracking-[0.12em]">
          <div className="col-span-2">Rank</div>
          <div className="col-span-7">Catalyst</div>
          <div className="col-span-3 text-right">Score</div>
        </div>
        <div className="divide-y divide-[#F3EFE9]">
          {leaderboardData.length > 0 ? leaderboardData.map((catalyst, idx) => {
            const u = userMap[catalyst.userId];
            return (
              <div key={catalyst.userId} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-[#FAF8F5] transition-colors group cursor-default">
                <div className="col-span-2 font-black text-[#D4CEC7] text-xl group-hover:text-swiggy-orange transition-colors">#{idx + 1}</div>
                <div className="col-span-7 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-white overflow-hidden shrink-0 border border-[#E3DDD5] swiggy-shadow p-0.5 group-hover:scale-105 transition-transform">
                    {u?.avatarUrl ? (
                      <img src={u.avatarUrl} className="w-full h-full object-cover rounded-[10px]" alt="Profile" />
                    ) : (
                      <UserIcon size={20} className="text-[#D4CEC7] m-auto mt-2.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-[13px] font-black text-[#141414] truncate mb-0.5 tracking-tight">{u?.displayName || 'Loading...'}</h5>
                    <p className="text-[10px] text-[#A09488] font-bold truncate tracking-[0.1em] uppercase">{db.getCampusName(u?.campusId || '')}</p>
                  </div>
                </div>
                <div className="col-span-3 text-right">
                  <span className="text-xl font-black text-[#141414] leading-none group-hover:text-swiggy-orange transition-colors">{catalyst.score}</span>
                </div>
              </div>
            );
          }) : (
            <div className="p-16 text-center">
              <p className="text-[#A09488] font-bold text-sm">No leaderboard data available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

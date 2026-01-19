
import React, { useState } from 'react';
import { Trophy, Medal, Crown, MapPin, Search, TrendingUp, ArrowUpRight, User as UserIcon, ClipboardList, Camera, QrCode, Ticket, BarChart3, ChevronRight, Calculator, PieChart, Activity, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MetricRollup } from '../types';
import { db } from '../services/mockDatabase';

interface LeaderboardProps {
  data: MetricRollup[];
  isAdmin?: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = data.filter(item => {
    const user = db.getUserById(item.userId);
    return user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
           db.getCampusName(user.campusId).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const topThree = filteredData.slice(0, 3);
  const others = filteredData.slice(3);

  // Growth Data for the Graph at the top (Page 2 of PDF)
  const growthData = [
    { month: 'Jan', performance: 45 },
    { month: 'Feb', performance: 52 },
    { month: 'Mar', performance: 48 },
    { month: 'Apr', performance: 61 },
    { month: 'May', performance: 75 },
    { month: 'Jun', performance: 88 },
  ];

  const Avatar = ({ userId, size = 20 }: { userId: string, size?: number }) => {
    const user = db.getUserById(userId);
    return (
      <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} className="w-full h-full object-cover" />
        ) : (
          <UserIcon size={size * 0.6} className="text-slate-300" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            {isAdmin ? "Intern Performance Ranks" : "Monthly Intern Leaderboard"}
          </h2>
          <p className="text-slate-500 mt-1 font-medium">
            {isAdmin ? "Weighted scoring based on verified campus impact." : "Tracking your growth performance month-over-month."}
          </p>
        </div>
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Search intern or campus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-swiggy-orange outline-none bg-white text-sm min-w-[320px] swiggy-shadow font-bold text-slate-700"
          />
        </div>
      </header>

      {/* MoM Performance Graph - Page 2 of PDF (Top of the page) */}
      <section className="bg-white p-8 rounded-[40px] swiggy-shadow border border-slate-100">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-swiggy-light text-swiggy-orange rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} />
               </div>
               <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">MoM Aggregate Performance</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Aggregate scoring across all active catalysts</p>
               </div>
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
               <ArrowUpRight size={14} /> +12% vs last month
            </div>
         </div>
         
         <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPerformance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FB5404" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#FB5404" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} 
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', fontWeight: 900 }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="#FB5404" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPerformance)" 
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </section>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end py-10 px-4">
        {/* Silver */}
        <div className="order-2 md:order-1 flex flex-col items-center">
          {topThree[1] && (
            <div className="text-center animate-in slide-in-from-bottom duration-700 delay-100">
              <div className="w-20 h-20 rounded-[28px] border-4 border-slate-100 p-1 mb-4 relative mx-auto bg-white swiggy-shadow">
                <Avatar userId={topThree[1].userId} size={20} />
                <div className="absolute -bottom-2 -right-2 bg-slate-300 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                  <Medal size={16} className="text-white" />
                </div>
              </div>
              <h4 className="font-black text-slate-900">{db.getUserById(topThree[1].userId)?.displayName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center justify-center gap-1 mt-0.5">
                <MapPin size={10} /> {db.getCampusName(db.getUserById(topThree[1].userId)?.campusId || '')}
              </p>
              <div className="mt-4 bg-white px-6 py-2 rounded-2xl shadow-md border border-slate-100">
                <span className="font-black text-slate-400 text-lg">Rank #2</span>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{topThree[1].score} Score</p>
              </div>
            </div>
          )}
        </div>

        {/* Gold */}
        <div className="order-1 md:order-2 flex flex-col items-center">
          {topThree[0] && (
            <div className="text-center animate-in slide-in-from-bottom duration-700">
              <div className="w-28 h-28 rounded-[40px] border-4 border-swiggy-orange p-1 mb-4 relative mx-auto shadow-2xl shadow-orange-100 scale-110 bg-white">
                <Avatar userId={topThree[0].userId} size={28} />
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 group">
                  <Crown size={36} className="text-swiggy-orange fill-swiggy-orange group-hover:scale-110 transition-transform" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-swiggy-orange w-10 h-10 rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-white font-black text-sm">1</span>
                </div>
              </div>
              <h4 className="font-black text-xl text-slate-900">{db.getUserById(topThree[0].userId)?.displayName}</h4>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest flex items-center justify-center gap-1 mt-1">
                <MapPin size={12} className="text-swiggy-orange" /> {db.getCampusName(db.getUserById(topThree[0].userId)?.campusId || '')}
              </p>
              <div className="mt-6 bg-swiggy-orange px-8 py-3 rounded-[24px] shadow-xl shadow-orange-200 scale-110 active:scale-105 transition-transform">
                <span className="font-black text-white text-xl uppercase tracking-tighter">Current Rank #1</span>
                <p className="text-[10px] font-black text-orange-200 uppercase tracking-widest">{topThree[0].score} Score</p>
              </div>
            </div>
          )}
        </div>

        {/* Bronze */}
        <div className="order-3 flex flex-col items-center">
          {topThree[2] && (
            <div className="text-center animate-in slide-in-from-bottom duration-700 delay-200">
              <div className="w-20 h-20 rounded-[28px] border-4 border-amber-100 p-1 mb-4 relative mx-auto bg-white swiggy-shadow">
                <Avatar userId={topThree[2].userId} size={20} />
                <div className="absolute -bottom-2 -right-2 bg-amber-600 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white">
                  <Medal size={16} className="text-white" />
                </div>
              </div>
              <h4 className="font-black text-slate-900">{db.getUserById(topThree[2].userId)?.displayName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center justify-center gap-1 mt-0.5">
                <MapPin size={10} /> {db.getCampusName(db.getUserById(topThree[2].userId)?.campusId || '')}
              </p>
              <div className="mt-4 bg-white px-6 py-2 rounded-2xl shadow-md border border-slate-100">
                <span className="font-black text-amber-700 text-lg">Rank #3</span>
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{topThree[2].score} Score</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ranks/Performance List */}
      <div className="bg-white rounded-[40px] swiggy-shadow border border-slate-50 overflow-hidden">
        <div className="grid grid-cols-12 px-8 py-5 bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">
          <div className="col-span-1">Rank</div>
          <div className="col-span-7">Intern / Campus</div>
          <div className="col-span-4 text-right">Weighted Performance</div>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredData.map((catalyst, idx) => {
            const u = db.getUserById(catalyst.userId);
            return (
              <div key={catalyst.userId} className="grid grid-cols-12 px-8 py-5 items-center hover:bg-slate-50/50 transition-colors group">
                <div className="col-span-1 font-black text-slate-300 text-lg">#{idx + 1}</div>
                <div className="col-span-7 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-white overflow-hidden shrink-0 border border-slate-100 swiggy-shadow p-0.5">
                    {u?.avatarUrl ? (
                      <img src={u.avatarUrl} className="w-full h-full object-cover rounded-[16px]" />
                    ) : (
                      <UserIcon size={20} className="text-slate-200 m-auto mt-2.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-base font-black text-slate-900 truncate">{u?.displayName}</h5>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest truncate">{db.getCampusName(u?.campusId || '')}</p>
                  </div>
                </div>
                <div className="col-span-4 text-right flex items-center justify-end gap-3">
                  <div className="text-right">
                    <span className="text-xl font-black text-slate-900 leading-none">{catalyst.score}</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Weighted Score</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-swiggy-orange group-hover:bg-white transition-all shadow-sm">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scoring Formula Explanation - Redesigned per Page 2 of PDF (Bottom of page, Light theme) */}
      <section className="bg-swiggy-light/50 border border-swiggy-orange/10 p-10 rounded-[40px] swiggy-shadow overflow-hidden relative">
         <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
            <Calculator size={200} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-swiggy-orange shadow-sm">
                <PieChart size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">WEIGHTED LEADERBOARD CALCULATION</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">How your rank is determined</p>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-[32px] border border-swiggy-orange/5 swiggy-shadow mb-10">
               <p className="text-3xl font-black text-center text-swiggy-orange tracking-tight">
                  The score is based on impact, consistency, and quality of submission, with impact carrying the highest weight.
               </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest border-b-4 border-swiggy-orange pb-1 w-fit">
                    <TrendingUp size={16} className="text-swiggy-orange" /> Impact (60%)
                  </div>
                  <ul className="text-xs space-y-3 text-slate-600 font-bold">
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• Rewards Signup</span> <span className="bg-swiggy-light px-2 py-0.5 rounded text-swiggy-orange">25%</span></li>
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• OPD Growth</span> <span className="bg-swiggy-light px-2 py-0.5 rounded text-swiggy-orange">25%</span></li>
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• NU Coupon Redemption</span> <span className="bg-swiggy-light px-2 py-0.5 rounded text-swiggy-orange">10%</span></li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest border-b-4 border-[#171F2C] pb-1 w-fit">
                    <Activity size={16} className="text-[#171F2C]" /> Consistency (25%)
                  </div>
                  <ul className="text-xs space-y-3 text-slate-600 font-bold">
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• Tasks completed on time</span> <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">10%</span></li>
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• Weekly Active Participation</span> <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-900">15%</span></li>
                  </ul>
               </div>
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest border-b-4 border-swiggy-orange pb-1 w-fit">
                    <Star size={16} className="text-swiggy-orange" /> Quality (15%)
                  </div>
                  <ul className="text-xs space-y-3 text-slate-600 font-bold">
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• Social post quality score</span> <span className="bg-swiggy-light px-2 py-0.5 rounded text-swiggy-orange">5%</span></li>
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• NU Eligibility Ratio</span> <span className="bg-swiggy-light px-2 py-0.5 rounded text-swiggy-orange">5%</span></li>
                    <li className="flex justify-between items-center bg-white/50 p-2 rounded-xl"><span>• New Eligible Users</span> <span className="bg-swiggy-light px-2 py-0.5 rounded text-swiggy-orange">5%</span></li>
                  </ul>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

export default Leaderboard;

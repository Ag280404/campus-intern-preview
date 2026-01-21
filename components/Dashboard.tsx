import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Info, LayoutDashboard } from 'lucide-react';
import { Submission, MetricRollup, User } from '../types';
import { db } from '../services/mockDatabase';
import { TASKS } from '../constants';

interface DashboardProps {
  submissions: Submission[];
  leaderboard: MetricRollup[];
  user: User | null;
  isAdmin?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ user, submissions, isAdmin }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  const embedUrl = "https://lookerstudio.google.com/embed/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";
  const publicUrl = "https://lookerstudio.google.com/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (isAdmin && user) {
    const campusName = db.getCampusName(user.campusId);
    
    const stats = {
      assigned: 5,
      completed: submissions.filter(s => s.status === 'approved').length,
      inProgress: 2,
      notStarted: 1,
      notCompleted: 3
    };

    const taskList = [
      { id: 1, name: 'New User Coupon Distribution', status: 'Completed', assigned: 10, completed: 10, color: 'bg-emerald-50/50 text-emerald-700' },
      { id: 2, name: 'Social Media Post', status: 'In Progress', assigned: 10, completed: 6, color: 'bg-amber-50/50 text-amber-700' },
      { id: 3, name: 'Student Rewards Referrals', status: 'In Progress', assigned: 10, completed: 3, color: 'bg-amber-50/50 text-amber-700' },
      { id: 4, name: 'Monthly Campus Streak Day Selection', status: 'Not Started', assigned: 1, completed: 0, color: 'bg-slate-50/50 text-slate-500' },
      { id: 5, name: 'Flyer/Digital Poster Distribution', status: 'Not Started', assigned: 10, completed: 0, color: 'bg-slate-50/50 text-slate-500' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-1 py-4">
          <div className="flex-1">
            <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-none uppercase">CAMPUS INSIGHTS</h2>
          </div>
          <div className="flex gap-3 shrink-0 pt-1">
            <button 
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-[18px] text-[11px] font-black text-slate-600 hover:bg-slate-50 hover:text-swiggy-orange transition-all swiggy-shadow uppercase tracking-widest"
            >
              <RefreshCw size={14} className={refreshKey > 0 ? "animate-spin-once" : ""} /> Sync
            </button>
            <a 
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-swiggy-orange text-white rounded-[18px] font-black text-[11px] hover:bg-[#E14A00] transition-all swiggy-shadow shadow-orange-100 uppercase tracking-widest"
            >
              <ExternalLink size={14} strokeWidth={3} /> Pop out
            </a>
          </div>
        </header>

        <div className="bg-white rounded-[48px] p-10 md:p-14 swiggy-shadow border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-swiggy-orange pointer-events-none">
            <LayoutDashboard size={240} strokeWidth={1} />
          </div>

          <div className="inline-block bg-slate-900 text-white px-8 py-3.5 rounded-[20px] mb-12 shadow-xl shadow-slate-100">
            <h3 className="text-xl font-black tracking-tight uppercase">{campusName}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
             <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 text-center space-y-1 transition-all hover:bg-white hover:swiggy-shadow">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Assigned tasks</p>
                <p className="text-6xl font-black text-slate-900 tracking-tighter">{stats.assigned}</p>
             </div>
             <div className="bg-swiggy-light/30 p-8 rounded-[32px] border border-swiggy-orange/10 text-center space-y-1 transition-all hover:bg-white hover:swiggy-shadow">
                <p className="text-swiggy-orange font-bold text-[10px] uppercase tracking-widest">Completed</p>
                <p className="text-6xl font-black text-swiggy-orange tracking-tighter">{stats.completed}</p>
             </div>
             <div className="bg-amber-50/30 p-8 rounded-[32px] border border-amber-200/50 text-center space-y-1 transition-all hover:bg-white hover:swiggy-shadow">
                <p className="text-amber-600 font-bold text-[10px] uppercase tracking-widest">In progress</p>
                <p className="text-6xl font-black text-slate-900 tracking-tighter">{stats.inProgress}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-2xl mx-auto">
             <div className="bg-slate-50/50 p-7 rounded-[32px] border border-slate-100 text-center space-y-1">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Not started</p>
                <p className="text-5xl font-black text-slate-800 tracking-tighter">{stats.notStarted}</p>
             </div>
             <div className="bg-slate-50/50 p-7 rounded-[32px] border border-slate-100 text-center space-y-1">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Pending verification</p>
                <p className="text-5xl font-black text-slate-800 tracking-tighter">{stats.notCompleted}</p>
             </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase">Active Catalyst Workflow</h4>
            <div className="overflow-hidden border border-slate-100 rounded-[32px] shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Id</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 text-right uppercase tracking-widest">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {taskList.map((task, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-5 text-sm font-black text-slate-300">0{idx + 1}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-800 uppercase tracking-tight">{task.name}</td>
                      <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${task.color}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-700 text-sm">
                        {task.completed} <span className="text-slate-300 font-medium">/ {task.assigned}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-1 py-4">
        <div className="flex-1">
          <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-none uppercase">DASHBOARD</h2>
        </div>
        <div className="flex gap-3 shrink-0 pt-1">
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-[18px] text-[11px] font-black text-slate-600 hover:bg-slate-50 hover:text-swiggy-orange transition-all swiggy-shadow uppercase tracking-widest"
          >
            <RefreshCw size={14} className={refreshKey > 0 ? "animate-spin-once" : ""} /> Refresh
          </button>
          <a 
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-swiggy-orange text-white rounded-[18px] font-black text-[11px] hover:bg-[#E14A00] transition-all swiggy-shadow shadow-orange-100 uppercase tracking-widest"
          >
            <ExternalLink size={14} strokeWidth={3} /> Full screen
          </a>
        </div>
      </header>

      <div className="relative w-full bg-white rounded-[48px] overflow-hidden swiggy-shadow border border-slate-50/80 flex flex-col group min-h-[720px] premium-card-shadow">
        <div className="absolute inset-0 bg-slate-50/50 flex items-center justify-center -z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-[3px] border-slate-200 border-t-swiggy-orange rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Connecting Swiggy insight engine...</p>
          </div>
        </div>
        
        <iframe
          key={refreshKey}
          src={embedUrl}
          frameBorder="0"
          style={{ border: 0, width: '100%', height: '720px' }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          title="Campus Intern App"
          className="z-10 transition-opacity duration-1000"
        ></iframe>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="bg-white p-7 rounded-[32px] border border-slate-100 swiggy-shadow flex gap-5 items-start">
          <div className="p-3.5 bg-swiggy-light text-swiggy-orange rounded-[20px] shadow-sm shrink-0">
            <Info size={22} strokeWidth={2.5} />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-slate-900 text-[13px] uppercase tracking-widest">Viewing tip</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Interact directly with charts above or use <b>"Full screen"</b> for advanced filtering options including date ranges and specific campaign metrics.
            </p>
          </div>
        </div>
        <div className="text-center opacity-40">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Auto-sync every 60 seconds • Cloud connected
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-once {
          animation: spin-once 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
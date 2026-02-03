
import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Info, LayoutDashboard } from 'lucide-react';
import { Submission, MetricRollup, User, Task } from '../types';
import { db } from '../services/mockDatabase';

interface DashboardProps {
  submissions: Submission[];
  leaderboard: MetricRollup[];
  user: User | null;
  isAdmin?: boolean;
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, submissions, isAdmin, tasks }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const embedUrl = "https://lookerstudio.google.com/embed/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";
  const publicUrl = "https://lookerstudio.google.com/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";

  if (isAdmin && user) {
    const campusName = db.getCampusName(user.campusId);
    const approvedCount = submissions.filter(s => s.status === 'approved').length;
    
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-1 py-4">
          <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Campus Insights</h2>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setRefreshKey(k => k + 1)} className="flex items-center gap-2 px-5 py-2.5 bg-white border rounded-[18px] text-[11px] font-black text-slate-600"><RefreshCw size={14} /> Refresh</button>
            <a href={publicUrl} target="_blank" className="bg-swiggy-orange text-white px-6 py-2.5 rounded-[18px] font-black text-[11px] tracking-widest"><ExternalLink size={14} /> Full screen</a>
          </div>
        </header>

        <div className="bg-white rounded-[48px] p-10 md:p-14 swiggy-shadow border border-slate-100 relative overflow-hidden">
          <div className="bg-slate-900 text-white px-8 py-3.5 rounded-[20px] mb-12 inline-block"><h3 className="text-xl font-black">{campusName}</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
             <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 text-center">
                <p className="text-slate-400 font-bold text-[10px] tracking-widest">Total tasks</p>
                <p className="text-6xl font-black text-slate-900">{tasks.length}</p>
             </div>
             <div className="bg-swiggy-light/30 p-8 rounded-[32px] border border-swiggy-orange/10 text-center">
                <p className="text-swiggy-orange font-bold text-[10px] tracking-widest">Approved</p>
                <p className="text-6xl font-black text-swiggy-orange">{approvedCount}</p>
             </div>
             <div className="bg-amber-50/30 p-8 rounded-[32px] border border-amber-200/50 text-center">
                <p className="text-amber-600 font-bold text-[10px] tracking-widest">In review</p>
                <p className="text-6xl font-black text-slate-900">{submissions.filter(s => s.status === 'submitted').length}</p>
             </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xl font-black text-slate-900">Task Overview</h4>
            <div className="overflow-hidden border border-slate-100 rounded-[32px]">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase">Task Name</th>
                    <th className="px-8 py-5 text-[10px] font-bold text-slate-400 text-center uppercase">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {tasks.map((task, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-8 py-5 text-sm font-black text-slate-800">{task.name}</td>
                      <td className="px-8 py-5 text-center font-black text-swiggy-orange text-sm">{task.points}</td>
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-1 py-4">
        <h2 className="text-[28px] font-black text-slate-900 tracking-tight">Analytics Dashboard</h2>
        <a href={publicUrl} target="_blank" className="bg-swiggy-orange text-white px-6 py-2.5 rounded-[18px] font-black text-[11px] tracking-widest">Full screen</a>
      </header>
      <div className="bg-white rounded-[48px] overflow-hidden swiggy-shadow min-h-[720px] border border-slate-50">
        <iframe key={refreshKey} src={embedUrl} frameBorder="0" style={{ border: 0, width: '100%', height: '720px' }} title="Analytics"></iframe>
      </div>
    </div>
  );
};

export default Dashboard;

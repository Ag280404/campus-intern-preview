
import React, { useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { Submission, MetricRollup, User, Task } from '../types';
import { db } from '../services/mockDatabase';
import HandbookLink from './HandbookLink';

interface DashboardProps {
  submissions: Submission[];
  leaderboard: MetricRollup[];
  user: User | null;
  isAdmin?: boolean;
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, submissions, isAdmin, tasks }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const defaultEmbedUrl = "https://lookerstudio.google.com/embed/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";
  const defaultPublicUrl = "https://lookerstudio.google.com/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";

  const embedUrl = user?.dashboardUrl || defaultEmbedUrl;
  const publicUrl = embedUrl.replace('/embed/reporting/', '/reporting/');

  if (isAdmin && user) {
    const campusName = db.getCampusName(user.campusId);
    const approvedCount = submissions.filter((s: Submission) => s.status === 'approved').length;
    
    return (
      <div className="space-y-8 animate-in fade-in duration-700 pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 px-1 py-4">
          <div className="flex items-center gap-4">
            <h2 className="heading-display text-[30px] text-[#141414]">Campus Insights</h2>
            <HandbookLink label="Dashboard Guide" />
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setRefreshKey((k: number) => k + 1)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E3DDD5] rounded-lg text-[11px] font-bold text-[#72665C] hover:border-[#D4CEC7] hover:bg-[#FAF8F5] transition-all"><RefreshCw size={13} /> Refresh</button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="swiggy-btn-gradient text-white px-5 py-2.5 rounded-lg font-bold text-[11px] tracking-wide flex items-center gap-2"><ExternalLink size={13} /> Full screen</a>
          </div>
        </header>

        <div className="bg-white rounded-2xl p-8 md:p-12 premium-card-shadow border border-[#E3DDD5] relative overflow-hidden">
          <div className="bg-[#141414] text-white px-5 py-2.5 rounded-lg mb-10 inline-block"><h3 className="text-[15px] font-bold tracking-tight">{campusName}</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#F8F5F1] p-7 rounded-xl border border-[#E3DDD5] text-center">
              <p className="text-[#A09488] font-bold text-[10px] tracking-[0.15em] uppercase mb-3">Total tasks</p>
              <p className="text-5xl font-black text-[#141414]">{tasks.length}</p>
            </div>
            <div className="bg-[#FEF0E6] p-7 rounded-xl border border-[#FBD4B4]/50 text-center">
              <p className="text-swiggy-orange font-bold text-[10px] tracking-[0.15em] uppercase mb-3">Approved</p>
              <p className="text-5xl font-black text-swiggy-orange">{approvedCount}</p>
            </div>
            <div className="bg-amber-50/60 p-7 rounded-xl border border-amber-200/40 text-center">
              <p className="text-amber-600 font-bold text-[10px] tracking-[0.15em] uppercase mb-3">In review</p>
              <p className="text-5xl font-black text-[#141414]">{submissions.filter((s: Submission) => s.status === 'submitted').length}</p>
            </div>
          </div>

          <div className="space-y-5">
            <h4 className="text-base font-black text-[#141414] tracking-tight">Task Overview</h4>
            <div className="overflow-hidden border border-[#E3DDD5] rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-[#F8F5F1]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#A09488] uppercase tracking-[0.12em]">Task Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-[#A09488] text-center uppercase tracking-[0.12em]">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFE9]">
                  {tasks.map((task: Task, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="px-6 py-4 text-[13px] font-bold text-[#141414]">{task.name}</td>
                      <td className="px-6 py-4 text-center font-black text-swiggy-orange text-[13px]">{task.points}</td>
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
        <div className="flex items-center gap-4">
          <h2 className="heading-display text-[30px] text-[#141414]">Analytics Dashboard</h2>
          <HandbookLink label="Handbook" />
        </div>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="swiggy-btn-gradient text-white px-5 py-2.5 rounded-lg font-bold text-[11px] tracking-wide flex items-center gap-2 self-start">Full screen</a>
      </header>
      <div className="bg-white rounded-2xl overflow-hidden premium-card-shadow border border-[#E3DDD5] min-h-[720px]">
        <iframe key={refreshKey} src={embedUrl} frameBorder="0" style={{ border: 0, width: '100%', height: '720px' }} title="Analytics"></iframe>
      </div>
    </div>
  );
};

export default Dashboard;

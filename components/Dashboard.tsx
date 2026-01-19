
import React, { useState } from 'react';
import { ExternalLink, RefreshCw, HelpCircle } from 'lucide-react';
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
  
  const embedUrl = " https://lookerstudio.google.com/embed/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";
  const publicUrl = " https://lookerstudio.google.com/reporting/d36af50c-a8e4-4d3a-93fb-c19135b70d7d/page/b6wkF";

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
      { id: 1, name: 'Share New User Coupons', status: 'Completed', assigned: 10, completed: 10, color: 'bg-green-50' },
      { id: 2, name: 'Post on Social Media', status: 'In Progress', assigned: 10, completed: 6, color: 'bg-amber-50' },
      { id: 3, name: 'Invite Friends to Student Rewards', status: 'In Progress', assigned: 10, completed: 3, color: 'bg-amber-50' },
      { id: 4, name: 'Activate Campus Streak Day', status: 'Not Started', assigned: 1, completed: 0, color: 'bg-slate-50' },
      { id: 5, name: 'Distribute Posters / Flyers', status: 'Not Started', assigned: 10, completed: 0, color: 'bg-slate-50' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 px-2">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Intern analytics dashboard</h2>
            <p className="text-sm text-slate-500 mt-1 font-medium max-w-2xl leading-relaxed">
              This dashboard shows how your campus is performing and how you are progressing on your assigned tasks. All updates are synced in real time based on submissions and verification.
            </p>
          </div>
          <div className="flex gap-2 shrink-0 pt-1">
            <button 
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all swiggy-shadow"
            >
              <RefreshCw size={14} className={refreshKey > 0 ? "animate-spin-once" : ""} /> Refresh Data
            </button>
            <a 
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-2 bg-swiggy-orange text-white rounded-xl font-bold text-xs hover:bg-[#E14A00] transition-all swiggy-shadow shadow-orange-100"
            >
              <ExternalLink size={14} /> View Full
            </a>
          </div>
        </header>

        <div className="bg-white rounded-[32px] p-8 md:p-12 swiggy-shadow border border-slate-100">
          <div className="border-2 border-slate-900 px-12 py-4 mb-16 mx-auto w-fit">
            <h3 className="text-3xl font-black text-slate-900 text-center">{campusName}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
             <div className="border-2 border-slate-900 p-6 text-center space-y-2">
                <p className="text-slate-500 font-bold text-lg">Assigned Tasks</p>
                <p className="text-5xl font-black text-slate-900">{stats.assigned}</p>
             </div>
             <div className="border-2 border-slate-900 p-6 text-center space-y-2">
                <p className="text-slate-500 font-bold text-lg">Completed Tasks</p>
                <p className="text-5xl font-black text-slate-900">{stats.completed}</p>
             </div>
             <div className="border-2 border-slate-900 p-6 text-center space-y-2">
                <p className="text-slate-500 font-bold text-lg">In-Progress Tasks</p>
                <p className="text-5xl font-black text-slate-900">{stats.inProgress}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-2xl mx-auto">
             <div className="border-2 border-slate-900 p-6 text-center space-y-2">
                <p className="text-slate-500 font-bold text-lg">Not Started Tasks</p>
                <p className="text-5xl font-black text-slate-900">{stats.notStarted}</p>
             </div>
             <div className="border-2 border-slate-900 p-6 text-center space-y-2">
                <p className="text-slate-500 font-bold text-lg">Not Completed Tasks</p>
                <p className="text-5xl font-black text-slate-900">{stats.notCompleted}</p>
             </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xl font-black text-slate-900 mb-4">Task List</h4>
            <div className="overflow-hidden border border-slate-200 rounded-lg">
              <table className="w-full text-left">
                <thead className="bg-[#EDF2F7] border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-sm font-black text-slate-700 uppercase">#</th>
                    <th className="px-6 py-3 text-sm font-black text-slate-700 uppercase">Task</th>
                    <th className="px-6 py-3 text-sm font-black text-slate-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-sm font-black text-slate-700 uppercase">Total Assigned</th>
                    <th className="px-6 py-3 text-sm font-black text-slate-700 uppercase">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {taskList.map((task, idx) => (
                    <tr key={idx} className={`${task.color} hover:brightness-95 transition-all`}>
                      <td className="px-6 py-4 text-sm font-bold text-slate-500">{idx + 1}.</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800">{task.name}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{task.status}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{task.assigned}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{task.completed}</td>
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 px-2">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Intern analytics dashboard</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium max-w-2xl leading-relaxed">
            This dashboard shows how your campus is performing and how you are progressing on your assigned tasks. All updates are synced in real time based on submissions and verification.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 pt-1">
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all swiggy-shadow"
          >
            <RefreshCw size={14} className={refreshKey > 0 ? "animate-spin-once" : ""} /> Refresh Data
          </button>
          <a 
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-2 bg-swiggy-orange text-white rounded-xl font-bold text-xs hover:bg-[#E14A00] transition-all swiggy-shadow shadow-orange-100"
          >
            <ExternalLink size={14} /> View Full
          </a>
        </div>
      </header>

      <div className="relative w-full bg-white rounded-[32px] overflow-hidden swiggy-shadow border border-slate-100 flex flex-col group min-h-[680px]">
        <div className="absolute inset-0 bg-slate-50 flex items-center justify-center -z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-swiggy-orange rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Connecting to Looker Studio...</p>
          </div>
        </div>
        
        <iframe
          key={refreshKey}
          src={embedUrl}
          frameBorder="0"
          style={{ border: 0, width: '100%', height: '700px' }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          title="Campus Intern App"
          className="z-10"
        ></iframe>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-swiggy-light p-5 rounded-[24px] border border-swiggy-orange/10 flex gap-4 items-start">
          <div className="p-2.5 bg-white text-swiggy-orange rounded-xl shadow-sm shrink-0">
            <HelpCircle size={20} />
          </div>
          <div>
            <h4 className="font-black text-swiggy-orange text-[11px] mb-1 uppercase tracking-tight">Viewing Tip</h4>
            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              If the dashboard appears cut off on mobile, please use the <b>"View Full"</b> button at the top to open the interactive version with date filters.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-once {
          animation: spin-once 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

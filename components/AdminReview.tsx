
import React, { useState, useEffect } from 'react';
import { Submission, User, Task } from '../types';
import { db } from '../services/mockDatabase';
import { ChevronDown, ChevronUp, User as UserIcon, Phone, Mail, Link as LinkIcon, Calendar, Hash, Info, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface AdminReviewProps {
  submissions: Submission[];
  onUpdate: () => void;
  selectedCatalyst: User | null;
  onUserUpdate: (updatedUser: User) => void;
  tasks: Task[];
}

type AdminView = 'review' | 'notifications' | 'config';
type FilterType = 'all' | 'submitted' | 'approved' | 'rejected';

const AdminReview: React.FC<AdminReviewProps> = ({ submissions, onUpdate, selectedCatalyst, tasks }) => {
  const [activeView, setActiveView] = useState<AdminView>('review');
  const [filter, setFilter] = useState<FilterType>('submitted');
  const [configRewardsLink, setConfigRewardsLink] = useState('');
  const [configStreaksLink, setConfigStreaksLink] = useState('');
  const [taskTargets, setTaskTargets] = useState<Record<string, number>>({});
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (selectedCatalyst) {
      setConfigRewardsLink(selectedCatalyst.rewardsOnelink || '');
      setConfigStreaksLink(selectedCatalyst.streaksOnelink || '');
      setTaskTargets(selectedCatalyst.taskTargets || {});
    }
  }, [selectedCatalyst, activeView]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onUpdate();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleAction = async (e: React.MouseEvent, id: string, action: 'approve' | 'reject') => {
    e.stopPropagation(); // Prevent toggling expansion when clicking buttons
    const note = prompt('Add reviewer note:');
    if (action === 'approve') await db.approveSubmission(id, note || undefined);
    else await db.rejectSubmission(id, note || undefined);
    onUpdate();
  };

  const handleSaveConfig = async () => {
    if (!selectedCatalyst) return;
    setIsSavingConfig(true);
    try {
      await db.updateUser(selectedCatalyst.id, { rewardsOnelink: configRewardsLink, streaksOnelink: configStreaksLink, taskTargets: taskTargets });
      alert(`Config updated for ${selectedCatalyst.displayName}`);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const filtered = submissions.filter((s: Submission) => filter === 'all' ? true : s.status === filter);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'Verified';
      case 'submitted': return 'Waiting for Approval';
      case 'rejected': return 'Rejected';
      default: return 'Verification in Progress';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500 text-white';
      case 'submitted': return 'bg-amber-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSubId(expandedSubId === id ? null : id);
  };

  const renderPayloadDetails = (payload: any) => {
    if (!payload) return <p className="text-slate-400 italic text-xs">No details provided.</p>;

    const details = [];
    if (payload.recipientName) details.push({ icon: <UserIcon size={14} />, label: 'Name', value: payload.recipientName });
    if (payload.recipientPhone) details.push({ icon: <Phone size={14} />, label: 'Phone', value: payload.recipientPhone });
    if (payload.recipientEmail) details.push({ icon: <Mail size={14} />, label: 'Email', value: payload.recipientEmail });
    if (payload.count) details.push({ icon: <Hash size={14} />, label: 'Count', value: payload.count });
    if (payload.url) details.push({ icon: <LinkIcon size={14} />, label: 'URL', value: payload.url, isLink: true });
    if (payload.date) details.push({ icon: <Calendar size={14} />, label: 'Date', value: payload.date });
    
    // Streak days
    if (payload.streakDay1) details.push({ icon: <Calendar size={14} />, label: 'Streak Day 1', value: payload.streakDay1 });
    if (payload.streakDay2) details.push({ icon: <Calendar size={14} />, label: 'Streak Day 2', value: payload.streakDay2 });
    if (payload.streakDay3) details.push({ icon: <Calendar size={14} />, label: 'Streak Day 3', value: payload.streakDay3 });

    if (details.length === 0) {
      // If it's just a string or object we don't recognize
      return <pre className="text-[10px] bg-slate-50 p-3 rounded-lg overflow-auto max-h-32 text-slate-600 font-mono">{JSON.stringify(payload, null, 2)}</pre>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        {details.map((d, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-0.5 text-slate-400">{d.icon}</div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{d.label}</p>
              {d.isLink ? (
                <a href={d.value} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-swiggy-orange hover:underline truncate block">
                  {d.value}
                </a>
              ) : (
                <p className="text-xs font-bold text-slate-700 truncate">{d.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-black text-slate-900">Admin</h2>
          <button 
            onClick={handleRefresh} 
            className={`p-2 rounded-xl bg-white border swiggy-shadow hover:bg-slate-50 transition-all ${isRefreshing ? 'animate-spin text-swiggy-orange' : 'text-slate-400'}`}
            title="Sync with Backend"
          >
            <RefreshCw size={18} />
          </button>
        </div>
        <div className="flex bg-white p-1 rounded-xl border">
          {(['review', 'config', 'notifications'] as AdminView[]).map((v: AdminView) => (
            <button key={v} onClick={() => setActiveView(v)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${activeView === v ? 'bg-swiggy-orange text-white' : 'text-slate-400'}`}>{v}</button>
          ))}
        </div>
      </header>

      {activeView === 'review' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            {(['submitted', 'approved', 'rejected', 'all'] as FilterType[]).map((f: FilterType) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border text-slate-400'}`}>
                {f === 'submitted' ? 'Waiting' : f}
              </button>
            ))}
          </div>
          {filtered.length > 0 ? filtered.map((sub: Submission) => {
            const task = tasks.find((t: Task) => t.id === sub.taskId);
            const isExpanded = expandedSubId === sub.id;
            
            return (
              <div 
                key={sub.id} 
                className={`bg-white rounded-2xl swiggy-shadow border transition-all duration-300 overflow-hidden cursor-pointer ${isExpanded ? 'ring-2 ring-swiggy-orange/20 border-swiggy-orange/30' : 'hover:border-slate-200'}`}
                onClick={() => toggleExpand(sub.id)}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isExpanded ? 'bg-swiggy-orange text-white' : 'bg-slate-50 text-slate-400'}`}>
                      <Info size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-slate-900">{task?.name || 'Task'}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${getStatusColor(sub.status)}`}>
                          {getStatusLabel(sub.status)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(sub.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {sub.status === 'submitted' && !isExpanded && (
                      <div className="hidden md:flex gap-2">
                        <button onClick={(e) => handleAction(e, sub.id, 'approve')} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={(e) => handleAction(e, sub.id, 'reject')} className="bg-red-50 text-red-500 px-4 py-2 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors">Reject</button>
                      </div>
                    )}
                    <div className="text-slate-300">
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-slate-100 mb-6"></div>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-swiggy-orange"></div>
                          Submission Details
                        </h5>
                        {renderPayloadDetails(sub.payload)}
                      </div>

                      {sub.reviewerNote && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Reviewer Note</p>
                          <p className="text-xs font-bold text-slate-600 italic">"{sub.reviewerNote}"</p>
                        </div>
                      )}

                      {sub.status === 'submitted' && (
                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={(e) => handleAction(e, sub.id, 'approve')} 
                            className="flex-1 bg-green-500 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Approve Task
                          </button>
                          <button 
                            onClick={(e) => handleAction(e, sub.id, 'reject')} 
                            className="flex-1 bg-red-50 text-red-500 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={16} />
                            Reject Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="bg-white p-20 rounded-[40px] swiggy-shadow border border-slate-50 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info size={32} />
              </div>
              <p className="text-slate-400 font-bold text-sm">No tasks found for this filter.</p>
            </div>
          )}
        </div>
      )}

      {activeView === 'config' && selectedCatalyst && (
        <div className="bg-white p-10 rounded-[40px] swiggy-shadow border space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((t: Task) => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-xs font-black">{t.name}</span>
                <input type="number" value={taskTargets[t.id] || 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskTargets({...taskTargets, [t.id]: parseInt(e.target.value) || 0})} className="w-16 p-2 rounded-lg border text-center font-bold" />
              </div>
            ))}
          </div>
          <button disabled={isSavingConfig} onClick={handleSaveConfig} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-50">
            {isSavingConfig ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminReview;


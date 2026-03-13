
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 bg-[#F8F5F1] p-4 rounded-xl border border-[#E3DDD5]">
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
        <div className="flex items-center gap-3.5">
          <h2 className="heading-display text-[30px] text-[#141414] leading-none">Admin</h2>
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-lg bg-white border border-[#E3DDD5] hover:bg-[#F8F5F1] transition-all ${isRefreshing ? 'animate-spin text-swiggy-orange' : 'text-[#A09488]'}`}
            title="Sync with Backend"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-[#E3DDD5]">
          {(['review', 'config', 'notifications'] as AdminView[]).map((v: AdminView) => (
            <button key={v} onClick={() => setActiveView(v)} className={`px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-[0.08em] transition-all ${activeView === v ? 'bg-swiggy-orange text-white' : 'text-[#A09488] hover:text-[#141414]'}`}>{v}</button>
          ))}
        </div>
      </header>

      {activeView === 'review' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            {(['submitted', 'approved', 'rejected', 'all'] as FilterType[]).map((f: FilterType) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize tracking-wide transition-all ${filter === f ? 'bg-[#141414] text-white' : 'bg-white border border-[#E3DDD5] text-[#A09488] hover:text-[#141414]'}`}>
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
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer ${isExpanded ? 'border-swiggy-orange/40 premium-card-shadow' : 'border-[#E3DDD5] hover:border-[#D4CEC7] swiggy-shadow'}`}
                onClick={() => toggleExpand(sub.id)}
              >
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isExpanded ? 'bg-swiggy-orange text-white' : 'bg-[#F8F5F1] text-[#A09488]'}`}>
                      <Info size={17} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 mb-0.5">
                        <h4 className="font-black text-[#141414] text-[14px]">{task?.name || 'Task'}</h4>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wide ${getStatusColor(sub.status)}`}>
                          {getStatusLabel(sub.status)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A09488] font-bold tracking-wide">{new Date(sub.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {sub.status === 'submitted' && !isExpanded && (
                      <div className="hidden md:flex gap-2">
                        <button onClick={(e) => handleAction(e, sub.id, 'approve')} className="bg-green-500 text-white px-3.5 py-1.5 rounded-lg font-bold text-[11px] hover:bg-green-600 transition-colors">Approve</button>
                        <button onClick={(e) => handleAction(e, sub.id, 'reject')} className="bg-red-50 text-red-500 px-3.5 py-1.5 rounded-lg font-bold text-[11px] hover:bg-red-100 border border-red-100 transition-colors">Reject</button>
                      </div>
                    )}
                    <div className="text-[#D4CEC7]">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                    <div className="h-px bg-[#F3EFE9] mb-5"></div>

                    <div className="space-y-5">
                      <div>
                        <h5 className="text-[10px] font-black text-[#141414] uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-swiggy-orange"></div>
                          Submission Details
                        </h5>
                        {renderPayloadDetails(sub.payload)}
                      </div>

                      {sub.reviewerNote && (
                        <div className="bg-[#F8F5F1] p-4 rounded-lg border border-[#E3DDD5]">
                          <p className="text-[9px] font-black text-[#A09488] uppercase tracking-[0.12em] mb-1.5">Reviewer Note</p>
                          <p className="text-[12px] font-semibold text-[#72665C] italic">"{sub.reviewerNote}"</p>
                        </div>
                      )}

                      {sub.status === 'submitted' && (
                        <div className="flex gap-3 pt-1">
                          <button
                            onClick={(e) => handleAction(e, sub.id, 'approve')}
                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-[11px] uppercase tracking-[0.1em] hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle size={15} />
                            Approve Task
                          </button>
                          <button
                            onClick={(e) => handleAction(e, sub.id, 'reject')}
                            className="flex-1 bg-red-50 text-red-500 py-3 rounded-xl font-bold text-[11px] uppercase tracking-[0.1em] border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={15} />
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
            <div className="bg-white p-16 rounded-2xl premium-card-shadow border border-[#E3DDD5] text-center">
              <div className="w-12 h-12 bg-[#F8F5F1] text-[#D4CEC7] rounded-xl flex items-center justify-center mx-auto mb-5">
                <Info size={24} />
              </div>
              <p className="text-[#A09488] font-bold text-[13px]">No tasks found for this filter.</p>
            </div>
          )}
        </div>
      )}

      {activeView === 'config' && selectedCatalyst && (
        <div className="bg-white p-8 rounded-2xl premium-card-shadow border border-[#E3DDD5] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((t: Task) => (
              <div key={t.id} className="p-4 bg-[#F8F5F1] rounded-xl flex justify-between items-center border border-[#E3DDD5]">
                <span className="text-[13px] font-bold text-[#141414]">{t.name}</span>
                <input type="number" value={taskTargets[t.id] || 0} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTaskTargets({...taskTargets, [t.id]: parseInt(e.target.value) || 0})} className="w-16 p-2 rounded-lg border border-[#E3DDD5] text-center font-bold text-[#141414] outline-none focus:border-swiggy-orange transition-colors bg-white text-[13px]" />
              </div>
            ))}
          </div>
          <button disabled={isSavingConfig} onClick={handleSaveConfig} className="w-full bg-[#141414] text-white py-3.5 rounded-xl font-bold uppercase tracking-[0.12em] text-[12px] hover:bg-black transition-all disabled:opacity-50">
            {isSavingConfig ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminReview;


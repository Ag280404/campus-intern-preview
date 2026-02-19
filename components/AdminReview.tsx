
import React, { useState, useEffect } from 'react';
import { Submission, User, Task } from '../types';
import { db } from '../services/mockDatabase';

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

  useEffect(() => {
    if (selectedCatalyst) {
      setConfigRewardsLink(selectedCatalyst.rewardsOnelink || '');
      setConfigStreaksLink(selectedCatalyst.streaksOnelink || '');
      setTaskTargets(selectedCatalyst.taskTargets || {});
    }
  }, [selectedCatalyst, activeView]);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
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

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <h2 className="text-3xl font-black text-slate-900">Admin</h2>
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
          {filtered.map((sub: Submission) => {
            const task = tasks.find((t: Task) => t.id === sub.taskId);
            return (
              <div key={sub.id} className="bg-white p-6 rounded-2xl swiggy-shadow border flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-slate-900">{task?.name || 'Task'}</h4>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${getStatusColor(sub.status)}`}>
                      {getStatusLabel(sub.status)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(sub.createdAt).toLocaleString()}</p>
                </div>
                {sub.status === 'submitted' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(sub.id, 'approve')} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xs">Approve</button>
                    <button onClick={() => handleAction(sub.id, 'reject')} className="bg-red-50 text-red-500 px-4 py-2 rounded-lg font-bold text-xs">Reject</button>
                  </div>
                )}
              </div>
            );
          })}
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

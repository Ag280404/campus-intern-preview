
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileSearch, Filter, Send, Users, Bell, Check, Settings, Ticket, Zap, Link as LinkIcon, Save, RefreshCw, Target } from 'lucide-react';
import { Submission, User, Task } from '../types';
import { db } from '../services/mockDatabase';

interface AdminReviewProps {
  submissions: Submission[];
  onUpdate: () => void;
  selectedCatalyst: User | null;
  onUserUpdate: (updatedUser: User) => void;
  tasks: Task[];
}

const AdminReview: React.FC<AdminReviewProps> = ({ submissions, onUpdate, selectedCatalyst, onUserUpdate, tasks }) => {
  const [activeView, setActiveView] = useState<'review' | 'notifications' | 'config'>('review');
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('submitted');
  const [allCatalysts, setAllCatalysts] = useState<User[]>([]);
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [configRewardsLink, setConfigRewardsLink] = useState('');
  const [configStreaksLink, setConfigStreaksLink] = useState('');
  const [taskTargets, setTaskTargets] = useState<Record<string, number>>({});
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const users = await db.getAllUsers();
      setAllCatalysts(users.filter(u => u.id !== 'admin'));
    };
    fetchUsers();
  }, []);

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

  const filtered = submissions.filter(s => filter === 'all' ? true : s.status === filter);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <h2 className="text-3xl font-black text-slate-900">Admin</h2>
        <div className="flex bg-white p-1 rounded-xl border">
          {(['review', 'config', 'notifications'] as const).map(v => (
            <button key={v} onClick={() => setActiveView(v)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase ${activeView === v ? 'bg-swiggy-orange text-white' : 'text-slate-400'}`}>{v}</button>
          ))}
        </div>
      </header>

      {activeView === 'review' && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            {(['submitted', 'approved', 'rejected', 'all'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border text-slate-400'}`}>{f}</button>
            ))}
          </div>
          {filtered.map(sub => {
            // Fixed typo: sub.task_id changed to sub.taskId
            const task = tasks.find(t => t.id === sub.taskId);
            return (
              <div key={sub.id} className="bg-white p-6 rounded-2xl swiggy-shadow border flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900">{task?.name || 'Task'}</h4>
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
            {tasks.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center">
                <span className="text-xs font-black">{t.name}</span>
                <input type="number" value={taskTargets[t.id] || 0} onChange={e => setTaskTargets({...taskTargets, [t.id]: parseInt(e.target.value)})} className="w-16 p-2 rounded-lg border text-center font-bold" />
              </div>
            ))}
          </div>
          <button onClick={handleSaveConfig} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase tracking-widest">Save Settings</button>
        </div>
      )}
    </div>
  );
};

export default AdminReview;


import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileSearch, Filter, Send, Users, Mail, Bell, Check, Settings, Ticket, Zap, Link as LinkIcon, Save, RefreshCw, QrCode as QrIcon } from 'lucide-react';
import { Submission, User } from '../types';
import { db } from '../services/mockDatabase';

interface AdminReviewProps {
  submissions: Submission[];
  onUpdate: () => void;
  selectedCatalyst: User | null;
  onUserUpdate: (updatedUser: User) => void;
}

const AdminReview: React.FC<AdminReviewProps> = ({ submissions, onUpdate, selectedCatalyst, onUserUpdate }) => {
  const [activeView, setActiveView] = useState<'review' | 'notifications' | 'config'>('review');
  const [filter, setFilter] = useState<'all' | 'submitted' | 'approved' | 'rejected'>('submitted');
  
  // Notification States
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // Config States (Editing Onelinks)
  const [configRewardsLink, setConfigRewardsLink] = useState('');
  const [configStreaksLink, setConfigStreaksLink] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const filtered = submissions.filter(s => filter === 'all' ? true : s.status === filter);
  const allCatalysts = db.getAllUsers().filter(u => u.email !== 'admin@campus.swiggy.com');

  useEffect(() => {
    if (selectedCatalyst) {
      setConfigRewardsLink(selectedCatalyst.rewardsOnelink || `https://swiggy.onelink.me/888564224/u631l8dw?code=${selectedCatalyst.rewardsQrCode || 'SWIGGY'}`);
      setConfigStreaksLink(selectedCatalyst.streaksOnelink || `https://swiggy.onelink.me/888564224/h6btndnt?code=${selectedCatalyst.streaksQrCode || 'STREAK'}`);
    }
  }, [selectedCatalyst, activeView]);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    const note = prompt('Add reviewer note (optional):');
    if (action === 'approve') db.approveSubmission(id, note || undefined);
    else db.rejectSubmission(id, note || undefined);
    onUpdate();
  };

  const handleSendNotification = () => {
    if (!message.trim()) return;
    setIsSending(true);
    
    setTimeout(() => {
      const recipients = targetType === 'all' ? ['all'] : selectedUsers;
      recipients.forEach(r => db.sendNotification(r, message));
      
      setIsSending(false);
      setSendSuccess(true);
      setMessage('');
      setSelectedUsers([]);
      
      setTimeout(() => setSendSuccess(false), 3000);
    }, 1000);
  };

  const handleSaveConfig = () => {
    if (!selectedCatalyst) return;
    setIsSavingConfig(true);
    
    setTimeout(() => {
      const updated = db.updateUser(selectedCatalyst.id, {
        rewardsOnelink: configRewardsLink,
        streaksOnelink: configStreaksLink
      });
      
      if (updated) {
        onUserUpdate(updated);
        alert(`Configuration saved successfully! The generated QR codes are now active for ${updated.displayName}.`);
      }
      setIsSavingConfig(false);
    }, 600);
  };

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]
    );
  };

  const getQrUrl = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Admin Portal</h2>
          <p className="text-slate-500 mt-1">Manage submissions, communications, and intern settings.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveView('review')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeView === 'review' ? 'bg-swiggy-orange text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Review Queue
          </button>
          <button
            onClick={() => setActiveView('config')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeView === 'config' ? 'bg-swiggy-orange text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Intern Config
          </button>
          <button
            onClick={() => setActiveView('notifications')}
            className={`whitespace-nowrap px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              activeView === 'notifications' ? 'bg-swiggy-orange text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Notifications
          </button>
        </div>
      </header>

      {activeView === 'review' && (
        <>
          <div className="flex justify-end">
            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {(['submitted', 'approved', 'rejected', 'all'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    filter === f ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filtered.length > 0 ? (
              filtered.map(sub => {
                const user = db.getUserById(sub.userId);
                return (
                  <div key={sub.id} className="bg-white p-6 rounded-2xl swiggy-shadow border border-slate-50 flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="flex-1 flex gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border bg-slate-50 flex items-center justify-center shrink-0">
                         {user?.avatarUrl ? (
                           <img src={user.avatarUrl} className="w-full h-full object-cover" />
                         ) : (
                           <Users size={20} className="text-slate-300" />
                         )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{user?.displayName}</h4>
                        <p className="text-xs text-slate-400 font-medium">{db.getCampusName(user?.campusId || '')} • {new Date(sub.createdAt).toLocaleDateString()}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">{sub.taskId}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status === 'approved' ? 'bg-green-100 text-green-600' :
                            sub.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-swiggy-light text-swiggy-orange'
                          }`}>{sub.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Submission Data</p>
                      <div className="text-xs font-medium text-slate-700 space-y-1">
                        {Object.entries(sub.payload).map(([k, v]) => (
                          <p key={k}><span className="text-slate-400 capitalize">{k}:</span> {String(v)}</p>
                        ))}
                      </div>
                    </div>

                    {sub.status === 'submitted' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(sub.id, 'approve')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-md shadow-green-100"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => handleAction(sub.id, 'reject')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 text-red-500 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-20 text-center bg-white rounded-2xl swiggy-shadow border border-slate-50">
                <FileSearch size={48} className="mx-auto text-slate-200 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Queue Clear!</h3>
                <p className="text-slate-400 text-sm">No submissions found for the current filter.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeView === 'config' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-10 rounded-[40px] swiggy-shadow border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
               <div className="w-14 h-14 bg-swiggy-light text-swiggy-orange rounded-2xl flex items-center justify-center shadow-inner shadow-orange-100/50">
                  <Settings size={28} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-slate-900">Program Configuration</h3>
                  <p className="text-sm text-slate-400 font-medium">Auto-generate tracking assets for <b>{selectedCatalyst?.displayName}</b></p>
               </div>
            </div>

            {!selectedCatalyst ? (
              <div className="p-16 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200 text-slate-400 font-black uppercase tracking-widest text-xs">
                 Please select an intern from the dropdown above
              </div>
            ) : (
              <div className="space-y-12">
                {/* Student Rewards Config */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                   <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-swiggy-orange uppercase tracking-widest">
                        <Ticket size={14} /> Student Rewards Onelink
                      </div>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="text"
                          value={configRewardsLink}
                          onChange={(e) => setConfigRewardsLink(e.target.value)}
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swiggy-orange font-medium text-sm transition-all"
                          placeholder="Paste Onelink URL here..."
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">The QR code below updates in real-time as you modify the link.</p>
                   </div>
                   <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-[32px] border border-slate-100">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                        <img 
                          src={getQrUrl(configRewardsLink)} 
                          alt="QR Preview" 
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Generated QR</span>
                   </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Campus Streaks Config */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                   <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black text-swiggy-orange uppercase tracking-widest">
                        <Zap size={14} /> Campus Streaks Onelink
                      </div>
                      <div className="relative">
                        <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                        <input 
                          type="text"
                          value={configStreaksLink}
                          onChange={(e) => setConfigStreaksLink(e.target.value)}
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swiggy-orange font-medium text-sm transition-all"
                          placeholder="Paste Onelink URL here..."
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Changes here will reflect instantly on the Intern's profile.</p>
                   </div>
                   <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-[32px] border border-slate-100">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                        <img 
                          src={getQrUrl(configStreaksLink)} 
                          alt="QR Preview" 
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-Generated QR</span>
                   </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveConfig}
                    disabled={isSavingConfig}
                    className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                  >
                    {isSavingConfig ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Intern Configuration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] swiggy-shadow border border-slate-50">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Bell size={24} className="text-swiggy-orange" />
                Compose Message
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Broadcast Target</label>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setTargetType('all')}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        targetType === 'all' ? 'bg-swiggy-light border-swiggy-orange text-swiggy-orange' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Users size={18} /> All Interns
                    </button>
                    <button 
                      onClick={() => setTargetType('specific')}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        targetType === 'specific' ? 'bg-swiggy-light border-swiggy-orange text-swiggy-orange' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Filter size={18} /> Specific Groups
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Notification Content</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your announcement or update here..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-swiggy-orange transition-all text-slate-700 font-medium"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    disabled={isSending || !message.trim() || (targetType === 'specific' && selectedUsers.length === 0)}
                    onClick={handleSendNotification}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSending ? (
                      <span className="animate-pulse">Broadcasting...</span>
                    ) : sendSuccess ? (
                      <><Check size={18} /> Notification Sent!</>
                    ) : (
                      <><Send size={18} /> Push Notification & Email</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`space-y-4 ${targetType === 'all' ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Select Recipients ({selectedUsers.length})</h4>
             <div className="bg-white rounded-[32px] p-4 swiggy-shadow border border-slate-50 max-h-[500px] overflow-y-auto space-y-1">
                {allCatalysts.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => toggleUserSelection(c.id)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                      selectedUsers.includes(c.id) ? 'bg-swiggy-light border border-swiggy-orange/20' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                      selectedUsers.includes(c.id) ? 'bg-swiggy-orange border-swiggy-orange text-white' : 'bg-white border-slate-200'
                    }`}>
                      {selectedUsers.includes(c.id) && <Check size={12} strokeWidth={4} />}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className={`text-xs font-black truncate ${selectedUsers.includes(c.id) ? 'text-swiggy-orange' : 'text-slate-900'}`}>{c.displayName}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{db.getCampusName(c.campusId)}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReview;

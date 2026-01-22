import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Camera, Link, MapPin, Hash, Send, Tag, ClipboardList, Clock, CheckCircle, XCircle, Info, Calendar as CalendarIcon, ChevronLeft, ChevronDown, AlertCircle, Users, Ticket, Share2, FileText, Flame } from 'lucide-react';
import { TASKS } from '../constants';
import { Task, TaskType, User, Submission } from '../types';
import { db } from '../services/mockDatabase';

interface TaskSubmissionProps {
  onSubmit: (data: any) => void;
  isAdmin?: boolean;
  selectedCatalyst?: User | null;
  submissions?: Submission[];
}

const TaskSubmission: React.FC<TaskSubmissionProps> = ({ onSubmit, isAdmin, selectedCatalyst, submissions = [] }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Get current user to check targets
  const currentUser = db.getCurrentUser();
  const effectiveUser = (isAdmin && selectedCatalyst) ? selectedCatalyst : currentUser;

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const isStreakDeadlinePassed = () => {
    const today = new Date();
    const currentDay = today.getDate();
    return currentDay >= 25;
  };

  const getTargetMonth = () => {
    const today = new Date();
    const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return {
      name: months[nextMonthDate.getMonth()],
      year: nextMonthDate.getFullYear()
    };
  };

  const calculateCompletion = (taskId: string) => {
    if (!effectiveUser || !effectiveUser.taskTargets) return 0;
    
    const task = TASKS.find(t => t.id === taskId);
    const target = effectiveUser.taskTargets[taskId] || 1;
    
    // Monthly campus streak is binary: submitted or not
    if (task?.type === 'streaks') {
      const targetMonth = getTargetMonth().name;
      const hasSubmitted = submissions.some(s => s.taskId === taskId && s.payload.targetMonth === targetMonth);
      return hasSubmitted ? 100 : 0;
    }

    // Others are count-based based on approved submissions
    const approvedCount = submissions.filter(s => s.taskId === taskId && s.status === 'approved').length;
    
    // Special handling for offline_activation which tracks 'count' in payload
    if (task?.type === 'offline_activation') {
      const totalUnits = submissions
        .filter(s => s.taskId === taskId && s.status === 'approved')
        .reduce((sum, s) => sum + Number(s.payload.count || 0), 0);
      return Math.min(100, Math.round((totalUnits / target) * 100));
    }

    return Math.min(100, Math.round((approvedCount / target) * 100));
  };

  /**
   * Returns a task-specific icon based on the task type.
   * referral -> Users (People Group)
   * student_rewards -> Ticket (Coupon)
   * social_media -> Share2 (Social)
   * offline_activation -> FileText (Flyer/Poster)
   * streaks -> Flame (Streak)
   */
  const getTaskIcon = (type: TaskType, size: number = 28, className: string = "") => {
    const props = { size, strokeWidth: 2.5, className };
    switch (type) {
      case 'referral':
        return <Users {...props} />;
      case 'student_rewards':
        return <Ticket {...props} />;
      case 'social_media':
        return <Share2 {...props} />;
      case 'offline_activation':
        return <FileText {...props} />;
      case 'streaks':
        return <Flame {...props} />;
      default:
        return <ClipboardList {...props} />;
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (['referral', 'student_rewards'].includes(selectedTask?.type || '')) {
      if (!formData.recipientName) newErrors.recipientName = "Full Name is required.";
      if (!formData.recipientEmail) newErrors.recipientEmail = "Email ID is required.";
      if (!formData.recipientPhone) newErrors.recipientPhone = "Phone Number is required.";
    }
    if (selectedTask?.type === 'social_media' && !formData.url) {
      newErrors.url = "Content URL is required.";
    }
    if (selectedTask?.type === 'offline_activation' && !formData.count) {
      newErrors.count = "Distribution count is required.";
    }
    // Task 'streaks' inputs are now optional as requested.
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTask?.type === 'streaks' && isStreakDeadlinePassed()) {
      alert("Deadline passed! Streak planning for the next month closes on the 25th.");
      return;
    }

    if (!validate()) return;
    
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSubmit({ 
          taskId: selectedTask?.id, 
          payload: formData, 
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude } 
        });
        resetForm();
      },
      () => {
        onSubmit({ taskId: selectedTask?.id, payload: formData });
        resetForm();
      }
    );
  };

  const resetForm = () => {
    setSelectedTask(null);
    setFormData({});
    setErrors({});
    setLoading(false);
  };

  const renderForm = () => {
    if (!selectedTask) return null;

    switch (selectedTask.type) {
      case 'offline_activation':
        return (
          <div className="space-y-7">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1 tracking-tight">
                Total posters or flyers distributed <span className="text-swiggy-orange">*</span>
              </label>
              <input 
                type="number"
                required
                className={`w-full px-6 py-5 rounded-2xl border transition-all text-slate-800 font-bold outline-none placeholder:text-slate-300 ${errors.count ? 'border-red-500 bg-red-50/50' : 'border-slate-100 bg-slate-50/50 focus:bg-white focus:border-swiggy-orange/40 focus:ring-4 focus:ring-swiggy-orange/5'}`}
                placeholder="Enter total count (e.g. 50)"
                onChange={e => {
                  setFormData({ ...formData, count: e.target.value });
                  if (errors.count) setErrors({ ...errors, count: '' });
                }}
              />
              {errors.count && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.count}</p>}
            </div>
            <div className="bg-slate-50/80 p-5 rounded-[20px] border border-slate-100 flex gap-3 items-start">
               <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
               <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed">
                  Focus on high visibility zones such as hostel notice boards, mess entrances, and main library gates for maximum impact.
               </p>
            </div>
          </div>
        );
      case 'social_media':
        return (
          <div className="space-y-7">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1 tracking-tight">
                Public content URL <span className="text-swiggy-orange">*</span>
              </label>
              <input 
                type="url"
                required
                className={`w-full px-6 py-5 rounded-2xl border transition-all text-slate-800 font-bold outline-none placeholder:text-slate-300 ${errors.url ? 'border-red-500 bg-red-50/50' : 'border-slate-100 bg-slate-50/50 focus:bg-white focus:border-swiggy-orange/40 focus:ring-4 focus:ring-swiggy-orange/5'}`}
                placeholder="https://instagram.com/reel/..."
                onChange={e => {
                  setFormData({ ...formData, url: e.target.value });
                  if (errors.url) setErrors({ ...errors, url: '' });
                }}
              />
              {errors.url && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.url}</p>}
            </div>
            <div className="bg-slate-50/80 p-5 rounded-[20px] border border-slate-100 flex gap-3 items-start">
               <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
               <p className="text-[11px] text-slate-500 font-bold italic leading-relaxed">
                  Ensure your post clearly features Swiggy branding. Profiles must be public for verification purposes.
               </p>
            </div>
          </div>
        );
      case 'referral':
      case 'student_rewards':
        return (
          <div className="space-y-8">
             <h4 className="text-[10px] font-bold text-slate-400 mt-2 px-1 uppercase tracking-wider">Target user details</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-2 ml-1 tracking-tight">
                    Full name <span className="text-swiggy-orange">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    className={`w-full px-5 py-4 rounded-2xl border transition-all text-slate-800 font-bold outline-none placeholder:text-slate-300 ${errors.recipientName ? 'border-red-500 bg-red-50/50' : 'border-slate-100 bg-slate-50/50 focus:bg-white focus:border-swiggy-orange/40 focus:ring-4 focus:ring-swiggy-orange/5'}`}
                    placeholder="Referral full name"
                    onChange={e => {
                      setFormData({ ...formData, recipientName: e.target.value });
                      if (errors.recipientName) setErrors({ ...errors, recipientName: '' });
                    }}
                  />
                  {errors.recipientName && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.recipientName}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-2 ml-1 tracking-tight">
                    Phone number <span className="text-swiggy-orange">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    className={`w-full px-5 py-4 rounded-2xl border transition-all text-slate-800 font-bold outline-none placeholder:text-slate-300 ${errors.recipientPhone ? 'border-red-500 bg-red-50/50' : 'border-slate-100 bg-slate-50/50 focus:bg-white focus:border-swiggy-orange/40 focus:ring-4 focus:ring-swiggy-orange/5'}`}
                    placeholder="Contact number"
                    onChange={e => {
                      setFormData({ ...formData, recipientPhone: e.target.value });
                      if (errors.recipientPhone) setErrors({ ...errors, recipientPhone: '' });
                    }}
                  />
                  {errors.recipientPhone && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.recipientPhone}</p>}
                </div>
             </div>
             <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-2 ml-1 tracking-tight">
                  Email ID <span className="text-swiggy-orange">*</span>
                </label>
                <input 
                  type="email"
                  required
                  className={`w-full px-5 py-4 rounded-2xl border transition-all text-slate-800 font-bold outline-none placeholder:text-slate-300 ${errors.recipientEmail ? 'border-red-500 bg-red-50/50' : 'border-slate-100 bg-slate-50/50 focus:bg-white focus:border-swiggy-orange/40 focus:ring-4 focus:ring-swiggy-orange/5'}`}
                  placeholder="Referral email address"
                  onChange={e => {
                    setFormData({ ...formData, recipientEmail: e.target.value });
                    if (errors.recipientEmail) setErrors({ ...errors, recipientEmail: '' });
                  }}
                />
                {errors.recipientEmail && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors.recipientEmail}</p>}
             </div>
             <div className="bg-amber-50/50 px-6 py-5 rounded-[24px] border border-amber-100/50 my-6 text-center">
                <p className="text-[12px] text-amber-700 font-bold tracking-tight leading-relaxed">
                   Verified details only. Fake submissions will lead to immediate point reversal and account audit.
                </p>
             </div>
          </div>
        );
      case 'streaks':
        const target = getTargetMonth();
        const deadlinePassed = isStreakDeadlinePassed();
        return (
          <div className={`space-y-7 ${deadlinePassed ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 mb-2.5 ml-1 uppercase tracking-wider">Target planning month</label>
              <div className="w-full px-6 py-4.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 flex items-center justify-between shadow-inner">
                <span>{target.name} {target.year}</span>
                <CalendarIcon size={18} className="text-slate-400" />
              </div>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((num) => (
                <div key={num}>
                  <label className="block text-[11px] font-bold text-slate-700 mb-2 ml-1 tracking-tight">
                    Preferred streak day {num}
                  </label>
                  <div className="relative">
                    <select
                      disabled={deadlinePassed}
                      className={`w-full appearance-none px-6 py-4.5 bg-white border outline-none transition-all rounded-2xl font-black tracking-tight ${
                        errors[`dayOfWeek${num}`] ? 'border-red-500 bg-red-50/50' : 'border-slate-100 focus:bg-white focus:border-swiggy-orange/40 focus:ring-4 focus:ring-swiggy-orange/5'
                      } ${formData[`dayOfWeek${num}`] ? 'text-slate-900' : 'text-slate-400'}`}
                      onChange={e => {
                        setFormData({ ...formData, [`dayOfWeek${num}`]: e.target.value, targetMonth: target.name });
                        if (errors[`dayOfWeek${num}`]) setErrors({ ...errors, [`dayOfWeek${num}`]: '' });
                      }}
                      value={formData[`dayOfWeek${num}`] || ""}
                    >
                      <option value="" disabled>Choose activation day</option>
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <ChevronDown size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {errors[`dayOfWeek${num}`] && <p className="mt-2 text-xs font-bold text-red-500 ml-1">{errors[`dayOfWeek${num}`]}</p>}
                </div>
              ))}
            </div>
            
            {deadlinePassed ? (
              <div className="bg-red-50 p-5 rounded-[24px] border border-red-100 flex gap-4 items-center">
                <AlertCircle size={24} strokeWidth={2.5} className="text-red-500 shrink-0" />
                <p className="text-[11px] text-red-700 font-bold leading-tight tracking-tight">
                  Cycle locked: Streak planning for {target.name} is now closed. Submissions were due by the 25th.
                </p>
              </div>
            ) : (
              <div className="bg-swiggy-light/50 p-5 rounded-[24px] border border-swiggy-orange/10 flex gap-4 items-center">
                <Clock size={24} strokeWidth={2.5} className="text-swiggy-orange shrink-0" />
                <p className="text-[11px] text-swiggy-orange font-bold leading-tight tracking-tight">
                  Act fast: Monthly planning window ends on the 24th at midnight. Secure your campus slot now.
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (isAdmin && selectedCatalyst) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <header>
          <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-none uppercase">Submission Archive</h2>
        </header>

        <div className="grid grid-cols-1 gap-5">
          {submissions.length > 0 ? (
            submissions.map(sub => {
              const task = TASKS.find(t => t.id === sub.taskId);
              return (
                <div key={sub.id} className="bg-white p-7 rounded-[32px] swiggy-shadow border border-slate-50 flex flex-col md:flex-row gap-8 md:items-center premium-card-shadow">
                  <div className="flex-1 flex gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 shadow-inner">
                       {task ? getTaskIcon(task.type, 26, "text-swiggy-orange") : <ClipboardList size={26} strokeWidth={2.5} className="text-swiggy-orange" />}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base tracking-tight mb-1">{task?.name || 'Unknown activity'}</h4>
                      <p className="text-[11px] text-slate-400 font-bold">
                        Filed {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm ${
                          sub.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          sub.status === 'rejected' ? 'bg-red-50 text-red-600' :
                          'bg-swiggy-light text-swiggy-orange'
                        }`}>
                          {sub.status === 'approved' && <CheckCircle size={12} strokeWidth={3} />}
                          {sub.status === 'rejected' && <XCircle size={12} strokeWidth={3} />}
                          {sub.status === 'submitted' && <Clock size={12} strokeWidth={3} />}
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50/50 p-5 rounded-[24px] flex-1 border border-slate-100 min-w-[240px]">
                    <p className="text-[10px] font-bold text-slate-400 mb-2.5 opacity-70 uppercase tracking-wider">Payload parameters</p>
                    <div className="text-[11px] font-bold text-slate-700 space-y-1.5 tracking-tight">
                      {Object.entries(sub.payload).map(([k, v]) => (
                        <div key={k} className="flex justify-between items-center border-b border-slate-100/50 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-400 capitalize">{k}</span>
                          <span className="font-black text-slate-900">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-24 text-center bg-white rounded-[48px] swiggy-shadow border border-slate-100/50 premium-card-shadow">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                <ClipboardList size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Zero activity recorded</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto tracking-tight font-bold">This intern has not submitted any campaign materials for verification yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const streakLock = selectedTask?.type === 'streaks' && isStreakDeadlinePassed();

  return (
    <div className="space-y-8">
      {selectedTask ? (
        <div className="animate-in slide-in-from-right duration-500">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
             <div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="mb-5 px-6 py-2 rounded-full bg-white border border-slate-100 text-[10px] font-black text-slate-400 hover:text-swiggy-orange hover:swiggy-shadow transition-all flex items-center gap-2 group uppercase tracking-widest"
                >
                  <ChevronLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> Back to Task Grid
                </button>
                <div className="flex items-center gap-3 mb-2">
                   <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">{selectedTask.name}</h2>
                </div>
             </div>
             <div className="bg-white px-6 py-4 rounded-[28px] swiggy-shadow border border-slate-50 flex items-center gap-4 premium-card-shadow">
                <div className="text-right">
                   <span className="text-[15px] font-black text-slate-900 block">{calculateCompletion(selectedTask.id)}%</span>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Completion</p>
                </div>
                <div className="w-10 h-10 bg-swiggy-light text-swiggy-orange rounded-xl flex items-center justify-center">
                   <CheckCircle size={20} strokeWidth={2.5} />
                </div>
             </div>
          </div>
          
          <form onSubmit={handleSubmit} className={`bg-white p-10 md:p-14 rounded-[56px] swiggy-shadow border border-slate-50 premium-card-shadow relative overflow-hidden ${streakLock ? 'opacity-75 grayscale-[0.4]' : ''}`}>
            <div className="absolute top-0 right-0 p-16 opacity-[0.02] text-swiggy-orange pointer-events-none">
              <Send size={240} strokeWidth={1} />
            </div>

            <div className="mb-10 relative">
              <h3 className="text-[26px] font-black text-slate-900 tracking-tight leading-none uppercase">Submission Instructions</h3>
              {selectedTask.instructions && (
                <div className="mt-6 p-6 bg-slate-50/50 rounded-[28px] border border-slate-100/50">
                   <p className="text-[13px] text-slate-600 font-bold leading-relaxed tracking-tight">
                     {selectedTask.instructions}
                   </p>
                </div>
              )}
            </div>

            <div className="space-y-10 relative">
              {renderForm()}
            </div>

            <div className="mt-10 pt-12 border-t border-slate-50 relative">
              <button
                type="submit"
                disabled={loading || streakLock}
                className="w-full swiggy-btn-gradient text-white font-black py-6 rounded-[30px] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm group uppercase tracking-widest"
              >
                {loading ? 'Processing...' : streakLock ? 'Planning period closed' : <><Send size={20} strokeWidth={3} className="group-hover:translate-x-1.5 group-hover:-translate-y-1 transition-transform" />Submit</>}
              </button>
              <p className="text-[10px] text-slate-300 text-center mt-6 font-bold opacity-70 uppercase tracking-widest">Read-only after submission • Permanent record</p>
            </div>
          </form>
        </div>
      ) : (
        <>
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-5 px-1 py-4">
            <div className="flex-1">
              <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-none">Tasks</h2>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-5">
            {TASKS.map(task => {
              const comp = calculateCompletion(task.id);
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="bg-white p-8 rounded-[32px] swiggy-shadow border border-slate-50/80 text-left hover:border-swiggy-orange/30 hover:-translate-y-1 transition-all group flex items-center justify-between premium-card-shadow"
                >
                  <div className="flex items-center gap-8 flex-1">
                    <div className="w-14 h-14 rounded-[22px] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-swiggy-light group-hover:text-swiggy-orange transition-all shadow-inner">
                      {getTaskIcon(task.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-black text-slate-900 group-hover:text-swiggy-orange transition-colors tracking-tight">{task.name}</h3>
                      </div>
                      <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-xl group-hover:text-slate-500 transition-colors tracking-tight">{task.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 shrink-0">
                    <div className="text-right hidden sm:block">
                        <span className="text-[13px] font-black text-slate-900 block group-hover:text-swiggy-orange transition-colors">{comp}%</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Complete</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-swiggy-orange group-hover:bg-white transition-all shadow-sm">
                        <ChevronRight size={22} strokeWidth={3} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="pt-8 text-center">
            <p className="text-[10px] text-slate-300 font-black opacity-60 uppercase tracking-widest">Verified catalyst network • Core missions</p>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskSubmission;


import React, { useState } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  Ticket, 
  Share2, 
  FileText, 
  Flame, 
  ClipboardList, 
  CheckCircle, 
  Info, 
  Calendar,
  Check,
  Send,
  ChevronDown,
  Sparkles,
  Clock
} from 'lucide-react';
import { Task, TaskType, User, Submission } from '../types';
import { db } from '../services/mockDatabase';
import HandbookLink from './HandbookLink';

interface TaskSubmissionProps {
  onSubmit: (data: any) => void;
  isAdmin?: boolean;
  selectedCatalyst?: User | null;
  submissions?: Submission[];
  tasks: Task[];
}

const WeeklyTaskTracker = () => {
  const getCurrentWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday
    const monday = new Date(today);
    
    // Adjust to get Monday of current week
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    monday.setDate(today.getDate() + diff);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const formatDateRange = (dates: Date[]) => {
    const start = dates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = dates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const year = dates[0].getFullYear();
    return `${start} - ${end}, ${year}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const weekDaysShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDaysInitial = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentWeek = getCurrentWeek();

  return (
    <div className="bg-white p-8 md:p-10 rounded-[48px] swiggy-shadow border border-slate-50 premium-card-shadow mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-swiggy-light text-swiggy-orange rounded-2xl flex items-center justify-center shadow-inner">
            <Calendar size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Weekly Tasks</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDateRange(currentWeek)}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
          <Clock size={14} className="text-amber-600" strokeWidth={2.5} />
          <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Resets every Sunday</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 md:gap-4">
        {currentWeek.map((date, index) => {
          const today = isToday(date);
          return (
            <div 
              key={index}
              className={`flex flex-col items-center justify-center py-4 rounded-[24px] transition-all duration-300 ${
                today 
                ? 'swiggy-btn-gradient text-white shadow-xl scale-105 z-10' 
                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-white hover:border-swiggy-orange/20'
              }`}
            >
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-1.5 opacity-80">
                <span className="md:hidden">{weekDaysInitial[index]}</span>
                <span className="hidden md:inline">{weekDaysShort[index]}</span>
              </span>
              <span className={`text-base md:text-xl font-black ${today ? 'text-white' : 'text-slate-900'}`}>
                {date.getDate()}
              </span>
              {today && (
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex items-center gap-3 justify-center md:hidden">
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
            <Clock size={14} className="text-amber-600" strokeWidth={2.5} />
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Resets every Sunday</span>
          </div>
      </div>
    </div>
  );
};

const TaskSubmission: React.FC<TaskSubmissionProps> = ({ onSubmit, isAdmin, selectedCatalyst, submissions = [], tasks = [] }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [hasConsent, setHasConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = db.getCurrentUser();
  const effectiveUser = (isAdmin && selectedCatalyst) ? selectedCatalyst : currentUser;

  const calculateCompletion = (taskId: string) => {
    if (!effectiveUser || !effectiveUser.taskTargets) return 0;
    const task = tasks.find(t => t.id === taskId);
    const target = effectiveUser.taskTargets[taskId] || 1;
    
    const approvedCount = submissions.filter(s => s.taskId === taskId && s.status === 'approved').length;
    
    if (task?.type === 'offline_activation') {
      const totalUnits = submissions.filter(s => s.taskId === taskId && s.status === 'approved').reduce((sum, s) => sum + Number(s.payload.count || 0), 0);
      return Math.min(100, Math.round((totalUnits / target) * 100));
    }
    
    return Math.min(100, Math.round((approvedCount / target) * 100));
  };

  const getTaskIcon = (type: TaskType, size: number = 24, className: string = "") => {
    const props = { size, strokeWidth: 2.5, className };
    switch (type) {
      case 'referral': return <Users {...props} />;
      case 'student_rewards': return <Ticket {...props} />;
      case 'social_media': return <Share2 {...props} />;
      case 'offline_activation': return <FileText {...props} />;
      case 'streaks': return <Flame {...props} />;
      default: return <ClipboardList {...props} />;
    }
  };

  const getWarningText = (type: TaskType) => {
    switch (type) {
      case 'offline_activation':
        return "Please focus on high-visibility campus zones such as hostel notice boards, mess entrances, and library gates to maximize impact.";
      case 'social_media':
        return "Ensure your post clearly features Swiggy branding. Your profile must be set to public for verification purpose.";
      default:
        return "Please ensure submissions are accurate and verifiable. Submissions will be verified every Wednesday.";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSubmit({ 
          taskId: selectedTask?.id, 
          payload: { ...formData, consent: hasConsent }, 
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude } 
        });
        setSelectedTask(null);
        setLoading(false);
      },
      () => {
        onSubmit({ 
          taskId: selectedTask?.id, 
          payload: { ...formData, consent: hasConsent } 
        });
        setSelectedTask(null);
        setLoading(false);
      }
    );
  };

  if (selectedTask) {
    const completionPercent = calculateCompletion(selectedTask.id);
    
    // Updated logic: Using Week Days instead of Month Dates
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const getNextMonthLabel = () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
      <div className="animate-in slide-in-from-right duration-500 max-w-5xl mx-auto pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 px-2">
          <div className="space-y-4">
            <button 
              onClick={() => setSelectedTask(null)} 
              className="bg-[#F1F5F9] text-[#64748B] text-[10px] font-black px-6 py-2.5 rounded-full flex items-center gap-2 uppercase tracking-[0.15em] hover:bg-slate-200 transition-all shadow-sm"
            >
              <ChevronLeft size={14} strokeWidth={3} /> BACK TO TASK GRID
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-[42px] font-black text-slate-900 tracking-tighter leading-none">{selectedTask.name}</h2>
              <HandbookLink iconOnly label="Task Guidelines" />
            </div>
          </div>

          <div className="bg-white px-8 py-5 rounded-[32px] swiggy-shadow flex items-center gap-5 border border-slate-50 premium-card-shadow">
            <div className="text-right">
              <div className="text-[18px] font-black text-slate-900 leading-none">{completionPercent}%</div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">COMPLETION</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 text-swiggy-orange flex items-center justify-center border border-orange-100/50">
              <CheckCircle size={22} strokeWidth={3} />
            </div>
          </div>
        </div>

        <div className="bg-white p-12 md:p-16 rounded-[60px] swiggy-shadow border border-slate-50 premium-card-shadow">
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">SUBMISSION INSTRUCTIONS</h4>
                <HandbookLink label="Submission Help" className="opacity-60" />
              </div>
              <div className="p-8 bg-[#F8FAFC] rounded-[32px] border border-slate-100">
                <p className="text-[15px] text-slate-600 font-bold leading-relaxed">
                  {selectedTask.instructions}
                </p>
              </div>

              {selectedTask.type === 'social_media' && (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-[24px] flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                    <Sparkles size={20} strokeWidth={3} />
                  </div>
                  <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest leading-none">
                    Best performing reels will be selected for boosting.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">DETAILS</h4>
              
              {selectedTask.type === 'streaks' && (
                <div className="space-y-8">
                  <div className="relative group">
                    <input 
                      type="text" 
                      readOnly 
                      value={getNextMonthLabel()} 
                      className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-slate-50/50 font-black text-slate-900 outline-none text-[15px]" 
                    />
                    <Calendar size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2.5">
                        <label className="block text-[11px] font-black text-slate-400 ml-3 uppercase tracking-widest">Preferred streak day {i}</label>
                        <div className="relative">
                          <select 
                            required
                            className={`w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-white font-black outline-none appearance-none cursor-pointer focus:border-swiggy-orange/50 transition-colors text-[15px] ${formData[`streakDay${i}`] ? 'text-slate-900' : 'text-slate-400'}`}
                            onChange={e => setFormData({ ...formData, [`streakDay${i}`]: e.target.value })}
                            value={formData[`streakDay${i}`] || ""}
                          >
                            <option value="">Choose activation day</option>
                            {weekDays.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                          <ChevronDown size={20} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.type === 'offline_activation' && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 ml-3 uppercase tracking-widest">Total flyers / posters distributed *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="Enter total count placed or shared (e.g. 30)" 
                    className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-[#F8FAFC] font-black text-slate-800 outline-none focus:bg-white focus:border-swiggy-orange/50 transition-all text-[15px]" 
                    onChange={e => setFormData({ ...formData, count: e.target.value })} 
                  />
                </div>
              )}

              {selectedTask.type === 'social_media' && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 ml-3 uppercase tracking-widest">Social Media Post URL *</label>
                  <input 
                    type="url" 
                    required 
                    placeholder="Paste link here" 
                    className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-[#F8FAFC] font-black text-slate-800 outline-none focus:bg-white focus:border-swiggy-orange/50 transition-all text-[15px]" 
                    onChange={e => setFormData({ ...formData, url: e.target.value })} 
                  />
                </div>
              )}

              {(selectedTask.type === 'referral' || selectedTask.type === 'student_rewards') && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[11px] font-black text-slate-400 ml-3 uppercase tracking-widest">Full name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Full name" 
                        className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-[#F8FAFC] font-black text-slate-800 outline-none focus:bg-white focus:border-swiggy-orange/50 transition-all text-[15px]" 
                        onChange={e => setFormData({ ...formData, recipientName: e.target.value })} 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[11px] font-black text-slate-400 ml-3 uppercase tracking-widest">Swiggy Registered Phone Number *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="Swiggy Registered Phone Number" 
                        className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-[#F8FAFC] font-black text-slate-800 outline-none focus:bg-white focus:border-swiggy-orange/50 transition-all text-[15px]" 
                        onChange={e => setFormData({ ...formData, recipientPhone: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-slate-400 ml-3 uppercase tracking-widest">Email ID</label>
                    <input 
                      type="email" 
                      placeholder="Email ID" 
                      className="w-full px-8 py-5 rounded-[24px] border border-slate-100 bg-[#F8FAFC] font-black text-slate-800 outline-none focus:bg-white focus:border-swiggy-orange/50 transition-all text-[15px]" 
                      onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })} 
                    />
                  </div>
                  <div className="flex items-start gap-5 pt-2">
                    <button 
                      type="button"
                      onClick={() => setHasConsent(!hasConsent)}
                      className={`w-6 h-6 rounded-lg border-2 shrink-0 flex items-center justify-center transition-all ${hasConsent ? 'bg-swiggy-orange border-swiggy-orange text-white' : 'bg-white border-slate-200'}`}
                    >
                      {hasConsent && <Check size={14} strokeWidth={4} />}
                    </button>
                    <span className="text-[13px] font-black text-slate-500 leading-tight">
                      I confirm that the referred user has consented to sharing their phone number and other required details for this submission.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-8 rounded-[32px] flex items-start gap-5 shadow-sm">
              <div className="w-10 h-10 bg-[#FEF3C7] rounded-full flex items-center justify-center shrink-0">
                <Info size={20} className="text-[#D97706]" strokeWidth={2.5} />
              </div>
              <p className="text-[13px] font-black text-[#D97706] leading-relaxed">
                {getWarningText(selectedTask.type)}
              </p>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full swiggy-btn-gradient text-white font-black py-7 rounded-[36px] flex items-center justify-center gap-3 group uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50"
              >
                <Send size={20} strokeWidth={3} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>{loading ? 'SUBMITTING...' : 'SUBMIT'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 px-2 animate-in fade-in duration-700">
      <div className="flex items-center gap-6">
        <h2 className="text-[36px] font-black text-slate-900 tracking-tighter leading-none">Tasks</h2>
        <HandbookLink label="How do tasks work?" />
      </div>

      <WeeklyTaskTracker />

      <div className="grid grid-cols-1 gap-6">
        {tasks.map(task => {
          const completion = calculateCompletion(task.id);
          return (
            <button 
              key={task.id} 
              onClick={() => setSelectedTask(task)} 
              className="bg-white px-10 py-9 rounded-[48px] swiggy-shadow border border-slate-50/50 flex items-center justify-between group hover:border-swiggy-orange/30 hover:scale-[1.01] transition-all premium-card-shadow"
            >
              <div className="flex items-center gap-10">
                <div className="w-16 h-16 rounded-[24px] bg-[#F8FAFC] flex items-center justify-center text-slate-400 group-hover:bg-swiggy-light group-hover:text-swiggy-orange transition-all shadow-inner">
                  {getTaskIcon(task.type, 32)}
                </div>
                <div className="text-left">
                  <h3 className="text-[22px] font-black text-slate-900 group-hover:text-swiggy-orange transition-colors tracking-tight leading-tight">{task.name}</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="text-right">
                   <div className="text-[16px] font-black text-slate-900 leading-none group-hover:text-swiggy-orange transition-colors">{completion}%</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 opacity-60">COMPLETE</div>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#F8FAFC] flex items-center justify-center text-slate-200 group-hover:bg-swiggy-orange group-hover:text-white transition-all shadow-inner">
                   <ChevronRight size={24} strokeWidth={4} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TaskSubmission;

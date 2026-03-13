
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
    <div className="bg-white p-7 md:p-9 rounded-2xl premium-card-shadow border border-[#E3DDD5] mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-[#FEF0E6] text-swiggy-orange rounded-xl flex items-center justify-center">
            <Calendar size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-black text-[#141414] tracking-tight leading-none mb-1">Weekly Tasks</h3>
            <p className="text-[10px] font-bold text-[#A09488] uppercase tracking-[0.12em]">{formatDateRange(currentWeek)}</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-amber-50/80 px-3.5 py-2 rounded-lg border border-amber-100">
          <Clock size={13} className="text-amber-600" strokeWidth={2.5} />
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.1em]">Resets every Sunday</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {currentWeek.map((date, index) => {
          const today = isToday(date);
          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center py-3.5 rounded-xl transition-all duration-200 ${
                today
                ? 'swiggy-btn-gradient text-white z-10'
                : 'bg-[#F8F5F1] text-[#A09488] border border-[#E3DDD5] hover:border-swiggy-orange/30 hover:bg-white hover:text-[#141414]'
              }`}
            >
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] mb-1 opacity-80">
                <span className="md:hidden">{weekDaysInitial[index]}</span>
                <span className="hidden md:inline">{weekDaysShort[index]}</span>
              </span>
              <span className={`text-sm md:text-lg font-black ${today ? 'text-white' : 'text-[#141414]'}`}>
                {date.getDate()}
              </span>
              {today && (
                <div className="w-1 h-1 bg-white/80 rounded-full mt-1.5 animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3 justify-center md:hidden">
        <div className="flex items-center gap-2 bg-amber-50/80 px-3.5 py-2 rounded-lg border border-amber-100">
          <Clock size={13} className="text-amber-600" strokeWidth={2.5} />
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-[0.1em]">Resets every Sunday</span>
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
      case 'approved': return 'text-green-600 bg-green-50';
      case 'submitted': return 'text-amber-600 bg-amber-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 px-1">
          <div className="space-y-3">
            <button
              onClick={() => setSelectedTask(null)}
              className="bg-[#F8F5F1] text-[#72665C] text-[10px] font-bold px-4 py-2 rounded-lg flex items-center gap-2 uppercase tracking-[0.12em] hover:bg-[#F0EBE4] transition-all border border-[#E3DDD5]"
            >
              <ChevronLeft size={13} strokeWidth={2.5} /> Back to tasks
            </button>
            <div className="flex items-center gap-3">
              <h2 className="heading-display text-[34px] text-[#141414] leading-none">{selectedTask.name}</h2>
              <HandbookLink iconOnly label="Task Guidelines" />
            </div>
          </div>

          <div className="bg-white px-7 py-4 rounded-xl premium-card-shadow flex items-center gap-5 border border-[#E3DDD5] self-start">
            <div className="text-right">
              <div className="text-[20px] font-black text-[#141414] leading-none">{completionPercent}%</div>
              <div className="text-[9px] font-bold text-[#A09488] uppercase tracking-[0.12em] mt-1">Completion</div>
            </div>
            <div className="w-9 h-9 rounded-lg bg-[#FEF0E6] text-swiggy-orange flex items-center justify-center">
              <CheckCircle size={19} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-2xl premium-card-shadow border border-[#E3DDD5]">
          <form onSubmit={handleSubmit} className="space-y-9">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <h4 className="text-[10px] font-black text-[#A09488] uppercase tracking-[0.18em]">Submission Instructions</h4>
                <HandbookLink label="Submission Help" className="opacity-60" />
              </div>
              <div className="p-6 bg-[#F8F5F1] rounded-xl border border-[#E3DDD5]">
                <p className="text-[14px] text-[#72665C] font-semibold leading-relaxed">
                  {selectedTask.instructions}
                </p>
              </div>

              {selectedTask.type === 'social_media' && (
                <div className="p-4 bg-[#141414] border border-[#2E2A24] rounded-xl flex items-center gap-4 animate-in fade-in duration-400">
                  <div className="w-9 h-9 bg-swiggy-orange rounded-lg flex items-center justify-center shrink-0">
                    <Sparkles size={17} strokeWidth={2.5} className="text-white" />
                  </div>
                  <p className="text-[11px] font-bold text-white/80 uppercase tracking-[0.12em] leading-tight">
                    Best performing social media post will be selected for boosting.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-[#A09488] uppercase tracking-[0.18em]">Details</h4>

              {selectedTask.type === 'streaks' && (
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={getNextMonthLabel()}
                      className="w-full px-5 py-4 rounded-xl border border-[#E3DDD5] bg-[#F8F5F1] font-bold text-[#141414] outline-none text-[14px] cursor-default"
                    />
                    <Calendar size={17} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A09488]" />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-2">
                        <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Preferred streak day {i}</label>
                        <div className="relative">
                          <select
                            required
                            className={`w-full px-5 py-4 rounded-xl border border-[#E3DDD5] bg-white font-bold outline-none appearance-none cursor-pointer focus:border-swiggy-orange transition-colors text-[14px] ${formData[`streakDay${i}`] ? 'text-[#141414]' : 'text-[#C5BDB6]'}`}
                            onChange={e => setFormData({ ...formData, [`streakDay${i}`]: e.target.value })}
                            value={formData[`streakDay${i}`] || ""}
                          >
                            <option value="">Choose activation day</option>
                            {weekDays.map(day => (
                              <option key={day} value={day}>{day}</option>
                            ))}
                          </select>
                          <ChevronDown size={17} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A09488] pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.type === 'offline_activation' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Total flyers / posters distributed *</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter total count (e.g. 30)"
                    className="w-full px-5 py-4 rounded-xl border border-[#E3DDD5] bg-[#F8F5F1] font-bold text-[#141414] outline-none focus:bg-white focus:border-swiggy-orange transition-all text-[14px] placeholder-[#C5BDB6]"
                    onChange={e => setFormData({ ...formData, count: e.target.value })}
                  />
                </div>
              )}

              {selectedTask.type === 'social_media' && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Social Media Post URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="Paste link here"
                    className="w-full px-5 py-4 rounded-xl border border-[#E3DDD5] bg-[#F8F5F1] font-bold text-[#141414] outline-none focus:bg-white focus:border-swiggy-orange transition-all text-[14px] placeholder-[#C5BDB6]"
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                  />
                </div>
              )}

              {(selectedTask.type === 'referral' || selectedTask.type === 'student_rewards') && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Full name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Full name"
                        className="w-full px-5 py-4 rounded-xl border border-[#E3DDD5] bg-[#F8F5F1] font-bold text-[#141414] outline-none focus:bg-white focus:border-swiggy-orange transition-all text-[14px] placeholder-[#C5BDB6]"
                        onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="Swiggy Registered Phone Number"
                        className="w-full px-5 py-4 rounded-xl border border-[#E3DDD5] bg-[#F8F5F1] font-bold text-[#141414] outline-none focus:bg-white focus:border-swiggy-orange transition-all text-[14px] placeholder-[#C5BDB6]"
                        onChange={e => setFormData({ ...formData, recipientPhone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#A09488] ml-1 uppercase tracking-[0.12em]">Email ID</label>
                    <input
                      type="email"
                      placeholder="Email ID"
                      className="w-full px-5 py-4 rounded-xl border border-[#E3DDD5] bg-[#F8F5F1] font-bold text-[#141414] outline-none focus:bg-white focus:border-swiggy-orange transition-all text-[14px] placeholder-[#C5BDB6]"
                      onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })}
                    />
                  </div>
                  <div className="flex items-start gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => setHasConsent(!hasConsent)}
                      className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all mt-0.5 ${hasConsent ? 'bg-swiggy-orange border-swiggy-orange text-white' : 'bg-white border-[#D4CEC7]'}`}
                    >
                      {hasConsent && <Check size={11} strokeWidth={3.5} />}
                    </button>
                    <span className="text-[12px] font-semibold text-[#72665C] leading-snug">
                      I confirm that the referred user has consented to sharing their phone number and other required details for this submission.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-amber-50/60 border border-amber-200/50 p-5 rounded-xl flex items-start gap-4">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Info size={16} className="text-amber-600" strokeWidth={2.5} />
              </div>
              <p className="text-[12px] font-semibold text-amber-700 leading-relaxed">
                {getWarningText(selectedTask.type)}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full swiggy-btn-gradient text-white font-black py-5 rounded-xl flex items-center justify-center gap-3 group uppercase tracking-[0.15em] transition-all disabled:opacity-50"
              >
                <Send size={17} strokeWidth={2.5} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>{loading ? 'Submitting...' : 'Submit'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 px-2 animate-in fade-in duration-500">
      <div className="flex items-center gap-5">
        <h2 className="heading-display text-[34px] text-[#141414] leading-none">Tasks</h2>
        <HandbookLink label="How do tasks work?" />
      </div>

      <WeeklyTaskTracker />

      <div className="grid grid-cols-1 gap-4">
        {tasks.map(task => {
          const completion = calculateCompletion(task.id);
          const lastSubmission = submissions.filter(s => s.taskId === task.id).sort((a, b) => b.createdAt - a.createdAt)[0];

          return (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="bg-white px-7 py-6 rounded-xl premium-card-shadow border border-[#E3DDD5] flex items-center justify-between group hover:border-swiggy-orange/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-xl bg-[#F8F5F1] flex items-center justify-center text-[#A09488] group-hover:bg-[#FEF0E6] group-hover:text-swiggy-orange transition-all">
                  {getTaskIcon(task.type, 22)}
                </div>
                <div className="text-left">
                  <h3 className="text-[17px] font-black text-[#141414] group-hover:text-swiggy-orange transition-colors tracking-tight leading-tight">{task.name}</h3>
                  {lastSubmission && (
                    <div className={`mt-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] inline-block ${getStatusColor(lastSubmission.status)}`}>
                      {getStatusLabel(lastSubmission.status)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-7 shrink-0">
                <div className="text-right">
                  <div className="text-[15px] font-black text-[#141414] leading-none group-hover:text-swiggy-orange transition-colors">{completion}%</div>
                  <div className="text-[9px] font-bold text-[#A09488] uppercase tracking-[0.1em] mt-1">Done</div>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#F8F5F1] flex items-center justify-center text-[#D4CEC7] group-hover:bg-swiggy-orange group-hover:text-white transition-all">
                  <ChevronRight size={18} strokeWidth={3} />
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

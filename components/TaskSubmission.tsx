
import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Camera, Link, MapPin, Hash, Send, Tag, ClipboardList, Clock, CheckCircle, XCircle, Info, Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { TASKS } from '../constants';
import { Task, TaskType, User, Submission } from '../types';
import { db } from '../services/mockDatabase';

interface TaskSubmissionProps {
  onSubmit: (data: any) => void;
  isAdmin?: boolean;
  selectedCatalyst?: User | null;
  submissions?: Submission[];
}

const CalendarPicker = ({ value, onChange, deadlineCheck }: { value: Date | null, onChange: (d: Date) => void, deadlineCheck: (m: number) => boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const month = viewDate.getMonth();
  const year = viewDate.getFullYear();
  const daysCount = daysInMonth(month, year);
  const firstDay = firstDayOfMonth(month, year);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysCount; i++) days.push(i);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Streak Date</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-swiggy-orange transition-colors shadow-sm"
      >
        <span className={`font-bold ${value ? 'text-slate-800' : 'text-slate-300'}`}>
          {value ? `${months[value.getMonth()]} ${value.getDate()}, ${value.getFullYear()}` : "Pick a date"}
        </span>
        <CalendarIcon size={18} className="text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-[60] p-4 animate-in zoom-in-95 duration-200 origin-top-left">
          <div className="flex items-center justify-between mb-4 px-1">
            <button type="button" onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400">
              <ChevronLeft size={18} />
            </button>
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">
              {months[month]} {year}
            </h4>
            <button type="button" onClick={handleNextMonth} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase py-1">{d}</div>
            ))}
            {days.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />;
              
              const isSelected = value && value.getDate() === day && value.getMonth() === month && value.getFullYear() === year;
              const isDeadlineMet = deadlineCheck(month);
              
              return (
                <button
                  key={day}
                  type="button"
                  disabled={!isDeadlineMet && day > 0}
                  onClick={() => {
                    const selected = new Date(year, month, day);
                    onChange(selected);
                    setIsOpen(false);
                  }}
                  className={`aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all ${
                    isSelected 
                      ? 'bg-swiggy-orange text-white shadow-lg shadow-orange-100' 
                      : isDeadlineMet 
                        ? 'hover:bg-swiggy-light hover:text-swiggy-orange text-slate-600' 
                        : 'text-slate-200 cursor-not-allowed'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          
          {!deadlineCheck(month) && (
            <div className="mt-2 text-[9px] text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center leading-tight">
              Deadline passed for {months[month]} submissions.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskSubmission: React.FC<TaskSubmissionProps> = ({ onSubmit, isAdmin, selectedCatalyst, submissions = [] }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const checkStreakDeadline = (monthIndex: number) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();

    const deadlineMonth = monthIndex - 1;
    if (deadlineMonth < currentMonth) return false;
    if (deadlineMonth === currentMonth && currentDay > 25) return false;
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (selectedTask?.type === 'streaks') {
      if (!selectedDate) {
        alert("Please select a date for the campus streak.");
        setLoading(false);
        return;
      }
      
      const monthIdx = selectedDate.getMonth();
      if (!checkStreakDeadline(monthIdx)) {
        alert("Deadline passed! Submissions for this month must be completed by the twenty fifth of the previous month.");
        setLoading(false);
        return;
      }
    }

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
    setSelectedDate(null);
    setLoading(false);
  };

  const renderForm = () => {
    if (!selectedTask) return null;

    switch (selectedTask.type) {
      case 'offline_activation':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Total Posters or Flyers Distributed</label>
              <input 
                type="number" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-swiggy-orange outline-none"
                placeholder="Enter the total count distributed in one session."
                onChange={e => setFormData({ ...formData, count: e.target.value })}
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 italic">
               Focus on high visibility zones such as hostel notice boards, mess entrances, library zones, and main gates.
            </div>
          </div>
        );
      case 'social_media':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Content URL</label>
              <input 
                type="url" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-swiggy-orange outline-none"
                placeholder="Paste the public link to your Instagram reel, LinkedIn post, or public story highlight."
                onChange={e => setFormData({ ...formData, url: e.target.value })}
              />
            </div>
            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 italic">
               Ensure your post clearly features Swiggy branding and communicates the Student Rewards or campus initiative properly.
            </div>
          </div>
        );
      case 'referral':
      case 'student_rewards':
        const isCoupon = selectedTask.type === 'student_rewards';
        return (
          <div className="space-y-4">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Target User Details</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-swiggy-orange outline-none"
                    placeholder={isCoupon ? "Enter the recipient’s full name." : "Enter the full name of the student who signed up."}
                    onChange={e => setFormData({ ...formData, recipientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-swiggy-orange outline-none"
                    placeholder={isCoupon ? "Enter the phone number used for redemption." : "Enter the phone number used during signup."}
                    onChange={e => setFormData({ ...formData, recipientPhone: e.target.value })}
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email ID</label>
                <input 
                  type="email" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-swiggy-orange outline-none"
                  placeholder={isCoupon ? "Enter the college email address of the recipient." : "Enter the college email address used during signup."}
                  onChange={e => setFormData({ ...formData, recipientEmail: e.target.value })}
                />
             </div>
             <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 italic">
                {isCoupon 
                  ? "Coupons must be shared only with eligible new users. Fake entries will lead to rejection and can reduce credibility."
                  : "Only genuine signups will be counted. Avoid duplicate entries or incorrect details."}
             </div>
          </div>
        );
      case 'streaks':
        return (
          <div className="space-y-6">
            <CalendarPicker 
              value={selectedDate} 
              deadlineCheck={checkStreakDeadline}
              onChange={(d) => {
                setSelectedDate(d);
                setFormData({ ...formData, month: months[d.getMonth()], day: d.getDate() });
              }} 
            />
            
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
              <Clock size={20} className="text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                REMINDER: Submissions for a month must be completed by the twenty fifth of the previous month. Late submissions will be automatically disabled.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isAdmin && selectedCatalyst) {
    // ... (Admin view remains the same)
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <header>
          <h2 className="text-3xl font-black text-slate-900">Task Submission History</h2>
          <p className="text-slate-500 mt-1">Reviewing submissions for {selectedCatalyst.displayName}.</p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {submissions.length > 0 ? (
            submissions.map(sub => {
              const task = TASKS.find(t => t.id === sub.taskId);
              return (
                <div key={sub.id} className="bg-white p-6 rounded-2xl swiggy-shadow border border-slate-50 flex flex-col md:flex-row gap-6 md:items-center">
                  <div className="flex-1 flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                       <ClipboardList size={24} className="text-swiggy-orange" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{task?.name || 'Unknown Task'}</h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {new Date(sub.createdAt).toLocaleDateString()} at {new Date(sub.createdAt).toLocaleTimeString()}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sub.status === 'approved' ? 'bg-green-100 text-green-600' :
                          sub.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-swiggy-light text-swiggy-orange'
                        }`}>
                          {sub.status === 'approved' && <CheckCircle size={10} className="inline mr-1" />}
                          {sub.status === 'rejected' && <XCircle size={10} className="inline mr-1" />}
                          {sub.status === 'submitted' && <Clock size={10} className="inline mr-1" />}
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl flex-1 border border-slate-100 min-w-[200px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payload Details</p>
                    <div className="text-xs font-medium text-slate-700 space-y-1">
                      {Object.entries(sub.payload).map(([k, v]) => (
                        <p key={k}><span className="text-slate-400 capitalize">{k}:</span> {String(v)}</p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-20 text-center bg-white rounded-3xl swiggy-shadow border border-slate-50">
              <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-900">No submissions yet</h3>
              <p className="text-slate-400 text-sm">This intern hasn't submitted any tasks for review.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-black text-slate-900">Task Catalog</h2>
        <p className="text-slate-500 mt-1 font-medium">Choose tasks that drive user acquisition and campus visibility. Submissions are verified and scores are awarded based on impact, consistency, and quality.</p>
        <p className="text-xs text-slate-400 mt-2 font-bold italic">This page lists all tasks you can complete as part of the program. Open a task to view the instructions and submit proof of work.</p>
      </header>

      {selectedTask ? (
        <div className="animate-in slide-in-from-right duration-300">
          <button 
            onClick={() => setSelectedTask(null)}
            className="mb-6 text-sm font-bold text-slate-400 hover:text-swiggy-orange flex items-center gap-1"
          >
            ← Click Back to Catalog to return to the complete list of tasks.
          </button>
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[32px] swiggy-shadow border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-swiggy-light text-swiggy-orange flex items-center justify-center font-black text-xl">
                {selectedTask.points}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Submission Instructions</h3>
                <p className="text-sm text-slate-500 font-medium">Submit accurate details and proof for this task. Your submission will be reviewed by the program team, and points will be awarded only after verification.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8 flex gap-3">
               <Info size={20} className="text-swiggy-orange shrink-0" />
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification note</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Verification is done using system data where available. Any mismatched or incomplete submissions may be rejected.</p>
               </div>
            </div>

            {renderForm()}

            <div className="mt-8 pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-swiggy-orange hover:bg-[#E14A00] text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase tracking-widest"
              >
                {loading ? 'Submitting...' : <><Send size={18} /> Submit for Review</>}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-3 font-bold">Once submitted, you cannot edit the entry. Please double-check all fields before submitting.</p>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {TASKS.map(task => (
            <button
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="bg-white p-6 rounded-2xl swiggy-shadow border border-slate-50 text-left hover:border-swiggy-orange transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-swiggy-light group-hover:text-swiggy-orange transition-all">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900">{task.name}</h3>
                    <div className="px-2 py-0.5 bg-swiggy-light text-swiggy-orange rounded-lg text-[8px] font-black tracking-widest uppercase">
                      {task.type.replace('_', ' ')}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium line-clamp-1">{task.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="text-right hidden sm:block">
                    <span className="text-xs font-black text-slate-900">{task.points} Pts</span>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Potential</p>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-swiggy-orange group-hover:bg-white transition-all">
                    <ChevronRight size={20} />
                 </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSubmission;

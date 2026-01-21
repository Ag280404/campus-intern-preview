import React, { useState, useRef, useEffect } from 'react';
// Added AlertCircle to imports
import { ChevronRight, Camera, Link, MapPin, Hash, Send, Tag, ClipboardList, Clock, CheckCircle, XCircle, Info, Calendar as CalendarIcon, ChevronLeft, ChevronDown, AlertCircle } from 'lucide-react';
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

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  // Logic: Submissions for next month must be completed by the 24th of current month.
  // Starting from the 25th, the form is disabled.
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (['referral', 'student_rewards'].includes(selectedTask?.type || '')) {
      if (!formData.recipientName) newErrors.recipientName = "Please enter the referral’s full name.";
      if (!formData.recipientEmail) newErrors.recipientEmail = "Please enter the referral’s email.";
      if (!formData.recipientPhone) newErrors.recipientPhone = "Please enter the referral’s phone number.";
    }
    if (selectedTask?.type === 'social_media' && !formData.url) {
      newErrors.url = "Please enter the content URL.";
    }
    if (selectedTask?.type === 'offline_activation' && !formData.count) {
      newErrors.count = "Please enter the distribution count.";
    }
    if (selectedTask?.type === 'streaks' && !formData.dayOfWeek) {
      newErrors.dayOfWeek = "Please select a preferred day of the week.";
    }
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Total Posters or Flyers Distributed</label>
              <input 
                type="number"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.count ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-swiggy-orange'}`}
                placeholder="Enter the total count distributed in one session."
                onChange={e => {
                  setFormData({ ...formData, count: e.target.value });
                  if (errors.count) setErrors({ ...errors, count: '' });
                }}
              />
              {errors.count && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.count}</p>}
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
                type="url"
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.url ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-swiggy-orange'}`}
                placeholder="Paste the public link to your Instagram reel, LinkedIn post, or public story highlight."
                onChange={e => {
                  setFormData({ ...formData, url: e.target.value });
                  if (errors.url) setErrors({ ...errors, url: '' });
                }}
              />
              {errors.url && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.url}</p>}
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
             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                <p className="text-sm font-bold text-slate-800">Enter the referral’s details below: Name, email, and phone number.</p>
             </div>
             
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Target User Details</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input 
                    type="text"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.recipientName ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-swiggy-orange'}`}
                    placeholder={isCoupon ? "Enter the recipient’s full name." : "Enter the full name of the student who signed up."}
                    onChange={e => {
                      setFormData({ ...formData, recipientName: e.target.value });
                      if (errors.recipientName) setErrors({ ...errors, recipientName: '' });
                    }}
                  />
                  {errors.recipientName && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.recipientName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="tel"
                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.recipientPhone ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-swiggy-orange'}`}
                    placeholder={isCoupon ? "Enter the phone number used for redemption." : "Enter the phone number used during signup."}
                    onChange={e => {
                      setFormData({ ...formData, recipientPhone: e.target.value });
                      if (errors.recipientPhone) setErrors({ ...errors, recipientPhone: '' });
                    }}
                  />
                  {errors.recipientPhone && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.recipientPhone}</p>}
                </div>
             </div>
             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email ID</label>
                <input 
                  type="email"
                  className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${errors.recipientEmail ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-swiggy-orange'}`}
                  placeholder={isCoupon ? "Enter the college email address of the recipient." : "Enter the college email address used during signup."}
                  onChange={e => {
                    setFormData({ ...formData, recipientEmail: e.target.value });
                    if (errors.recipientEmail) setErrors({ ...errors, recipientEmail: '' });
                  }}
                />
                {errors.recipientEmail && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.recipientEmail}</p>}
             </div>
             <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-900 font-black tracking-tight leading-relaxed">
                   Submitting incorrect or fake details may lead to point reversal.
                </p>
             </div>
          </div>
        );
      case 'streaks':
        const target = getTargetMonth();
        const deadlinePassed = isStreakDeadlinePassed();
        return (
          <div className={`space-y-6 ${deadlinePassed ? 'opacity-50 pointer-events-none' : ''}`}>
            <div>
              <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Target Planning Month</label>
              <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-between">
                <span>{target.name} {target.year}</span>
                <Clock size={18} className="text-slate-300" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Preferred Streak Day</label>
              <div className="relative">
                <select
                  disabled={deadlinePassed}
                  className={`w-full appearance-none px-4 py-3.5 bg-white border outline-none transition-all rounded-xl font-bold ${
                    errors.dayOfWeek ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:ring-2 focus:ring-swiggy-orange'
                  } ${formData.dayOfWeek ? 'text-slate-800' : 'text-slate-400'}`}
                  onChange={e => {
                    setFormData({ ...formData, dayOfWeek: e.target.value, targetMonth: target.name });
                    if (errors.dayOfWeek) setErrors({ ...errors, dayOfWeek: '' });
                  }}
                  value={formData.dayOfWeek || ""}
                >
                  <option value="" disabled>Choose activation day (e.g. Monday)</option>
                  {daysOfWeek.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
              {errors.dayOfWeek && <p className="mt-1.5 text-xs font-bold text-red-500">{errors.dayOfWeek}</p>}
            </div>
            
            {deadlinePassed ? (
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex gap-3">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <p className="text-[10px] text-red-700 font-bold leading-relaxed uppercase tracking-tight">
                  Submission Locked: Streak planning for {target.name} must be completed before the 25th of the current month.
                </p>
              </div>
            ) : (
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex gap-3">
                <Clock size={20} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                  Planning ends on the 24th. Submissions after that will be locked until the next cycle.
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

  const streakLock = selectedTask?.type === 'streaks' && isStreakDeadlinePassed();

  return (
    <div className="space-y-6">
      {selectedTask ? (
        <div className="animate-in slide-in-from-right duration-300">
          <button 
            onClick={() => setSelectedTask(null)}
            className="mb-6 text-sm font-bold text-slate-400 hover:text-swiggy-orange flex items-center gap-1"
          >
            ← Back to Mandatory List
          </button>
          <form onSubmit={handleSubmit} className={`bg-white p-8 rounded-[32px] swiggy-shadow border border-slate-100 ${streakLock ? 'opacity-75 grayscale-[0.5]' : ''}`}>
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase">Submission Instructions</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1">
                  Submissions must contain accurate details and valid proof. Points are subject to successful system verification.
                </p>
              </div>
            </div>

            {renderForm()}

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-8 mb-4 flex gap-3">
               <Info size={20} className="text-swiggy-orange shrink-0" />
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification note</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Verification will be done once a week. Submissions are processed through system data where available.</p>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <button
                type="submit"
                disabled={loading || streakLock}
                className="w-full bg-swiggy-orange hover:bg-[#E14A00] text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
              >
                {loading ? 'Submitting...' : streakLock ? 'Planning Period Closed' : <><Send size={18} /> Submit for Review</>}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-3 font-bold">Once submitted, you cannot edit the entry. Please double-check all fields.</p>
            </div>
          </form>
        </div>
      ) : (
        <>
          <header>
            <h2 className="text-3xl font-black text-slate-900 uppercase">Tasks</h2>
            <p className="text-slate-500 mt-1 font-medium">Tasks that drive user acquisition and campus visibility. Submissions are verified and scores are awarded based on impact, consistency, and quality.</p>
          </header>

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
                      <span className="text-xs font-black text-slate-900">{task.deadlineDays} Days Left</span>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Time Remaining</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-swiggy-orange group-hover:bg-white transition-all">
                      <ChevronRight size={20} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskSubmission;
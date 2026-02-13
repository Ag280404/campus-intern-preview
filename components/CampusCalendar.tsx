
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Info,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { db } from '../services/mockDatabase';
import { User, CampusEvent, EventType } from '../types';
import HandbookLink from './HandbookLink';

interface CampusCalendarProps {
  user: User;
  isAdmin: boolean;
  currentCampus: User | null;
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  'Placements': '#3B82F6',        // Blue
  'Exams': '#EF4444',             // Red
  'Cultural Fest': '#8B5CF6',     // Purple
  'Sports Fest': '#10B981',       // Green
  'Tech Fest': '#06B6D4',         // Cyan/Teal
  'Regional Festival': '#F97316', // Orange
  'Holidays': '#F59E0B',          // Amber
  'Alumni Meet': '#4F46E5',       // Indigo
  'Semester Break': '#DB2777',     // Pink
  'Other': '#6B7280',             // Gray
};

const CampusCalendar: React.FC<CampusCalendarProps> = ({ user, isAdmin, currentCampus }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CampusEvent[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseYYYYMMDD = (str: string) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  const [selectedDateStr, setSelectedDateStr] = useState<string>(toLocalDateString(new Date()));

  const fetchEvents = async (overrideDateStr?: string) => {
    setLoading(true);
    try {
      const activeCampusId = currentCampus?.campusId || user.campusId;
      const fetched = await db.getEvents(isAdmin ? undefined : activeCampusId);
      const filtered = isAdmin 
        ? (currentCampus ? fetched.filter(e => e.campusId === currentCampus.campusId) : []) 
        : fetched;
      
      setEvents(filtered);
      
      const targetStr = overrideDateStr || selectedDateStr;
      const dayEvents = filtered.filter(e => targetStr >= e.startDate && targetStr <= e.endDate);
      setSelectedDateEvents(dayEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentCampus, user.campusId, isAdmin]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  
  const handleToday = () => {
    const today = new Date();
    const todayStr = toLocalDateString(today);
    setCurrentDate(today);
    setSelectedDateStr(todayStr);
    fetchEvents(todayStr);
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = toLocalDateString(clickedDate);
    setSelectedDateStr(dateStr);
    const dayEvents = events.filter(e => dateStr >= e.startDate && dateStr <= e.endDate);
    setSelectedDateEvents(dayEvents);
  };

  const [formData, setFormData] = useState({
    eventType: 'Placements' as EventType,
    eventName: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const openAddModal = () => {
    setFormData({ 
      eventType: 'Placements', 
      eventName: '', 
      startDate: selectedDateStr, 
      endDate: selectedDateStr, 
      notes: '' 
    });
    setIsEditing(null);
    setShowModal(true);
  };

  const openEditModal = (event: CampusEvent) => {
    setFormData({ 
      eventType: event.eventType, 
      eventName: event.eventName, 
      startDate: event.startDate, 
      endDate: event.endDate, 
      notes: event.notes || '' 
    });
    setIsEditing(event.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.startDate > formData.endDate) {
      alert("Start date cannot be after end date.");
      return;
    }

    setLoading(true);
    try {
      const activeCampusId = currentCampus?.campusId || user.campusId;
      
      if (isEditing) {
        await db.updateEvent(isEditing, formData);
      } else {
        await db.submitEvent({
          ...formData,
          campusId: activeCampusId,
          createdBy: user.id,
          createdByName: user.displayName
        });
      }
      
      const targetStr = formData.startDate;
      setSelectedDateStr(targetStr);
      setShowModal(false);
      await fetchEvents(targetStr);
    } catch (err: any) {
      console.error("Save Error Details:", err);
      alert(`Error saving event: ${err.message || "Unknown database error"}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      await db.deleteEvent(deleteConfirm.id);
      setDeleteConfirm(null);
      await fetchEvents();
    } catch (err) {
      alert("Error deleting event.");
    } finally {
      setLoading(false);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/30 border border-slate-50 rounded-lg"></div>);
    }

    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      const dateStr = toLocalDateString(date);
      const isToday = toLocalDateString(new Date()) === dateStr;
      const isSelected = selectedDateStr === dateStr;
      const dayEvents = events.filter(e => dateStr >= e.startDate && dateStr <= e.endDate);

      cells.push(
        <div 
          key={day} 
          onClick={() => handleDayClick(day)}
          className={`h-24 md:h-32 p-2 md:p-3 border transition-all cursor-pointer relative group ${
            isSelected ? 'bg-swiggy-light border-swiggy-orange ring-1 ring-swiggy-orange z-10' : 'bg-white border-slate-100 hover:border-slate-300'
          } rounded-xl`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-black ${isToday ? 'bg-swiggy-orange text-white w-7 h-7 flex items-center justify-center rounded-full shadow-lg' : 'text-slate-900'}`}>
              {day}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {dayEvents.slice(0, 3).map((e, idx) => (
              <div key={idx} className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_TYPE_COLORS[e.eventType] }}></div>
            ))}
            {dayEvents.length > 3 && <span className="text-[8px] font-black text-slate-400">+{dayEvents.length - 3}</span>}
          </div>
          <div className="mt-2 hidden md:block overflow-hidden">
            {dayEvents.slice(0, 2).map((e, idx) => (
              <div key={idx} className="text-[9px] font-bold truncate mb-0.5 px-1 rounded-sm text-white" style={{ backgroundColor: EVENT_TYPE_COLORS[e.eventType] }}>{e.eventName}</div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  const displaySelectedDate = parseYYYYMMDD(selectedDateStr);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-6 mb-2">
            <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">Campus Calendar</h2>
            <HandbookLink label="Calendar Guide" />
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleToday} className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm">Today</button>
           <button onClick={openAddModal} className="swiggy-btn-gradient text-white px-8 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 uppercase tracking-widest shadow-xl">
             <Plus size={18} strokeWidth={3} /> Add Event
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[48px] swiggy-shadow border border-slate-50 premium-card-shadow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
              <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-[20px] border border-slate-100">
                <button onClick={handlePrevMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-swiggy-orange transition-all"><ChevronLeft size={20} /></button>
                <button onClick={handleNextMonth} className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-400 hover:text-swiggy-orange transition-all"><ChevronRight size={20} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] py-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-4">{renderCalendar()}</div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white p-8 rounded-[48px] swiggy-shadow border border-slate-50 premium-card-shadow">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-swiggy-light text-swiggy-orange rounded-xl flex items-center justify-center"><CalendarIcon size={20} strokeWidth={2.5} /></div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    {displaySelectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'long' })}
                 </h4>
              </div>
              <div className="space-y-4">
                 {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map((event) => (
                       <div key={event.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] group hover:bg-white hover:swiggy-shadow transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1 min-w-0">
                             <div className="flex items-center gap-2 mb-2">
                                <div className="px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest" style={{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] }}>{event.eventType}</div>
                             </div>
                             <h5 className="font-black text-slate-900 text-base mb-1 tracking-tight truncate">{event.eventName}</h5>
                             <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-1"><Clock size={14} /> {event.startDate === event.endDate ? 'One-day event' : `${event.startDate} to ${event.endDate}`}</div>
                             {event.notes && <p className="mt-2 text-[11px] text-slate-500 font-medium line-clamp-2 italic">"{event.notes}"</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                             <button onClick={() => openEditModal(event)} className="w-[44px] h-[44px] md:w-9 md:h-9 bg-white border border-slate-200 text-slate-500 hover:text-swiggy-orange hover:border-swiggy-orange hover:bg-orange-50 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"><Edit3 size={18} /></button>
                             <button onClick={() => setDeleteConfirm({id: event.id, name: event.eventName})} className="w-[44px] h-[44px] md:w-9 md:h-9 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95"><Trash2 size={18} /></button>
                          </div>
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed border-slate-100 rounded-[40px]">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200"><Info size={24} /></div>
                       <p className="text-sm font-black text-slate-300">No events for this date</p>
                    </div>
                 )}
              </div>
           </section>
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={32} strokeWidth={2.5} /></div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Delete Event?</h3>
              <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">Are you sure you want to delete <span className="text-slate-900 font-black">"{deleteConfirm.name}"</span>?</p>
              <div className="flex gap-3">
                 <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Cancel</button>
                 <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-100 active:scale-95">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="px-10 pt-10 pb-4 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Edit Event' : 'Add Campus Event'}</h3>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={28} className="text-slate-400" /></button>
             </div>
             <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5">
                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Event Type</label>
                   <div className="relative">
                      <select required value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value as EventType})} className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all appearance-none cursor-pointer pr-12">
                         {Object.keys(EVENT_TYPE_COLORS).map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Event Name</label>
                   <input required placeholder="e.g. Mid-term Exams" value={formData.eventName} onChange={(e) => setFormData({...formData, eventName: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Start Date</label>
                      <input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all" />
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">End Date</label>
                      <input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all" />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Event Description</label>
                   <textarea 
                     rows={3}
                     placeholder="Add more details about this event..." 
                     value={formData.notes} 
                     onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                     className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all resize-none" 
                   />
                </div>
                <div className="pt-4 flex gap-4">
                   <button type="submit" disabled={loading} className="flex-1 swiggy-btn-gradient text-white py-5 rounded-[26px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                     {loading ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Event' : 'Save Event')}
                   </button>
                   <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-[26px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">
                     Cancel
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusCalendar;

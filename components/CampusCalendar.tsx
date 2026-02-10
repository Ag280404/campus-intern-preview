
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Info,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { db } from '../services/mockDatabase';
import { User, CampusEvent, EventType } from '../types';

interface CampusCalendarProps {
  user: User;
  isAdmin: boolean;
  currentCampus: User | null;
}

const EVENT_TYPE_COLORS: Record<EventType, string> = {
  'Placements': '#3B82F6',
  'Exams': '#EF4444',
  'Cultural Fest': '#8B5CF6',
  'Sports Fest': '#10B981',
  'Holidays': '#F59E0B',
  'Other': '#6B7280',
};

const CampusCalendar: React.FC<CampusCalendarProps> = ({ user, isAdmin, currentCampus }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CampusEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Form states
  const [formData, setFormData] = useState({
    eventType: 'Placements' as EventType,
    eventName: '',
    startDate: '',
    endDate: '',
    notes: ''
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const campusId = currentCampus?.campusId || user.campusId;
      const fetched = await db.getEvents(isAdmin ? undefined : campusId);
      // If admin, filter by selected catalyst campus
      const filtered = isAdmin ? fetched.filter(e => e.campusId === currentCampus?.campusId) : fetched;
      setEvents(filtered);
    } catch (err) {
      console.error("Failed to fetch events", err);
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
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    
    // Find events for this day
    const dateStr = clickedDate.toISOString().split('T')[0];
    const dayEvents = events.filter(e => dateStr >= e.startDate && dateStr <= e.endDate);
    setSelectedDateEvents(dayEvents);
  };

  const openAddModal = () => {
    const dateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    setFormData({
      eventType: 'Placements',
      eventName: '',
      startDate: dateStr,
      endDate: dateStr,
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
      if (isEditing) {
        await db.updateEvent(isEditing, formData);
      } else {
        await db.submitEvent({
          ...formData,
          campusId: currentCampus?.campusId || user.campusId,
          createdBy: user.id,
          createdByName: user.displayName
        });
      }
      setShowModal(false);
      fetchEvents();
    } catch (err) {
      alert("Error saving event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    setLoading(true);
    try {
      await db.deleteEvent(id);
      fetchEvents();
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

    // Empty cells for days before the 1st
    for (let i = 0; i < startDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/30 border border-slate-50 rounded-lg"></div>);
    }

    // Actual day cells
    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const isToday = new Date().toDateString() === date.toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      
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
            {dayEvents.length > 0 && (
               <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md md:opacity-0 group-hover:opacity-100 transition-opacity">
                  {dayEvents.length}
               </span>
            )}
          </div>
          
          <div className="mt-2 flex flex-wrap gap-1">
            {dayEvents.slice(0, 3).map((e, idx) => (
              <div 
                key={idx} 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: EVENT_TYPE_COLORS[e.eventType] }}
                title={`${e.eventType}: ${e.eventName}`}
              ></div>
            ))}
            {dayEvents.length > 3 && (
              <span className="text-[8px] font-black text-slate-400">+{dayEvents.length - 3}</span>
            )}
          </div>

          <div className="mt-2 hidden md:block overflow-hidden">
            {dayEvents.slice(0, 2).map((e, idx) => (
              <div 
                key={idx} 
                className="text-[9px] font-bold truncate mb-0.5 px-1 rounded-sm text-white"
                style={{ backgroundColor: EVENT_TYPE_COLORS[e.eventType] }}
              >
                {e.eventName}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none mb-2">Campus Calendar</h2>
          <p className="text-slate-400 font-bold text-sm">Track exams, fests, and placements to plan better campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
           <button 
              onClick={handleToday}
              className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-xs hover:bg-slate-50 transition-all uppercase tracking-widest shadow-sm"
           >
             Today
           </button>
           <button 
              onClick={openAddModal}
              className="swiggy-btn-gradient text-white px-8 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 uppercase tracking-widest shadow-xl"
           >
             <Plus size={18} strokeWidth={3} /> Add Event
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Calendar Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[48px] swiggy-shadow border border-slate-50 premium-card-shadow">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
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

            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white p-8 rounded-[48px] swiggy-shadow border border-slate-50 premium-card-shadow">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-swiggy-light text-swiggy-orange rounded-xl flex items-center justify-center">
                    <CalendarIcon size={20} strokeWidth={2.5} />
                 </div>
                 <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', weekday: 'long' }) : 'Select a date'}
                 </h4>
              </div>

              <div className="space-y-4">
                 {selectedDateEvents.length > 0 ? (
                    selectedDateEvents.map((event) => (
                       <div key={event.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[32px] group hover:bg-white hover:swiggy-shadow transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                             <div 
                                className="px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest"
                                style={{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] }}
                             >
                                {event.eventType}
                             </div>
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEditModal(event)} className="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-500 rounded-lg transition-colors"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                             </div>
                          </div>
                          <h5 className="font-black text-slate-900 text-base mb-2 tracking-tight">{event.eventName}</h5>
                          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 mb-3">
                             <Clock size={14} /> {event.startDate === event.endDate ? 'One-day event' : `${event.startDate} to ${event.endDate}`}
                          </div>
                          {event.notes && (
                             <p className="text-[12px] text-slate-500 font-bold leading-relaxed opacity-80">{event.notes}</p>
                          )}
                       </div>
                    ))
                 ) : (
                    <div className="text-center py-16 px-4 border-2 border-dashed border-slate-100 rounded-[40px]">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                          <Info size={24} />
                       </div>
                       <p className="text-sm font-black text-slate-300">No events for this date</p>
                    </div>
                 )}
              </div>
           </section>

           <section className="bg-slate-900 p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><CalendarIcon size={120} /></div>
              <h4 className="text-lg font-black mb-4 relative z-10">Pro Planning Tip</h4>
              <p className="text-sm text-slate-400 font-bold leading-relaxed relative z-10">
                 Adding events like "End Term Exams" helps Swiggy planners schedule **Exam Breaks** campaigns specifically for your campus.
              </p>
           </section>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
             <div className="px-10 pt-10 pb-4 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                   {isEditing ? 'Edit Event' : 'Add Campus Event'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                   <X size={28} className="text-slate-400" />
                </button>
             </div>

             <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Event Type</label>
                   <select 
                      required
                      value={formData.eventType}
                      onChange={(e) => setFormData({...formData, eventType: e.target.value as EventType})}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all appearance-none"
                   >
                      {Object.keys(EVENT_TYPE_COLORS).map(type => (
                         <option key={type} value={type}>{type}</option>
                      ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Event Name</label>
                   <input 
                      required
                      placeholder="e.g. Mid-term Exams"
                      value={formData.eventName}
                      onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Start Date</label>
                      <input 
                         type="date"
                         required
                         value={formData.startDate}
                         onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                         className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">End Date</label>
                      <input 
                         type="date"
                         required
                         value={formData.endDate}
                         onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                         className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-black text-slate-800 focus:bg-white transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Additional Notes</label>
                   <textarea 
                      placeholder="Optional details about the event..."
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-6 py-4.5 bg-slate-50 border border-slate-100 rounded-[24px] outline-none font-bold text-slate-800 focus:bg-white transition-all resize-none"
                   ></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 swiggy-btn-gradient text-white py-5 rounded-[26px] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
                   >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Event' : 'Save Event')}
                   </button>
                   <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-10 py-5 bg-slate-100 text-slate-500 rounded-[26px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                   >
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

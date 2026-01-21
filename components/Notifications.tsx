import React, { useEffect } from 'react';
import { Bell, Clock, Calendar, Mail, CheckCircle, Info, MessageSquare, ChevronLeft } from 'lucide-react';
import { Notification } from '../types';
import { db } from '../services/mockDatabase';

interface NotificationsProps {
  userId: string;
  onRead: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ userId, onRead }) => {
  const notifications = db.getNotifications(userId);

  useEffect(() => {
    // Mark as read when component mounts
    db.markAllNotificationsRead(userId);
    onRead();
  }, [userId]);

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'long' }),
      date: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header>
        <h2 className="text-3xl font-black text-slate-900">Notifications</h2>
      </header>

      <div className="max-w-3xl space-y-4">
        {notifications.length > 0 ? (
          notifications.map(n => {
            const fd = formatDate(n.createdAt);
            return (
              <div 
                key={n.id} 
                className={`bg-white p-6 rounded-[28px] swiggy-shadow border-l-4 transition-all ${
                  n.isRead ? 'border-l-slate-200' : 'border-l-swiggy-orange'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar size={12} /> {fd.day}, {fd.date}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock size={12} /> {fd.time}
                  </div>
                </div>
                
                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                  {n.content}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-swiggy-orange bg-swiggy-light px-2.5 py-1 rounded-lg">
                    <Mail size={12} /> Sent to your email
                  </div>
                  {n.isRead && (
                    <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                      <CheckCircle size={12} /> Read
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-20 text-center bg-white rounded-[32px] swiggy-shadow border border-slate-50">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
               <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">You’re all caught up 🎉</h3>
            <div className="text-slate-400 text-sm mt-2 font-medium">
              <p>No updates right now.</p>
              <p>We’ll notify you here when there’s something new from the Swiggy Campus team.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
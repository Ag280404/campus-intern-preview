import React, { useEffect } from 'react';
import { Bell, Clock, Calendar, Mail, CheckCircle, Info, MessageSquare, ChevronLeft, Inbox } from 'lucide-react';
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-16">
      <header>
        <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">Notifications</h2>
      </header>

      <div className="max-w-4xl space-y-6">
        {notifications.length > 0 ? (
          notifications.map(n => {
            const fd = formatDate(n.createdAt);
            const isUnread = !n.isRead;
            return (
              <div 
                key={n.id} 
                className={`bg-white p-8 md:p-10 rounded-[44px] swiggy-shadow border-l-[6px] transition-all duration-500 premium-card-shadow hover:-translate-y-1 ${
                  isUnread ? 'border-l-swiggy-orange' : 'border-l-slate-200 opacity-90'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-8">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Calendar size={14} className="text-swiggy-orange/60" strokeWidth={3} /> {fd.day}, {fd.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 bg-slate-50 px-3 py-1 rounded-lg">
                    <Clock size={14} strokeWidth={3} /> {fd.time}
                  </div>
                </div>
                
                <p className="text-slate-800 text-[15px] font-bold leading-relaxed whitespace-pre-wrap tracking-tight">
                  {n.content}
                </p>

                <div className="mt-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-swiggy-orange bg-swiggy-light px-4 py-2 rounded-xl shadow-sm transition-transform hover:scale-105 cursor-default">
                    <Mail size={14} strokeWidth={3} /> Priority dispatch
                  </div>
                  {n.isRead && (
                    <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5 opacity-60">
                      <CheckCircle size={14} strokeWidth={3} /> Delivered
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-24 text-center bg-white rounded-[56px] swiggy-shadow border border-slate-100/50 premium-card-shadow relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
            <div className="w-22 h-22 bg-slate-50/80 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-inner group-hover:scale-110 transition-transform duration-500">
               <Inbox size={44} strokeWidth={1.5} />
            </div>
            <h3 className="text-[24px] font-black text-slate-900 tracking-tight leading-none mb-4">You’re all caught up🎉</h3>
            <div className="text-slate-400 text-sm font-bold max-w-sm mx-auto leading-relaxed">
              <p>No updates right now. We’ll notify you here when there’s something new from the Swiggy Campus team.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

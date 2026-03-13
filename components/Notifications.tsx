
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Inbox, Mail, X, CheckCircle } from 'lucide-react';
import { Notification } from '../types';
import { db } from '../services/mockDatabase';
import HandbookLink from './HandbookLink';

interface NotificationsProps {
  userId: string;
  onRead: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ userId, onRead }) => {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const fetched = await db.getNotifications(userId);
      setLocalNotifications(fetched);
      
      await db.markAllNotificationsRead(userId);
      onRead();
    };
    fetchNotifications();
  }, [userId, onRead]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.deleteNotification(id);
    setLocalNotifications((prev: Notification[]) => prev.filter((n: Notification) => n.id !== id));
  };

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
      <header className="flex items-center gap-5">
        <h2 className="heading-display text-[34px] text-[#141414] leading-none">Notifications</h2>
        <HandbookLink label="About updates" />
      </header>

      <div className="max-w-4xl space-y-4">
        {localNotifications.length > 0 ? (
          localNotifications.map((n: Notification) => {
            const fd = formatDate(n.createdAt);
            const isUnread = !n.isRead;
            return (
              <div
                key={n.id}
                className={`bg-white p-7 md:p-9 rounded-2xl border-l-4 transition-all duration-300 premium-card-shadow hover:-translate-y-0.5 relative ${
                  isUnread ? 'border-l-swiggy-orange border-[#E3DDD5]' : 'border-l-[#E3DDD5] border-[#E3DDD5] opacity-85'
                }`}
              >
                <button
                  onClick={(e: React.MouseEvent) => handleDelete(n.id, e)}
                  className="absolute top-6 right-6 p-2 rounded-lg text-[#C5BDB6] hover:text-swiggy-orange hover:bg-[#FEF0E6] transition-all"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-[#A09488]">
                    <Calendar size={12} className="text-swiggy-orange/70" strokeWidth={2.5} /> {fd.day}, {fd.date}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#C5BDB6] bg-[#F8F5F1] px-3 py-1.5 rounded-lg mr-8 sm:mr-0 border border-[#E3DDD5]">
                    <Clock size={12} strokeWidth={2.5} /> {fd.time}
                  </div>
                </div>

                <p className="text-[#141414] text-[14px] font-semibold leading-relaxed whitespace-pre-wrap pr-8 sm:pr-0">
                  {n.content}
                </p>

                <div className="mt-7 pt-5 border-t border-[#F3EFE9] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-swiggy-orange bg-[#FEF0E6] px-3.5 py-1.5 rounded-lg">
                    <Mail size={12} strokeWidth={2.5} /> Priority dispatch
                  </div>
                  {n.isRead && (
                    <div className="text-[10px] font-bold text-[#C5BDB6] flex items-center gap-1.5">
                      <CheckCircle size={12} strokeWidth={2.5} /> Delivered
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-20 text-center bg-white rounded-2xl premium-card-shadow border border-[#E3DDD5] relative overflow-hidden group">
            <div className="w-16 h-16 bg-[#F8F5F1] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#D4CEC7] group-hover:scale-105 transition-transform duration-300">
              <Inbox size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-[22px] font-black text-[#141414] tracking-tight leading-none mb-3">You&apos;re all caught up</h3>
            <p className="text-[#A09488] text-[13px] font-semibold max-w-sm mx-auto leading-relaxed">
              No updates right now. We'll notify you here when there's something new from the Swiggy Campus team.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

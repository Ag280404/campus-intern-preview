
import React, { useState, useEffect } from 'react';
import { Home, ClipboardList, Trophy, User as UserIcon, LogOut, ShieldCheck, Bell, Calendar as CalendarIcon } from 'lucide-react';
import { db } from '../services/mockDatabase';
import { Notification, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

const SwiggyLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <img 
    src="https://res.cloudinary.com/dsnlfhjpm/image/upload/v1767178733/swiggy-logo-app-icon_axds7i.webp" 
    alt="Swiggy Logo"
    style={{ width: size, height: size, objectFit: 'contain' }}
    className={className}
  />
);

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      if (user) {
        const notes = await db.getNotifications(user.id);
        setUnreadCount(notes.filter((n: Notification) => !n.isRead).length);
      }
    };
    fetchUnread();
  }, [user]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, hidden: user?.email !== 'admin@campus.swiggy.com' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white px-4 py-3 border-b border-[#E3DDD5] flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-swiggy-orange rounded-lg flex items-center justify-center overflow-hidden p-1">
            <SwiggyLogo size={20} />
          </div>
          <span className="font-bold text-[#141414] text-[15px] tracking-tight">Campus Catalyst</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onTabChange('notifications')} className="relative p-2 text-[#72665C] hover:text-swiggy-orange transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-swiggy-orange rounded-full"></span>}
          </button>
          <button onClick={onLogout} className="p-2 text-[#72665C] hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar Desktop — dark espresso */}
      <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0" style={{background:'var(--sidebar)'}}>
        <div className="px-5 py-6 flex items-center gap-3 border-b border-white/8">
          <div className="w-9 h-9 bg-swiggy-orange rounded-xl flex items-center justify-center overflow-hidden p-1.5 shrink-0" style={{boxShadow:'0 4px 12px rgba(251,84,4,0.35)'}}>
            <SwiggyLogo size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-white leading-none text-[13px] tracking-tight">Catalyst Portal</h1>
            <p className="text-[#6B6057] text-[10px] font-bold mt-0.5 tracking-wide">Swiggy Campus</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {tabs.filter(t => !t.hidden).map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-150 relative ${
                activeTab === tab.id
                  ? 'bg-swiggy-orange text-white font-bold'
                  : 'text-[#A8A09A] hover:bg-white/6 hover:text-white font-semibold'
              }`}
            >
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-[13px]">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute right-3 px-1.5 py-0.5 bg-white/20 text-white text-[9px] font-black rounded-full min-w-[18px] text-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/8">
          <div className="rounded-xl p-3.5 mb-3 flex items-center gap-3" style={{background:'rgba(255,255,255,0.07)'}}>
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-white/10 flex items-center justify-center">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} className="w-full h-full object-cover" alt="User Avatar" />
              ) : (
                <UserIcon size={16} className="text-white/30" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-[#6B6057] uppercase tracking-widest mb-0.5">Signed in</p>
              <p className="text-[12px] font-bold text-white truncate leading-tight">{user?.displayName}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-[#6B6057] hover:text-red-400 text-[11px] font-bold py-2 transition-colors uppercase tracking-widest"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E3DDD5] flex justify-around items-center py-2 px-4 z-50">
        {tabs.filter(t => !t.hidden).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 min-w-[56px] relative transition-colors ${
              activeTab === tab.id ? 'text-swiggy-orange font-bold' : 'text-[#A09488]'
            }`}
          >
            <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-tight">{tab.label}</span>
            {tab.badge ? (
              <span className="absolute top-1 right-2 px-1 py-0.5 bg-swiggy-orange text-white text-[8px] font-black rounded-full">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Layout;

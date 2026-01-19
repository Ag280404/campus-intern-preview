
import React from 'react';
import { Home, ClipboardList, Trophy, User as UserIcon, LogOut, ShieldCheck, Bell } from 'lucide-react';
import { db } from '../services/mockDatabase';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: any;
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
  const unreadCount = user ? db.getNotifications(user.id).filter(n => !n.isRead).length : 0;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: ClipboardList },
    { id: 'leaderboard', label: 'Ranks', icon: Trophy },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'admin', label: 'Admin', icon: ShieldCheck, hidden: user?.email !== 'admin@campus.swiggy.com' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white px-4 py-3 border-b flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-swiggy-orange rounded-lg flex items-center justify-center overflow-hidden p-1">
            <SwiggyLogo size={20} />
          </div>
          <span className="font-bold text-swiggy-orange text-lg tracking-tight">Intern Analytics</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onTabChange('notifications')} className="relative p-2 text-slate-500">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-swiggy-orange rounded-full"></span>}
          </button>
          <button onClick={onLogout} className="p-2 text-slate-500">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-swiggy-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-100 overflow-hidden p-1.5">
            <SwiggyLogo size={28} />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 leading-none text-sm tracking-tight">Intern Portal</h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">Analytics Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {tabs.filter(t => !t.hidden).map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'bg-swiggy-light text-swiggy-orange font-bold shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 font-semibold'
              }`}
            >
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="text-sm">{tab.label}</span>
              {tab.badge ? (
                <span className="absolute right-4 px-1.5 py-0.5 bg-swiggy-orange text-white text-[10px] font-black rounded-full min-w-[18px] text-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="bg-slate-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white flex items-center justify-center">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={20} className="text-slate-300" />
                )}
             </div>
             <div className="min-w-0">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Signed in</p>
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user?.displayName}</p>
             </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-red-500 text-xs font-bold py-2 transition-colors uppercase tracking-widest"
          >
            <LogOut size={16} /> Logout
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 px-4 z-50">
        {tabs.filter(t => !t.hidden).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1 p-2 min-w-[64px] relative ${
              activeTab === tab.id ? 'text-swiggy-orange font-bold' : 'text-slate-400'
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

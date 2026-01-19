
import React, { useState, useEffect } from 'react';
import { db } from './services/mockDatabase';
import { CAMPUSES } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskSubmission from './components/TaskSubmission';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AdminReview from './components/AdminReview';
import Notifications from './components/Notifications';
import { User, Submission, MetricRollup, Notification } from './types';
import { LogIn, MapPin, ChevronRight, CheckCircle2, TrendingUp, Lock, User as UserIcon, AlertCircle, Bell, X, Users, ChevronDown } from 'lucide-react';

const SwiggyLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <img 
    src="https://res.cloudinary.com/dsnlfhjpm/image/upload/v1767178733/swiggy-logo-app-icon_axds7i.webp" 
    alt="Swiggy Logo"
    style={{ width: size, height: size, objectFit: 'contain' }}
    className={className}
  />
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<MetricRollup[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcomeNotif, setShowWelcomeNotif] = useState(false);
  const [unreadNotif, setUnreadNotif] = useState<Notification | null>(null);
  const [selectedCatalystId, setSelectedCatalystId] = useState<string>('catalyst_iitd');
  
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });

  const isAdmin = user?.email === 'admin@campus.swiggy.com';
  const allCatalysts = db.getAllUsers().filter(u => u.id !== 'admin');
  const selectedCatalyst = db.getUserById(selectedCatalystId);

  const refreshData = () => {
    if (user) {
      const effectiveUserId = (isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab)) 
        ? selectedCatalystId 
        : (user.id.includes('admin') ? undefined : user.id);
        
      setSubmissions(db.getSubmissions(effectiveUserId));
      setLeaderboard(db.getLeaderboard());
      
      const unread = db.getNotifications(user.id).filter(n => !n.isRead);
      if (unread.length > 0) {
        setUnreadNotif(unread[0]);
        setShowWelcomeNotif(true);
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, [user, activeTab, selectedCatalystId]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    
    setTimeout(() => {
      const loggedInUser = db.login(loginData.identifier, loginData.password);
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        setError('Invalid credentials. Please verify your ID and password.');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setLoginData({ identifier: '', password: '' });
    setActiveTab('dashboard');
  };

  const handleSubmitTask = (data: any) => {
    if (user) {
      db.submitTask({
        userId: user.id,
        campusId: user.campusId,
        taskId: data.taskId,
        payload: data.payload,
        location: data.location
      });
      refreshData();
      setActiveTab('dashboard');
      alert('Task submitted successfully for review!');
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    if (user?.id === updatedUser.id) {
        setUser({ ...updatedUser });
    }
    setLeaderboard(db.getLeaderboard());
    refreshData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF7F0] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-[56px] p-10 md:p-14 swiggy-shadow animate-in zoom-in duration-300">
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 bg-swiggy-orange rounded-[32px] flex items-center justify-center shadow-2xl shadow-orange-100 mb-8 overflow-hidden">
              <SwiggyLogo size={64} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 text-center leading-tight mb-4 tracking-tight">Campus Intern Portal</h1>
            <p className="text-[#94A3B8] font-bold text-[11px] text-center uppercase tracking-[0.12em] leading-relaxed max-w-[320px] px-2">
              Welcome to the Campus Growth Catalyst Portal. Sign in to view your tasks, submit proof of work, and track your campus performance.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-5 py-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] mb-3 ml-2">User ID</label>
              <div className="relative">
                <input 
                  type="text" required 
                  className={`w-full pl-14 pr-6 py-6 rounded-[24px] border-2 outline-none focus:ring-4 focus:ring-swiggy-orange/10 transition-all bg-slate-50 font-bold text-slate-700 text-base placeholder:text-slate-300 ${error ? 'border-red-200' : 'border-[#E2E8F0] focus:border-swiggy-orange'}`}
                  placeholder="e.g., catalyst_iitd"
                  value={loginData.identifier}
                  onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserIcon size={22} />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-[0.15em] mb-3 ml-2">Password</label>
              <div className="relative">
                <input 
                  type="password" required 
                  className={`w-full pl-14 pr-6 py-6 rounded-[24px] border-2 outline-none focus:ring-4 focus:ring-swiggy-orange/10 transition-all bg-slate-50 font-bold text-slate-700 text-base placeholder:text-slate-300 ${error ? 'border-red-200' : 'border-[#E2E8F0] focus:border-swiggy-orange'}`}
                  placeholder="Enter your security key"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                />
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={22} />
                </div>
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-swiggy-orange hover:bg-[#E14A00] text-white font-black py-6 rounded-[28px] shadow-2xl shadow-orange-200 transition-all flex items-center justify-center gap-2 mt-10 text-xl active:scale-95 disabled:opacity-70 group"
            >
              {isLoggingIn ? "Authenticating..." : "Sign In to Portal"} 
              <ChevronRight size={26} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-14 pt-8 border-t border-slate-100 text-center">
            <p className="text-[11px] text-[#CBD5E1] font-black uppercase tracking-[0.2em]">
              Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
    >
      {/* Admin Specific Catalyst Selector */}
      {isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab) && (
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl swiggy-shadow border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-swiggy-light text-swiggy-orange rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 leading-tight">Intern Selection</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Viewing analytics & config for selected intern</p>
              </div>
           </div>
           <div className="relative min-w-[240px]">
              <select 
                value={selectedCatalystId}
                onChange={(e) => setSelectedCatalystId(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-swiggy-orange appearance-none cursor-pointer"
              >
                {allCatalysts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.displayName} ({db.getCampusName(c.campusId)})
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <Dashboard 
          submissions={submissions} 
          leaderboard={leaderboard} 
          user={isAdmin ? selectedCatalyst : user} 
          isAdmin={isAdmin}
        />
      )}
      {activeTab === 'tasks' && (
        <TaskSubmission 
          onSubmit={handleSubmitTask} 
          isAdmin={isAdmin} 
          selectedCatalyst={isAdmin ? selectedCatalyst : null}
          submissions={submissions}
        />
      )}
      {activeTab === 'leaderboard' && <Leaderboard data={leaderboard} isAdmin={isAdmin} />}
      {activeTab === 'notifications' && (
        <Notifications userId={user.id} onRead={refreshData} />
      )}
      {activeTab === 'profile' && <Profile user={user} onUserUpdate={handleUserUpdate} />}
      {activeTab === 'admin' && isAdmin && (
        <AdminReview 
          submissions={db.getSubmissions()} 
          onUpdate={refreshData} 
          selectedCatalyst={selectedCatalyst}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </Layout>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDatabase';
import Layout from './Layout';
import Dashboard from './Dashboard';
import TaskSubmission from './TaskSubmission';
import Leaderboard from './Leaderboard';
import Profile from './Profile';
import AdminReview from './AdminReview';
import Notifications from './Notifications';
import { User, Submission, MetricRollup } from '../types';
import { ChevronRight, Lock, User as UserIcon, AlertCircle, Users, ChevronDown } from 'lucide-react';

const SwiggyLogo = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
  <img 
    src="https://res.cloudinary.com/dsnlfhjpm/image/upload/v1767178733/swiggy-logo-app-icon_axds7i.webp" 
    alt="Swiggy Logo"
    style={{ width: size, height: size, objectFit: 'contain' }}
    className={className}
  />
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<MetricRollup[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatalystId, setSelectedCatalystId] = useState<string>('catalyst_iitd');
  
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });

  const isAdmin = user?.email === 'admin@campus.swiggy.com' || user?.id === 'admin';
  const allCatalysts = db.getAllUsers().filter(u => u.id !== 'admin');
  const selectedCatalyst = db.getUserById(selectedCatalystId);

  const refreshData = () => {
    if (!user) return;
    
    const userId = user.id || '';
    const effectiveUserId = (isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab)) 
      ? selectedCatalystId 
      : (userId === 'admin' ? undefined : userId);
      
    setSubmissions(db.getSubmissions(effectiveUserId));
    setLeaderboard(db.getLeaderboard());
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
        setError('Invalid credentials. Hint: catalyst_iitd / swiggy_iitd');
      }
      setIsLoggingIn(false);
    }, 600);
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
      <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Soft Modern Background Accents */}
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-swiggy-light/40 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-swiggy-orange/5 rounded-full blur-[120px]"></div>

        <div className="bg-white w-full max-w-[460px] rounded-[56px] p-12 md:p-14 premium-card-shadow relative z-10 border border-white/80 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col items-center mb-12">
            <div className="w-22 h-22 bg-swiggy-orange rounded-[32px] flex items-center justify-center logo-inner-glow mb-8 overflow-hidden p-4.5 group cursor-default transition-transform hover:rotate-3 duration-500">
              <SwiggyLogo size={64} className="group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-[32px] font-black text-slate-900 text-center uppercase leading-[1.1] tracking-tight">CATALYST PORTAL</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-7">
            {error && (
              <div className="bg-red-50 text-red-600 px-6 py-4 rounded-[22px] text-xs font-bold flex items-center gap-3.5 border border-red-100 animate-in slide-in-from-top-3 duration-500">
                <AlertCircle size={18} strokeWidth={2.5} />
                {error}
              </div>
            )}
            
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">User ID</label>
              <div className="relative group">
                <input 
                  type="text" required 
                  className="w-full pl-13 pr-6 py-4.5 rounded-[26px] border border-slate-100 outline-none transition-all bg-slate-50/60 font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-swiggy-orange/40 focus:shadow-[0_0_0_1px_rgba(251,84,4,0.1)]"
                  placeholder="e.g. catalyst_iitd"
                  value={loginData.identifier}
                  onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                />
                <div className="absolute left-5.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-swiggy-orange transition-colors duration-300">
                  <UserIcon size={19} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <input 
                  type="password" required 
                  className="w-full pl-13 pr-6 py-4.5 rounded-[26px] border border-slate-100 outline-none transition-all bg-slate-50/60 font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-swiggy-orange/40 focus:shadow-[0_0_0_1px_rgba(251,84,4,0.1)]"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                />
                <div className="absolute left-5.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-swiggy-orange transition-colors duration-300">
                  <Lock size={19} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full swiggy-btn-gradient text-white font-black py-5.5 rounded-[28px] transition-all flex items-center justify-center gap-3 mt-4 text-sm uppercase tracking-widest group"
            >
              <span>{isLoggingIn ? "Verifying..." : "Sign in"}</span>
              <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out"></div>
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest opacity-80">Secured Catalyst Portal • Swiggy Hub</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
      {isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab) && (
        <div className="mb-8 flex items-center justify-between bg-white px-6 py-4.5 rounded-[28px] swiggy-shadow border border-slate-50/80">
           <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-swiggy-light text-swiggy-orange rounded-[14px] flex items-center justify-center shadow-inner shadow-orange-100/50">
                <Users size={22} strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <h4 className="text-[13px] font-black text-slate-900 leading-none uppercase tracking-tight">Catalyst Context</h4>
              </div>
           </div>
           <div className="relative">
              <select 
                value={selectedCatalystId}
                onChange={(e) => setSelectedCatalystId(e.target.value)}
                className="pl-5 pr-12 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-[13px] font-black text-slate-800 outline-none focus:ring-4 focus:ring-swiggy-orange/5 appearance-none min-w-[240px] transition-all hover:bg-white"
              >
                {allCatalysts.map(c => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>
      )}

      {activeTab === 'dashboard' && <Dashboard submissions={submissions} leaderboard={leaderboard} user={isAdmin ? selectedCatalyst : user} isAdmin={isAdmin} />}
      {activeTab === 'tasks' && <TaskSubmission onSubmit={handleSubmitTask} isAdmin={isAdmin} selectedCatalyst={isAdmin ? selectedCatalyst : null} submissions={submissions} />}
      {activeTab === 'leaderboard' && <Leaderboard data={leaderboard} isAdmin={isAdmin} />}
      {activeTab === 'notifications' && <Notifications userId={user.id} onRead={refreshData} />}
      {activeTab === 'profile' && <Profile user={user} onUserUpdate={handleUserUpdate} />}
      {activeTab === 'admin' && isAdmin && <AdminReview submissions={db.getSubmissions()} onUpdate={refreshData} selectedCatalyst={selectedCatalyst} onUserUpdate={handleUserUpdate} />}
    </Layout>
  );
};

export default App;
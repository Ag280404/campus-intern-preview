
import React, { useState, useEffect } from 'react';
import { db } from './services/mockDatabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskSubmission from './components/TaskSubmission';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AdminReview from './components/AdminReview';
import Notifications from './components/Notifications';
import { User, Submission, MetricRollup, Task } from './types';
import { ChevronRight, Lock, User as UserIcon, AlertCircle, Users, ChevronDown, Loader2 } from 'lucide-react';

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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatalystId, setSelectedCatalystId] = useState<string>('catalyst_iitd');
  const [selectedCatalyst, setSelectedCatalyst] = useState<User | null>(null);
  const [allCatalysts, setAllCatalysts] = useState<User[]>([]);
  
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });

  const isAdmin = user?.email === 'admin@campus.swiggy.com' || user?.id === 'admin';

  const refreshData = async () => {
    if (!user) return;
    
    try {
      const [allUsers, fetchedTasks] = await Promise.all([
        db.getAllUsers(),
        db.getTasks()
      ]);
      
      const filteredUsers = allUsers.filter((u: User) => u.id !== 'admin');
      setAllCatalysts(filteredUsers);
      setTasks(fetchedTasks);
      
      const catalyst = await db.getUserById(selectedCatalystId);
      if (catalyst) {
        setSelectedCatalyst(catalyst);
      } else if (filteredUsers.length > 0) {
        setSelectedCatalyst(filteredUsers[0]);
        setSelectedCatalystId(filteredUsers[0].id);
      }

      const effectiveUserId = (isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab)) 
        ? selectedCatalystId 
        : (user.id === 'admin' ? undefined : user.id);
        
      const [fetchedSubmissions, fetchedLeaderboard] = await Promise.all([
        db.getSubmissions(effectiveUserId),
        db.getLeaderboard()
      ]);
      
      setSubmissions(fetchedSubmissions);
      setLeaderboard(fetchedLeaderboard);
      setIsLoading(false);
    } catch (e) {
      console.error("Failed to refresh data", e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user, activeTab, selectedCatalystId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    try {
      const loggedInUser = await db.login(loginData.identifier, loginData.password);
      if (loggedInUser) setUser(loggedInUser);
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    db.logout();
    setUser(null);
    setLoginData({ identifier: '', password: '' });
    setActiveTab('dashboard');
  };

  const handleSubmitTask = async (data: any) => {
    if (user) {
      await db.submitTask({
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

  const handleUserUpdate = async (updatedUser: User) => {
    if (user?.id === updatedUser.id) setUser({ ...updatedUser });
    refreshData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-swiggy-light/40 rounded-full blur-[140px]"></div>
        <div className="bg-white w-full max-w-[460px] rounded-[56px] p-12 md:p-14 premium-card-shadow relative z-10 border border-white/80">
          <div className="flex flex-col items-center mb-12">
            <div className="w-22 h-22 bg-swiggy-orange rounded-[32px] flex items-center justify-center logo-inner-glow mb-8 overflow-hidden p-4.5 group cursor-default transition-transform hover:rotate-3 duration-500">
              <SwiggyLogo size={64} className="group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-[32px] font-black text-slate-900 text-center uppercase leading-[1.1] tracking-tight">CATALYST PORTAL</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-7">
            {error && (
              <div className="bg-red-50 text-red-600 px-6 py-4 rounded-[22px] text-xs font-bold flex items-center gap-3.5 border border-red-100">
                <AlertCircle size={18} strokeWidth={2.5} />
                <span className="flex-1">{error}</span>
              </div>
            )}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">User ID</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required 
                  value={loginData.identifier} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, identifier: e.target.value})} 
                  className="w-full pl-13 pr-6 py-4.5 rounded-[26px] border border-slate-100 outline-none transition-all bg-slate-50/60 font-bold text-slate-800 focus:bg-white" 
                  placeholder="e.g. catalyst_iitd" 
                />
                <div className="absolute left-5.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-swiggy-orange transition-colors"><UserIcon size={19} /></div>
              </div>
            </div>
            <div className="space-y-2.5">
              <label className="block text-[10px] font-bold text-slate-400 ml-3 uppercase tracking-widest">Password</label>
              <div className="relative group">
                <input 
                  type="password" 
                  required 
                  value={loginData.password} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, password: e.target.value})} 
                  className="w-full pl-13 pr-6 py-4.5 rounded-[26px] border border-slate-100 outline-none transition-all bg-slate-50/60 font-bold text-slate-800 focus:bg-white" 
                  placeholder="••••••••" 
                />
                <div className="absolute left-5.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-swiggy-orange transition-colors"><Lock size={19} /></div>
              </div>
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full swiggy-btn-gradient text-white font-black py-5.5 rounded-[28px] flex items-center justify-center gap-3 mt-4 text-sm uppercase tracking-widest group">
              <span>{isLoggingIn ? "Verifying..." : "Sign in"}</span>
              <ChevronRight size={20} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
      {isLoading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-swiggy-orange" size={48} />
          <p className="font-bold text-xs uppercase tracking-widest">Synchronizing Database...</p>
        </div>
      ) : (
        <>
          {isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab) && (
            <div className="mb-8 flex items-center justify-between bg-white px-6 py-4.5 rounded-[28px] swiggy-shadow border border-slate-50/80">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-swiggy-light text-swiggy-orange rounded-[14px] flex items-center justify-center shadow-inner shadow-orange-100/50">
                  <Users size={22} strokeWidth={2.5} />
                </div>
                <h4 className="text-[13px] font-black text-slate-900 leading-none uppercase tracking-tight">Catalyst Context</h4>
              </div>
              <div className="relative">
                <select 
                  value={selectedCatalystId} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCatalystId(e.target.value)} 
                  className="pl-5 pr-12 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-[13px] font-black text-slate-800 min-w-[240px] appearance-none"
                >
                  {allCatalysts.map((c: User) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && <Dashboard submissions={submissions} leaderboard={leaderboard} user={isAdmin ? selectedCatalyst : user} isAdmin={isAdmin} tasks={tasks} />}
          {activeTab === 'tasks' && <TaskSubmission onSubmit={handleSubmitTask} isAdmin={isAdmin} selectedCatalyst={isAdmin ? selectedCatalyst : null} submissions={submissions} tasks={tasks} />}
          {activeTab === 'leaderboard' && <Leaderboard data={leaderboard} isAdmin={isAdmin} />}
          {activeTab === 'notifications' && <Notifications userId={user.id} onRead={refreshData} />}
          {activeTab === 'profile' && <Profile user={user} onUserUpdate={handleUserUpdate} />}
          {activeTab === 'admin' && isAdmin && <AdminReview submissions={submissions} onUpdate={refreshData} selectedCatalyst={selectedCatalyst} onUserUpdate={handleUserUpdate} tasks={tasks} />}
        </>
      )}
    </Layout>
  );
};

export default App;

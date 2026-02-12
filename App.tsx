
import React, { useState, useEffect } from 'react';
import { db } from './services/mockDatabase';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TaskSubmission from './components/TaskSubmission';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import AdminReview from './components/AdminReview';
import Notifications from './components/Notifications';
import CampusCalendar from './components/CampusCalendar';
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
      
      // Sort tasks based on the requested order: t5 (New User), t4 (Student Rewards), t3 (Social), t1 (Flyer), t2 (Streak)
      const taskOrder = ['t5', 't4', 't3', 't1', 't2'];
      const sortedTasks = [...fetchedTasks].sort((a, b) => 
        taskOrder.indexOf(a.id) - taskOrder.indexOf(b.id)
      );
      setTasks(sortedTasks);
      
      const catalyst = await db.getUserById(selectedCatalystId);
      if (catalyst) {
        setSelectedCatalyst(catalyst);
      } else if (filteredUsers.length > 0) {
        setSelectedCatalyst(filteredUsers[0]);
        setSelectedCatalystId(filteredUsers[0].id);
      }

      const effectiveUserId = (isAdmin && ['dashboard', 'tasks', 'admin', 'calendar'].includes(activeTab)) 
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
        {/* Background blobs */}
        <div className="absolute top-[-15%] left-[-15%] w-[50%] h-[50%] bg-swiggy-light/40 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/30 rounded-full blur-[100px]"></div>
        
        <div className="bg-white w-full max-w-[420px] rounded-[16px] p-10 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] relative z-10 border border-gray-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-swiggy-orange rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(251,84,4,0.3)] mb-6 overflow-hidden p-4 group cursor-default transition-transform hover:scale-105 duration-500">
              <SwiggyLogo size={48} className="group-hover:rotate-6 transition-transform duration-500" />
            </div>
            <h1 className="text-[28px] font-bold text-gray-900 text-center uppercase tracking-tight">CATALYST PORTAL</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-[13px] font-semibold flex items-center gap-3 border border-red-100 mb-4">
                <AlertCircle size={18} strokeWidth={2.5} className="shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[12px] font-semibold text-gray-500 ml-1 uppercase tracking-wider">USER ID</label>
              <div className="relative group">
                <input 
                  type="text" 
                  required 
                  value={loginData.identifier} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, identifier: e.target.value})} 
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 outline-none transition-all bg-white font-medium text-gray-800 placeholder-gray-400 focus:border-swiggy-orange focus:ring-4 focus:ring-swiggy-orange/10" 
                  placeholder="e.g. catalyst_iitd" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-semibold text-gray-500 ml-1 uppercase tracking-wider">PASSWORD</label>
              <div className="relative group">
                <input 
                  type="password" 
                  required 
                  value={loginData.password} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, password: e.target.value})} 
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 outline-none transition-all bg-white font-medium text-gray-800 placeholder-gray-400 focus:border-swiggy-orange focus:ring-4 focus:ring-swiggy-orange/10" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoggingIn} 
              className="w-full h-12 bg-gradient-to-r from-[#FB5404] to-[#FF6B35] text-white font-semibold rounded-lg flex items-center justify-center gap-2 mt-7 text-base shadow-lg hover:shadow-[0_8px_16px_rgba(251,84,4,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-70 group"
            >
              <span>{isLoggingIn ? "Verifying..." : "Sign in"}</span>
              <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-400 text-[11px] font-medium tracking-wide">
            Internal Portal • Swiggy Campus Program
          </p>
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
          {isAdmin && ['dashboard', 'tasks', 'admin', 'calendar'].includes(activeTab) && (
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
          {activeTab === 'calendar' && <CampusCalendar user={user} isAdmin={isAdmin} currentCampus={isAdmin ? selectedCatalyst : user} />}
          {activeTab === 'notifications' && <Notifications userId={user.id} onRead={refreshData} />}
          {activeTab === 'profile' && <Profile user={user} onUserUpdate={handleUserUpdate} />}
          {activeTab === 'admin' && isAdmin && <AdminReview submissions={submissions} onUpdate={refreshData} selectedCatalyst={selectedCatalyst} onUserUpdate={handleUserUpdate} tasks={tasks} />}
        </>
      )}
    </Layout>
  );
};

export default App;


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
  const [selectedCatalystId, setSelectedCatalystId] = useState<string>('catalyst_iitbbs_k7m9');
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
      try {
        await db.submitTask({
          userId: user.id,
          campusId: user.campusId,
          taskId: data.taskId,
          payload: data.payload,
          location: data.location
        });
        await refreshData();
        setActiveTab('dashboard');
        alert("Task submitted successfully!");
      } catch (err: any) {
        console.error("Submission failed", err);
        alert("Failed to submit task: " + (err.message || "Unknown error"));
      }
    }
  };

  const handleUserUpdate = async (updatedUser: User) => {
    if (user?.id === updatedUser.id) setUser({ ...updatedUser });
    refreshData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F8F5F1] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Warm ambient glow — restrained, not blobby */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-[#FDE8D5]/30 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[320px] h-[320px] bg-[#F5E8D8]/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="bg-white w-full max-w-[420px] rounded-2xl p-10 premium-card-shadow relative z-10 border border-[#E3DDD5]">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-swiggy-orange rounded-2xl flex items-center justify-center mb-5 overflow-hidden p-3 group cursor-default transition-all duration-300 hover:scale-105 hover:rounded-[20px]" style={{boxShadow:'0 6px 20px rgba(251,84,4,0.28)'}}>
              <SwiggyLogo size={36} className="group-hover:rotate-6 transition-transform duration-500" />
            </div>
            <h1 className="heading-display text-[26px] text-[#141414] text-center tracking-tight">CATALYST PORTAL</h1>
            <p className="text-[11px] text-[#A09488] font-bold uppercase tracking-[0.15em] mt-1.5">Swiggy Campus Program</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50/80 text-red-600 px-4 py-3 rounded-xl text-[13px] font-semibold flex items-center gap-3 border border-red-200/60 mb-4">
                <AlertCircle size={16} strokeWidth={2.5} className="shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#8B7E74] ml-1 uppercase tracking-[0.12em]">User ID</label>
              <input
                type="text"
                required
                value={loginData.identifier}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, identifier: e.target.value})}
                className="w-full h-12 px-4 rounded-xl border border-[#E3DDD5] outline-none transition-all bg-white font-semibold text-[#141414] placeholder-[#C5BDB6] focus:border-swiggy-orange"
                placeholder="e.g. catalyst_iitd"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-[#8B7E74] ml-1 uppercase tracking-[0.12em]">Password</label>
              <input
                type="password"
                required
                value={loginData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLoginData({...loginData, password: e.target.value})}
                className="w-full h-12 px-4 rounded-xl border border-[#E3DDD5] outline-none transition-all bg-white font-semibold text-[#141414] placeholder-[#C5BDB6] focus:border-swiggy-orange"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 swiggy-btn-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-6 text-[14px] transition-all disabled:opacity-60 group"
            >
              <span>{isLoggingIn ? "Verifying..." : "Sign in"}</span>
              <ChevronRight size={16} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </form>

          <p className="mt-7 text-center text-[#C0B6AE] text-[10px] font-bold tracking-[0.12em] uppercase">
            Internal Portal
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
      {isLoading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-[#A09488]">
          <Loader2 className="animate-spin text-swiggy-orange" size={36} />
          <p className="font-bold text-[11px] uppercase tracking-[0.18em]">Synchronizing...</p>
        </div>
      ) : (
        <>
          {isAdmin && ['dashboard', 'tasks', 'admin', 'calendar'].includes(activeTab) && (
            <div className="mb-8 flex items-center justify-between bg-white px-6 py-4 rounded-xl premium-card-shadow border border-[#E3DDD5]">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 bg-[#FEF0E6] text-swiggy-orange rounded-lg flex items-center justify-center">
                  <Users size={18} strokeWidth={2.5} />
                </div>
                <h4 className="text-[12px] font-black text-[#141414] leading-none uppercase tracking-[0.1em]">Catalyst Context</h4>
              </div>
              <div className="relative">
                <select
                  value={selectedCatalystId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCatalystId(e.target.value)}
                  className="pl-4 pr-10 py-2.5 bg-[#F8F5F1] border border-[#E3DDD5] rounded-lg text-[13px] font-bold text-[#141414] min-w-[240px] appearance-none outline-none focus:border-swiggy-orange transition-colors"
                >
                  {allCatalysts.map((c: User) => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A09488] pointer-events-none" />
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

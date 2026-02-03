
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatalystId, setSelectedCatalystId] = useState<string>('catalyst_iitd');
  const [selectedCatalyst, setSelectedCatalyst] = useState<User | null>(null);
  const [allCatalysts, setAllCatalysts] = useState<User[]>([]);
  
  const [loginData, setLoginData] = useState({ identifier: '', password: '' });

  const isAdmin = user?.email === 'admin@campus.swiggy.com' || user?.id === 'admin';

  // Fetch all necessary data asynchronously
  const refreshData = async () => {
    if (!user) return;
    
    try {
      const [allUsers, fetchedTasks] = await Promise.all([
        db.getAllUsers(),
        db.getTasks()
      ]);
      
      const filteredUsers = allUsers.filter(u => u.id !== 'admin');
      setAllCatalysts(filteredUsers);
      setTasks(fetchedTasks);
      
      const catalyst = await db.getUserById(selectedCatalystId);
      setSelectedCatalyst(catalyst);

      const userId = user.id || '';
      // Admin view for dashboard/tasks shows the selected intern's data
      const effectiveUserId = (isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab)) 
        ? selectedCatalystId 
        : (userId === 'admin' ? undefined : userId);
        
      const [fetchedSubmissions, fetchedLeaderboard] = await Promise.all([
        db.getSubmissions(effectiveUserId),
        db.getLeaderboard()
      ]);
      
      setSubmissions(fetchedSubmissions);
      setLeaderboard(fetchedLeaderboard);
    } catch (e) {
      console.error("Data refresh failed", e);
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
      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        setError('Invalid credentials. Hint: catalyst_iitd / swiggy_iitd');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error. Please check if Supabase tables are created.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    // Fixed: calling db.logout() which is now defined in MockDatabase
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

  const handleUserUpdate = (updatedUser: User) => {
    if (user?.id === updatedUser.id) {
        setUser({ ...updatedUser });
    }
    refreshData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-[#FFF8F2] via-[#FFF8F2] to-[#FFEBD6] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-swiggy-light/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-[#FFD7BA]/20 rounded-full blur-[100px]"></div>

        <div className="bg-white w-full max-w-[480px] rounded-[64px] p-12 md:p-16 premium-card-shadow relative z-10 border border-white/50 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-14">
            <div className="w-24 h-24 bg-swiggy-orange rounded-[36px] flex items-center justify-center logo-inner-glow mb-10 overflow-hidden p-4 group cursor-default">
              <SwiggyLogo size={64} className="group-hover:scale-110 transition-transform duration-500" />
            </div>
            <h1 className="text-[36px] font-black text-[#0F172A] text-center leading-[1] mb-3 tracking-tight">
              Catalyst Portal
            </h1>
            <p className="text-slate-400 font-extrabold text-[12px] text-center uppercase tracking-[0.2em] leading-relaxed opacity-70">
              Swiggy Campus Growth Program
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 px-6 py-4 rounded-[24px] text-xs font-bold flex items-center gap-3 border border-red-100 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} />
                <span className="leading-tight">{error}</span>
              </div>
            )}
            
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.18em] ml-2">User ID</label>
              <div className="relative group">
                <input 
                  type="text" required 
                  className="w-full pl-14 pr-7 py-5 rounded-[28px] border border-slate-100 outline-none transition-all bg-[#F8FAFC]/80 font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-swiggy-orange/60"
                  placeholder="e.g. catalyst_iitd"
                  value={loginData.identifier}
                  onChange={e => setLoginData({...loginData, identifier: e.target.value})}
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-swiggy-orange transition-colors duration-300">
                  <UserIcon size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.18em] ml-2">Password</label>
              <div className="relative group">
                <input 
                  type="password" required 
                  className="w-full pl-14 pr-7 py-5 rounded-[28px] border border-slate-100 outline-none transition-all bg-[#F8FAFC]/80 font-bold text-slate-800 placeholder:text-slate-300 focus:bg-white focus:border-swiggy-orange/60"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={e => setLoginData({...loginData, password: e.target.value})}
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-swiggy-orange transition-colors duration-300">
                  <Lock size={20} strokeWidth={2.5} />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full swiggy-btn-gradient text-white font-black py-6 rounded-[30px] transition-all flex items-center justify-center gap-3 mt-6 text-[16px] uppercase tracking-widest group"
            >
              <span>{isLoggingIn ? "Signing in..." : "Sign In"}</span>
              <ChevronRight size={22} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[100%] transition-all duration-[800ms] ease-in-out"></div>
            </button>
          </form>
          
          <div className="mt-14 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.15em] opacity-80">A secure portal for Swiggy Interns</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} user={user} onLogout={handleLogout}>
      {isAdmin && ['dashboard', 'tasks', 'admin'].includes(activeTab) && (
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-2xl swiggy-shadow border border-slate-100">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-swiggy-light text-swiggy-orange rounded-xl flex items-center justify-center">
                <Users size={20} />
              </div>
              <div className="hidden sm:block">
                <h4 className="text-xs font-black text-slate-900 leading-tight">Catalyst Focus</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Switch context</p>
              </div>
           </div>
           <div className="relative">
              <select 
                value={selectedCatalystId}
                onChange={(e) => setSelectedCatalystId(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-swiggy-orange appearance-none min-w-[200px]"
              >
                {allCatalysts.map(c => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
           </div>
        </div>
      )}

      {/* Passed missing tasks prop to components */}
      {activeTab === 'dashboard' && <Dashboard submissions={submissions} leaderboard={leaderboard} user={isAdmin ? selectedCatalyst : user} isAdmin={isAdmin} tasks={tasks} />}
      {activeTab === 'tasks' && <TaskSubmission onSubmit={handleSubmitTask} isAdmin={isAdmin} selectedCatalyst={isAdmin ? selectedCatalyst : null} submissions={submissions} tasks={tasks} />}
      {activeTab === 'leaderboard' && <Leaderboard data={leaderboard} isAdmin={isAdmin} />}
      {activeTab === 'notifications' && <Notifications userId={user.id} onRead={refreshData} />}
      {activeTab === 'profile' && <Profile user={user} onUserUpdate={handleUserUpdate} />}
      {activeTab === 'admin' && isAdmin && <AdminReview submissions={submissions} onUpdate={refreshData} selectedCatalyst={selectedCatalyst} onUserUpdate={handleUserUpdate} tasks={tasks} />}
    </Layout>
  );
};

export default App;

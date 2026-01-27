import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase';
import { LayoutDashboard, BookOpen, TrendingUp, Zap, LogOut, Loader2 } from 'lucide-react';
import throttle from 'lodash.throttle';
import ProfileModal from '../components/profilemodal'; 

export default function Layout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // Modal control state
  const navigate = useNavigate();
  const location = useLocation();

  const syncNeuralLink = useCallback(throttle(async () => {
    if (loaded) return;
    try {
      setError(null);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session) {
        setLoading(false);
        navigate('/signin');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData) {
        setProfile(profileData);
        setLoaded(true);
        setLoading(false);
        if (!profileData.onboarding_completed && location.pathname !== '/onboarding') {
          navigate('/onboarding');
        }
      } else {
        setError('Profile not ready.');
        setLoading(false);
      }
    } catch (err) {
      setError('Sync failed.');
      setLoading(false);
    }
  }, 2000), [loaded, navigate, location.pathname]);

  useEffect(() => {
    if (!loaded) syncNeuralLink();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoaded(false);
        navigate('/signin');
      }
    });

    return () => authSubscription.unsubscribe();
  }, [syncNeuralLink, loaded, navigate]);

  if (loading) {
    return (
      <div className="h-screen bg-[#08080a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="text-indigo-500 animate-spin" size={40} />
        <span className="text-[10px] font-black text-indigo-500 tracking-[0.5em] animate-pulse uppercase">Stabilizing Neural Link</span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#08080a] text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex w-72 border-r border-white/5 p-8 flex-col shrink-0">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Zap size={22} className="fill-current text-white" />
          </div>
          <span className="font-black tracking-tighter text-2xl italic">TGEN.</span>
        </div>

        <nav className="space-y-3">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Mission Control" to="/dashboard" active={location.pathname === '/dashboard'} />
          <SidebarLink icon={<BookOpen size={20} />} label="Academic Load" to="/academicload" active={location.pathname === '/academicload'} />
          <SidebarLink icon={<TrendingUp size={20} />} label="Performance" to="/performance" active={location.pathname === '/performance'} />
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          {/* TRIGGER MODAL ON CLICK */}
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-900/20 flex items-center justify-center text-indigo-400 font-black text-xs">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="pfp" />
              ) : (
                profile?.full_name?.charAt(0) || '?'
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black uppercase truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{profile?.level_of_study} Level</p>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 p-4 text-slate-500 hover:text-rose-400 transition-all">
            <LogOut size={20} />
            <span className="font-bold text-sm uppercase">Disconnect</span>
          </button>
        </div>
      </aside>

      {/* MOBILE NAV DOCK */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex justify-around items-center z-50 shadow-2xl">
        <MobileNavLink icon={<LayoutDashboard size={20} />} to="/dashboard" active={location.pathname === '/dashboard'} />
        <MobileNavLink icon={<BookOpen size={20} />} to="/academicload" active={location.pathname === '/academicload'} />
        <MobileNavLink icon={<TrendingUp size={20} />} to="/performance" active={location.pathname === '/performance'} />
        <button onClick={() => setIsProfileOpen(true)} className="p-4 text-slate-500">
           <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden">
              {profile?.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" alt="pfp" />}
           </div>
        </button>
      </nav>

      {/* VIEWPORT */}
      <main className="flex-1 overflow-y-auto relative bg-[#08080a] pb-28 lg:pb-0 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet context={{ profile, setProfile, setIsProfileOpen }} />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* THE MODAL */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={profile}
        setProfile={setProfile}
      />
    </div>
  );
}

// --- HELPER COMPONENTS (Now explicitly defined) ---

function SidebarLink({ icon, label, to, active }) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
      {icon} <span className="font-bold text-sm uppercase tracking-tight">{label}</span>
    </button>
  );
}

function MobileNavLink({ icon, to, active }) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className={`p-4 rounded-full transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}
    >
      {icon}
    </button>
  );
}
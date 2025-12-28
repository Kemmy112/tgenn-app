import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '../supabase';
import { LayoutDashboard, BookOpen, TrendingUp, Zap, LogOut } from 'lucide-react';

export default function Layout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin');
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    };
    fetchSession();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-indigo-500 font-mono tracking-[0.3em] animate-pulse text-xs">
      SYNCHRONIZING NEURAL FRAME...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex overflow-hidden font-sans">
      {/* PERSISTENT SIDEBAR */}
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col hidden lg:flex shrink-0">
        <div className="flex items-center gap-3 px-2 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Zap size={22} className="fill-current text-white" />
          </div>
          <span className="font-black tracking-tighter text-2xl italic">TGEN.</span>
        </div>

        <nav className="space-y-3">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Mission Control" to="/dashboard" active={location.pathname === '/dashboard'} />
          <SidebarLink icon={<BookOpen size={20} />} label="Academic Load" to="/academicload" active={location.pathname === '/academicload'} />
          <SidebarLink icon={<TrendingUp size={20} />} label="Performance" to="/performance" active={location.pathname === '/performance'} />
        </nav>

        <button onClick={handleSignOut} className="mt-auto flex items-center gap-3 w-full p-4 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all group">
          <LogOut size={20} />
          <span className="font-bold text-sm uppercase tracking-widest">Sign Out</span>
        </button>
      </aside>

      {/* DYNAMIC VIEWPORT */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* We pass profile AND setProfile so child pages can trigger updates */}
        <Outlet context={{ profile, setProfile }} />
      </main>
    </div>
  );
}

function SidebarLink({ icon, label, to, active }) {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
      {icon} <span className="font-bold text-sm tracking-wide">{label}</span>
    </button>
  );
}
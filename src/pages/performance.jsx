import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BarChart3, Activity, Target, ShieldCheck, 
  Zap, Brain, Timer, Lock 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Performance() {
  const { profile } = useOutletContext();

  // Hardcoded Stats for the "System Diagnostic" vibe
  const stats = [
    { label: "Neural Efficiency", val: "92%", icon: <Brain size={16}/>, color: "text-indigo-400" },
    { label: "Task Velocity", val: "1.4/day", icon: <Timer size={16}/>, color: "text-emerald-400" },
    { label: "Friction Shielding", val: "Active", icon: <ShieldCheck size={16}/>, color: "text-amber-400" }
  ];

  return (
    <div className="p-8 lg:p-14 max-w-[1600px] mx-auto min-h-screen">
      {/* HEADER */}
      <header className="mb-12">
        <span className="px-3 py-1 bg-white/5 text-slate-500 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
          Analytics Terminal // Node_{profile?.id?.slice(0, 5)}
        </span>
        <h1 className="text-5xl font-black italic uppercase text-white mt-4">
          Performance <span className="text-indigo-500">Metrics</span>
        </h1>
      </header>

      {/* STATS STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-black italic ${s.color}`}>{s.val}</p>
            </div>
            <div className={`p-4 rounded-2xl bg-white/5 ${s.color}`}>{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT: FRICTION MONITOR (HARDCODED) */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 p-10 rounded-[3rem]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
              <Activity size={18} className="text-indigo-500"/> Neural Resistance Heatmap
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase bg-white/5 px-3 py-1 rounded-full">Live Feed</span>
          </div>

          <div className="space-y-8">
            {profile?.academic_data?.slice(0, 5).map((course, i) => (
              <div key={course.code}>
                <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                  <span className="text-white">{course.code}</span>
                  <span className="text-slate-500">{[75, 40, 90, 20, 55][i]}% Resistance</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${[75, 40, 90, 20, 55][i]}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${[75, 40, 90, 20, 55][i] > 70 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: COMING SOON CARDS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-indigo-600/10 border border-indigo-500/20 p-10 rounded-[3rem] relative overflow-hidden group">
            <div className="relative z-10">
               <Lock className="text-indigo-500 mb-4" size={24}/>
               <h4 className="text-lg font-black italic uppercase text-white mb-2">Cognitive Reports</h4>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 Deep-dive PDF exports of your weekly focus cycles and peak performance hours. 
               </p>
               <div className="mt-6 inline-block px-4 py-2 bg-indigo-500/20 rounded-xl text-[9px] font-black uppercase text-indigo-400 tracking-widest">
                 Synthesizing Data...
               </div>
            </div>
            <BarChart3 className="absolute -bottom-6 -right-6 text-white/5 w-32 h-32 transform -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] relative overflow-hidden group opacity-60">
            <div className="relative z-10">
               <Target className="text-slate-500 mb-4" size={24}/>
               <h4 className="text-lg font-black italic uppercase text-white mb-2">GPA Predictor</h4>
               <p className="text-xs text-slate-400 leading-relaxed font-medium">
                 AI-driven estimation of semester outcomes based on current friction trends.
               </p>
               <div className="mt-6 inline-block px-4 py-2 bg-white/5 rounded-xl text-[9px] font-black uppercase text-slate-500 tracking-widest">
                 Awaiting Node Access
               </div>
            </div>
            <Zap className="absolute -bottom-6 -right-6 text-white/5 w-32 h-32 transform rotate-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  TrendingUp, Target, Award, ArrowUpRight, 
  ChevronRight, Brain, Info, Save
} from 'lucide-react';

export default function Performance() {
  const { profile } = useOutletContext();
  const courses = profile?.academic_data || [];

  // 1. Math: GPA Projection Logic
  const stats = useMemo(() => {
    const totalUnits = courses.reduce((s, c) => s + (Number(c.units) || 0), 0);
    // Mocking current GPA based on target
    const targetGPA = 4.0; 
    const currentGPA = 3.65; // This will eventually come from your DB
    return { totalUnits, targetGPA, currentGPA };
  }, [courses]);

  return (
    <div className="p-8 lg:p-14 max-w-[1400px] mx-auto">
      <header className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
            <TrendingUp size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">
              Performance Index
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1 uppercase tracking-widest">
              Sunday Calibration Window: <span className="text-emerald-500">Open</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: GPA & GOALS */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white/[0.03] border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
              <Award size={150} />
            </div>
            
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-10">System Projection</h3>
            
            <div className="flex items-end gap-2 mb-2">
              <span className="text-7xl font-black italic text-white leading-none">{stats.currentGPA}</span>
              <span className="text-emerald-500 font-bold text-lg mb-2">/ {stats.targetGPA}</span>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Current Estimated GPA</p>

            <div className="space-y-6">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Confidence Level</span>
                <span className="text-white">82%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[82%]" />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <MetricCard label="Units Passed" value={stats.totalUnits} icon={<Award size={16}/>} />
            <MetricCard label="Study Streak" value="12 Days" icon={<Brain size={16}/>} />
          </div>
        </div>

        {/* RIGHT: WEEKLY FRICTION LOGGING */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-xl font-bold italic text-white">Sunday Friction Review</h3>
                <p className="text-xs text-slate-500 mt-1">Adjust intensity for next week's timetable.</p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                <Info size={16} />
              </div>
            </div>

            <div className="space-y-4">
              {courses.map((course, idx) => (
                <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{course.code}</span>
                    <h4 className="font-bold text-white text-sm">{course.title}</h4>
                  </div>
                  
                  <div className="flex gap-2">
                    <FrictionButton label="Low" active={false} />
                    <FrictionButton label="Mid" active={true} />
                    <FrictionButton label="High" active={false} />
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20">
              <Save size={18} /> Sync Calibration
            </button>
          </section>
        </div>

      </div>
    </div>
  );
}

// Sub-components
function MetricCard({ label, value, icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
      <div className="text-emerald-500 mb-3">{icon}</div>
      <div className="text-2xl font-black italic text-white">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</div>
    </div>
  );
}

function FrictionButton({ label, active }) {
  return (
    <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
      ${active 
        ? 'bg-indigo-600 text-white' 
        : 'bg-white/5 text-slate-600 hover:text-slate-300'}`}>
      {label}
    </button>
  );
}
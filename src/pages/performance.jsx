import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  TrendingUp, Target, Award, ArrowUpRight, 
  Brain, Info, Save, Loader2, Sparkles 
} from 'lucide-react';

export default function Performance() {
  const { profile } = useOutletContext();
  const courses = profile?.academic_data || [];
  
  // State for the Sunday Friction Review
  const [selections, setSelections] = useState({}); // { 'CSC101': 'High' }
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Live Data Calculation
  const stats = useMemo(() => {
    const totalUnits = courses.reduce((s, c) => s + (Number(c.units) || 0), 0);
    const targetGPA = profile?.target_gpa || 5.0; // Pull from onboarding
    
    // For now, currentGPA is a projection of (Total Units * 0.9) 
    // We'll eventually calculate this from a 'grades' table
    const currentGPA = (targetGPA * 0.85).toFixed(2); 
    
    const confidence = 82; // This could be 100 - (FrictionLogs Count * 2)
    
    return { totalUnits, targetGPA, currentGPA, confidence };
  }, [courses, profile]);

  const handleCalibrationSync = async () => {
    if (Object.keys(selections).length === 0) return;
    setIsSyncing(true);

    const logs = Object.entries(selections).map(([code, level]) => ({
      user_id: profile.id,
      course_code: code,
      friction_level: level,
    }));

    const { error } = await supabase.from('friction_logs').insert(logs);

    if (!error) {
      alert("System Calibration Successful. Neural weights updated.");
      setSelections({}); // Clear after sync
    } else {
      alert("Calibration Error: " + error.message);
    }
    setIsSyncing(false);
  };

  // Replace your Performance component return with this:
return (
  <div className="p-4 md:p-8 lg:p-14 max-w-[1400px] mx-auto pb-24 lg:pb-0">
    <header className="mb-10 md:mb-16">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400">
          <TrendingUp size={28} className="md:w-8 md:h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase text-white leading-none">Performance Index</h1>
          <p className="text-slate-500 font-bold text-[8px] md:text-[10px] mt-2 uppercase tracking-[0.3em]">Status: Optimal</p>
        </div>
      </div>
    </header>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
      {/* LEFT: GPA */}
      <div className="lg:col-span-5 space-y-6 md:space-y-8">
        <section className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-10 relative overflow-hidden group">
          <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 md:mb-10">Neural Projection</h3>
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-4">
            <span className="text-6xl md:text-8xl font-black italic text-white leading-none tracking-tighter">{stats.currentGPA}</span>
            <span className="text-emerald-500 font-black text-lg md:text-xl mb-2">/ {stats.targetGPA}</span>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
              <span>Confidence Level</span>
              <span className="text-emerald-400">{stats.confidence}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${stats.confidence}%` }} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <MetricCard label="Units in Matrix" value={stats.totalUnits} icon={<Target size={16}/>} />
          <MetricCard label="System Age" value="Day 1" icon={<Brain size={16}/>} />
        </div>
      </div>

      {/* RIGHT: CALIBRATION */}
      <div className="lg:col-span-7">
        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] p-6 md:p-10">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-lg md:text-xl font-bold italic text-white uppercase">Sunday Calibration</h3>
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Info size={16} /></div>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.code} className="p-4 md:p-5 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[9px] font-mono font-bold text-indigo-500">{course.code}</span>
                  <h4 className="font-bold text-white text-xs">{course.title}</h4>
                </div>
                <div className="grid grid-cols-3 gap-1 md:flex md:gap-1.5">
                  {['Low', 'Mid', 'High'].map((level) => (
                    <button key={level}
                      onClick={() => setSelections(prev => ({ ...prev, [course.code]: level }))}
                      className={`py-2.5 md:px-4 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all
                        ${selections[course.code] === level ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-600'}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleCalibrationSync} disabled={isSyncing || Object.keys(selections).length === 0}
            className="w-full mt-8 py-4 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all">
            {isSyncing ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            {isSyncing ? "Syncing..." : "Sync Calibration"}
          </button>
        </section>
      </div>
    </div>
  </div>
);
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:border-emerald-500/20 transition-all">
      <div className="text-emerald-500 mb-4">{icon}</div>
      <div className="text-3xl font-black italic text-white mb-1">{value}</div>
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{label}</div>
    </div>
  );
}
import React, { useMemo, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabase';
import { Gauge, Zap, Clock, Brain, Flame, RefreshCcw } from 'lucide-react';

export default function AcademicLoad() {
  const { profile, setProfile } = useOutletContext();
  const [frictions, setFrictions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const courses = profile?.academic_data || [];

  useEffect(() => {
    const fetchFriction = async () => {
      const { data } = await supabase
        .from('friction_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setFrictions(data);
    };
    fetchFriction();
  }, [profile.id]);

  const stats = useMemo(() => {
    const units = courses.reduce((s, c) => s + (Number(c.units) || 0), 0);
    const weightedSum = courses.reduce((total, course) => {
      let multiplier = course.difficulty === 2 ? 1.8 : 1.0;
      const courseFriction = frictions.filter(f => f.course_code === course.code);
      if (courseFriction.length > 0) {
        const latest = courseFriction[0].friction_level;
        if (latest === 'High') multiplier += 0.5;
        if (latest === 'Mid') multiplier += 0.2;
      }
      return total + (Number(course.units) * multiplier);
    }, 0);

    const score = Math.min(Math.round((weightedSum / 30) * 100), 100);
    return { units, weightedSum, score, courses };
  }, [courses, frictions]);

  const recalibrateEngine = async () => {
    setIsGenerating(true);
    // ... logic remains same ...
    setIsGenerating(false);
  };

  return (
    <div className="p-4 md:p-8 lg:p-14 max-w-7xl mx-auto pb-24 lg:pb-0">
      <header className="flex items-center gap-4 md:gap-6 mb-8 md:mb-16">
        <div className="p-3 md:p-4 bg-indigo-600/20 rounded-2xl md:rounded-3xl text-indigo-400">
          <Gauge size={24} className="md:w-10 md:h-10" />
        </div>
        <div>
          <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tight text-white">Load Analysis</h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm">Cognitive weight quantification.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT: GAUGE CARD */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 flex flex-col items-center">
          <div className="relative w-48 h-48 md:w-72 md:h-72 mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 288 288">
              <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-white/5" />
              <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="18" fill="transparent" 
                strokeDasharray={816} strokeDashoffset={816 - (816 * stats.score) / 100}
                className="text-indigo-500 transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl md:text-7xl font-black italic">{stats.score}%</span>
              <span className="text-[8px] md:text-[10px] font-bold text-slate-500 tracking-widest uppercase text-center mt-1">Neural Load</span>
            </div>
          </div>

          <button onClick={recalibrateEngine} disabled={isGenerating}
            className="w-full md:w-auto mb-10 flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
            {isGenerating ? <RefreshCcw size={14} className="animate-spin" /> : <Flame size={14} />}
            {isGenerating ? "Recalibrating..." : "Execute Recalibration"}
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 w-full">
            <SmallStat icon={<Zap size={16}/>} label="Weighted" value={stats.weightedSum.toFixed(1)} />
            <SmallStat icon={<Clock size={16}/>} label="Weekly Hrs" value={Math.round(stats.weightedSum * 2.2)} />
            <SmallStat icon={<Brain size={16}/>} label="Core Hard" value={courses.filter(c => c.difficulty === 2).length} />
          </div>
        </div>

        {/* RIGHT: COURSE LIST */}
        <div className="lg:col-span-5 space-y-4 lg:max-h-[700px] lg:overflow-y-auto lg:pr-4 custom-scrollbar">
          {stats.courses.map((c, i) => (
            <div key={i} className="p-5 md:p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] md:rounded-3xl flex justify-between items-center group transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] md:text-[10px] font-mono font-bold text-indigo-400 uppercase">{c.code}</span>
                  {c.difficulty === 2 && <Flame size={12} className="text-rose-500" />}
                </div>
                <h4 className="font-bold text-xs md:text-sm text-white">{c.title}</h4>
              </div>
              <div className="text-right">
                <div className="text-lg md:text-xl font-black italic">{c.units}</div>
                <div className="text-[8px] font-bold text-slate-600 uppercase">Credits</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SmallStat({ icon, label, value }) {
  return (
    <div className="text-center p-4 md:p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col items-center">
      <div className="text-indigo-400 mb-2">{icon}</div>
      <div className="text-xl md:text-2xl font-black italic text-white">{value}</div>
      <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">
        {label}
      </div>
    </div>
  );
}
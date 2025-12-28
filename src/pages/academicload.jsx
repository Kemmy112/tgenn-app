import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Gauge, Zap, Clock, Brain, Flame } from 'lucide-react';

export default function AcademicLoad() {
  const { profile } = useOutletContext();
  const courses = profile?.academic_data || [];

  const stats = useMemo(() => {
    const units = courses.reduce((s, c) => s + (Number(c.units) || 0), 0);
    const weight = courses.reduce((s, c) => s + (Number(c.units) * (c.difficulty === 2 ? 1.5 : 1)), 0);
    const score = Math.min(Math.round((weight / 25) * 100), 100);
    return { units, weight, score, courses };
  }, [courses]);

  return (
    <div className="p-8 lg:p-14 max-w-7xl mx-auto">
      <header className="flex items-center gap-6 mb-16">
        <div className="p-4 bg-indigo-600/20 rounded-3xl text-indigo-400"><Gauge size={40} /></div>
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tight text-white">Load Analysis</h1>
          <p className="text-slate-500 font-medium">Quantifying your semester's cognitive weight.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/5 rounded-[4rem] p-16 flex flex-col items-center">
          <div className="relative w-72 h-72 mb-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="18" fill="transparent" className="text-white/5" />
              <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="18" fill="transparent" 
                strokeDasharray={816} strokeDashoffset={816 - (816 * stats.score) / 100}
                className="text-indigo-500 transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-black italic">{stats.score}%</span>
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase text-center mt-2">Neural<br/>Load</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 w-full">
            <SmallStat icon={<Zap size={16}/>} label="Weighted" value={stats.weight.toFixed(1)} />
            <SmallStat icon={<Clock size={16}/>} label="Weekly Hrs" value={Math.round(stats.weight * 2.5)} />
            <SmallStat icon={<Brain size={16}/>} label="Core Hard" value={courses.filter(c => c.difficulty === 2).length} />
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
          {stats.courses.map((c, i) => (
            <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex justify-between items-center group hover:bg-white/[0.04] transition-all">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">{c.code}</span>
                  {c.difficulty === 2 && <Flame size={12} className="text-rose-500 animate-pulse" />}
                </div>
                <h4 className="font-bold text-sm text-white">{c.title}</h4>
              </div>
              <div className="text-right">
                <div className="text-xl font-black italic">{c.units}</div>
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
    <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
      <div className="flex justify-center text-indigo-400 mb-2">{icon}</div>
      <div className="text-xl font-black italic">{value}</div>
      <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{label}</div>
    </div>
  );
}
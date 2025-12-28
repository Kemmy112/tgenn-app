import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  Calendar, RefreshCcw, Sparkles, Plus, 
  ChevronRight, Bell, StickyNote, Activity, Target
} from 'lucide-react';

export default function Dashboard() {
  const { profile, setProfile } = useOutletContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [homework, setHomework] = useState("");

  const timetable = profile?.timetable_data;

  // Logic to handle Homework entry (Note-like format)
  const handleAddHomework = () => {
    if(!homework.trim()) return;
    console.log("Saving to local buffer/supabase later:", homework);
    alert(`Entry Logged: ${homework}`);
    setHomework("");
  };

  const generateTimetable = async () => {
    if (!profile?.academic_data?.length) return;
    setIsGenerating(true);
    const scored = [...profile.academic_data].sort((a, b) => (b.units * (b.difficulty === 2 ? 2 : 1)) - (a.units * (a.difficulty === 2 ? 2 : 1)));
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const newTable = {};
    days.forEach((day, i) => {
      newTable[day] = [scored[i % scored.length], scored[(i + 1) % scored.length]];
    });
    const { error } = await supabase.from('profiles').update({ timetable_data: newTable }).eq('id', profile.id);
    if (!error) setProfile({ ...profile, timetable_data: newTable });
    setIsGenerating(false);
  };

  return (
    <div className="p-8 lg:p-14 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}
      <header className="flex justify-between items-end mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
             <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
              Mission Control // {profile?.reg_no || 'AUTH_ACTIVE'}
            </span>
            <div className="h-[1px] w-12 bg-white/10"></div>
            <span className="text-[10px] font-mono text-slate-600">LRN_PRCS: 0.42</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
            System Active, <span className="text-indigo-500">{profile?.full_name?.split(' ')[0]}</span>
          </h1>
        </div>
        
        {/* LOG DATA BUTTON */}
        <button className="hidden lg:flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <Activity size={14} /> View Analytics
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT & CENTER: CORE ENGINE (8 Cols) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* NEURAL ENTRY (Homework/Notes) */}
          <section className="bg-white/[0.03] border border-white/5 p-8 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-indigo-500/10 transition-colors">
              <StickyNote size={120} strokeWidth={1} />
            </div>
            <h3 className="text-xl font-bold italic text-white mb-6 flex items-center gap-2">
              <Plus className="text-indigo-500" size={20} /> Neural Input
            </h3>
            <div className="relative">
              <textarea 
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="Do you have any homework today? Log it here..."
                className="w-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-6 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/30 min-h-[120px] transition-all"
              />
              <button 
                onClick={handleAddHomework}
                className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                Log Entry
              </button>
            </div>
          </section>

          {/* TIMETABLE SECTION */}
          <section className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-bold italic text-white flex items-center gap-3">
                <Calendar className="text-indigo-500" /> Adaptive Grid
              </h3>
              <button onClick={generateTimetable} className="p-3 text-slate-500 hover:text-white transition-colors">
                <RefreshCcw size={18} className={isGenerating ? "animate-spin" : ""} />
              </button>
            </div>

            {!timetable ? (
              <div className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/20 p-16 rounded-[4rem] text-center">
                <Sparkles className="mx-auto mb-6 text-indigo-500" size={48} />
                <h2 className="text-2xl font-bold mb-8 italic">Baseline grid missing. Generate?</h2>
                <button onClick={generateTimetable} disabled={isGenerating} className="bg-white text-black px-12 py-5 rounded-2xl font-black">
                  Initialize Sync
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(timetable).map(([day, sess]) => (
                  <div key={day} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/[0.04] transition-all">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-6 tracking-[0.2em]">{day}</h4>
                    {sess.map((s, i) => (
                      <div key={i} className="mb-4 last:mb-0 border-l-2 border-indigo-500/20 pl-3">
                        <div className="text-[10px] font-mono text-slate-600 font-bold uppercase">{s.code}</div>
                        <div className="text-sm font-bold text-white truncate">{s.title}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT: STRATEGIC INTELLIGENCE (4 Cols) */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* COURSE INVENTORY CARD */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8">
            <div className="flex justify-between items-center mb-8 px-2">
              <h3 className="text-xl font-bold italic text-white">Inventory</h3>
              <Target size={18} className="text-indigo-500" />
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {profile?.academic_data?.map((course, idx) => (
                <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center group">
                  <div>
                    <div className="font-mono text-indigo-400 font-bold text-xs">{course.code}</div>
                    <div className="text-[11px] text-slate-400 font-medium truncate max-w-[140px]">{course.title}</div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${course.difficulty === 1 ? 'border-emerald-500/20 text-emerald-400' : 'border-rose-500/20 text-rose-400'}`}>
                    {course.difficulty === 1 ? 'Easy' : 'Hard'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* LIVE FEED & NOTIFICATIONS */}
          <section className="bg-indigo-500/5 border border-indigo-500/10 p-8 rounded-[3rem]">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 flex items-center gap-2">
              <Bell size={14} /> Neural Feed
            </h4>
            <div className="space-y-8 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-indigo-500/10" />
              <FeedItem text="Baseline established. Timetable sync ready." time="04M AGO" active />
              <FeedItem text="Homework buffer active. Input detected." time="SYSTEM" />
              <FeedItem text="Pending Log: CSC 111 Friction review." time="2H AGO" />
            </div>
          </section>

          {/* QUICK PERFORMANCE PREVIEW */}
          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] flex items-center justify-between group cursor-pointer hover:bg-emerald-500/10 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
                <Target size={20} />
              </div>
              <span className="text-sm font-bold text-emerald-200 italic">Weekly Calibration</span>
            </div>
            <ChevronRight className="text-emerald-900 group-hover:text-emerald-400 transition-all" />
          </div>

        </div>
      </div>
    </div>
  );
}

// Sub-components specific to Dashboard
function FeedItem({ text, time, active }) {
  return (
    <div className="flex gap-4 relative">
      <div className={`w-3.5 h-3.5 rounded-full border-2 border-[#08080a] z-10 ${active ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
      <div className="space-y-1">
        <p className={`text-xs font-bold leading-snug ${active ? 'text-white' : 'text-slate-500'}`}>{text}</p>
        <div className="text-[8px] font-black text-slate-700 tracking-widest">{time}</div>
      </div>
    </div>
  );
}
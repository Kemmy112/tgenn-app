import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabase';
import ProfileModal from '../components/profilemodal';
import { 
  Calendar, RefreshCcw, Sparkles, Plus, 
  ChevronRight, Bell, StickyNote, Activity, Target, Zap, Loader2, Flame, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { profile, setProfile } = useOutletContext();
  const [isGenerating, setIsGenerating] = useState(false);
  
  
  // Homework Input States
  const [homework, setHomework] = useState("");
  const [targetCourse, setTargetCourse] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Friction States
  const [fricCourse, setFricCourse] = useState("");
  const [fricLevel, setFricLevel] = useState("");

  // 1. SYSTEM FEED STATE
  const [activeAlerts, setActiveAlerts] = useState([]);

  const timetable = profile?.timetable_data;

  // 2. FETCH DEADLINES ON COMPONENT MOUNT
  useEffect(() => {
    const fetchDeadlines = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('homework_logs')
        .select('course_code, task_description, due_date')
        .eq('user_id', profile.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (!error && data) {
        const now = new Date();
        const processedAlerts = data.map(log => {
          const dueDateObj = new Date(log.due_date);
          const diffHrs = (dueDateObj - now) / (1000 * 60 * 60);
          
          return {
            ...log,
            hoursLeft: diffHrs,
            severity: diffHrs < 24 ? 'CRITICAL' : diffHrs < 72 ? 'WARNING' : 'STABLE'
          };
        }).filter(alert => alert.hoursLeft > -5 && alert.hoursLeft < 120); // Show tasks due within 5 days

        setActiveAlerts(processedAlerts);
      }
    };

    fetchDeadlines();
  }, [profile?.id]);

  // --- LOGGING HOMEWORK ---
  const handleAddHomework = async () => {
    if (!homework.trim() || !targetCourse || !dueDate) {
        alert("Please fill all homework fields.");
        return;
    }
    
    const { error } = await supabase
      .from('homework_logs')
      .insert([{
        user_id: profile.id,
        course_code: targetCourse,
        task_description: homework,
        due_date: dueDate,
        status: 'pending'
      }]);

    if (!error) {
      setHomework("");
      setTargetCourse("");
      setDueDate("");
      alert("Task Registered in Neural Buffer.");
      // Refresh alerts locally after adding
      window.location.reload(); 
    } else {
      alert("Sync Failed: " + error.message);
    }
  };

  // --- LOGGING FRICTION ---
  const handleSyncFriction = async () => {
    if (!fricCourse || !fricLevel) return;

    const { error } = await supabase
      .from('friction_logs')
      .insert([{
        user_id: profile.id,
        course_code: fricCourse,
        friction_level: fricLevel
      }]);

    if (!error) {
      setFricCourse("");
      setFricLevel("");
      alert("Neural Recalibration Logged.");
    } else {
      alert("Friction Sync Failed: " + error.message);
    }
  };

  // --- CORE ENGINE: ADAPTIVE GRID GENERATION ---
  const generateTimetable = async () => {
    if (!profile?.academic_data?.length) return;
    setIsGenerating(true);

    const scored = [...profile.academic_data].sort((a, b) => {
      const weightA = Number(a.units) * (a.difficulty === 2 ? 2.5 : 1);
      const weightB = Number(b.units) * (b.difficulty === 2 ? 2.5 : 1);
      return weightB - weightA;
    });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const newTable = {};
    
    days.forEach((day, i) => {
      newTable[day] = [
        scored[i % scored.length], 
        scored[(i + 2) % scored.length]
      ];
    });

    const { error } = await supabase
      .from('profiles')
      .update({ timetable_data: newTable })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, timetable_data: newTable });
    }
    
    setTimeout(() => setIsGenerating(false), 800);
  };

  return (
    <div className="p-8 lg:p-14 max-w-[1600px] mx-auto">
      {/* HEADER SECTION */}

      <header className="flex justify-between items-end mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
              Mission Control // {profile?.reg_no || 'NODE_ACTIVE'}
            </span>
            <div className="h-[1px] w-12 bg-white/10"></div>
            <span className="text-[10px] font-mono text-slate-600 uppercase italic">Adaptive Link: Stable</span>
          </div>
          <h1 className="text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
            System Active, <span className="text-indigo-500">{profile?.full_name?.split(' ')[0]}</span>
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HOMEWORK INPUT CARD */}
            <section className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                <Plus size={16} /> Log Assignment
              </h3>
              <div className="space-y-4">
                <select 
                  value={targetCourse}
                  onChange={(e) => setTargetCourse(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-indigo-500"
                >
                  <option value="">Target Course...</option>
                  {profile?.academic_data?.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
                
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-indigo-500"
                />

                <textarea 
                  value={homework}
                  onChange={(e) => setHomework(e.target.value)}
                  placeholder="Task description..."
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs text-slate-300 min-h-[80px] focus:outline-none focus:border-indigo-500/30 transition-all"
                />
                
                <button 
                  onClick={handleAddHomework}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  Log Task
                </button>
              </div>
            </section>

            {/* FRICTION LOG CARD */}
            <section className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem]">
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
                <Zap size={16} /> Calibration
              </h3>
              <div className="space-y-4">
                <select 
                  value={fricCourse}
                  onChange={(e) => setFricCourse(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-amber-500"
                >
                  <option value="">Neural Node...</option>
                  {profile?.academic_data?.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>

                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Mid', 'High'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setFricLevel(level)}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all
                        ${fricLevel === level ? 'bg-amber-600 text-white' : 'bg-white/5 text-slate-500'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={handleSyncFriction}
                  disabled={!fricLevel || !fricCourse}
                  className="w-full bg-white text-black hover:bg-amber-500 hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-20"
                >
                  Sync Friction
                </button>
              </div>
            </section>
          </div>

          {/* ADAPTIVE GRID */}
          <section className="space-y-8">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-2xl font-bold italic text-white flex items-center gap-3">
                <Calendar className="text-indigo-500" /> Adaptive Grid
              </h3>
              <button onClick={generateTimetable} className="p-3 text-slate-500 hover:text-white transition-colors">
                <RefreshCcw size={18} className={isGenerating ? "animate-spin" : ""} />
              </button>
            </div>

            {!timetable || Object.keys(timetable).length === 0 ? (
              <div className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/20 p-16 rounded-[4rem] text-center">
                <Sparkles className="mx-auto mb-6 text-indigo-500" size={48} />
                <h2 className="text-2xl font-bold mb-8 italic text-white">Baseline grid missing.</h2>
                <button onClick={generateTimetable} disabled={isGenerating} className="bg-white text-black px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs">
                  {isGenerating ? 'PROCESSING...' : 'INITIALIZE SYNC'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <div key={day} className="bg-white/[0.02] border border-white/5 p-6 rounded-[2.5rem] hover:bg-white/[0.04] transition-all">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-6 tracking-[0.2em]">{day}</h4>
                    {timetable[day]?.map((s, i) => (
                      <div key={i} className="mb-4 last:mb-0 border-l-2 border-indigo-500/20 pl-3">
                        <div className="text-[10px] font-mono text-slate-600 font-bold uppercase">{s?.code || '---'}</div>
                        <div className="text-sm font-bold text-white truncate">{s?.title || 'No Session'}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: FEED & MATRIX */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* SYSTEM FEED */}
          <section className="bg-indigo-500/5 border border-indigo-500/10 p-8 rounded-[3rem]">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 flex items-center gap-2">
              <Bell size={14} /> System Feed
            </h4>
            <div className="space-y-4">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: alert.severity === 'CRITICAL' ? [1, 0.5, 1] : 1,
                    }}
                    transition={{ opacity: { repeat: Infinity, duration: 1.5 } }}
                    className={`p-4 rounded-2xl border transition-all ${
                      alert.severity === 'CRITICAL' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {alert.severity === 'CRITICAL' ? <Flame size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1">
                            {alert.severity} URGENCY
                          </p>
                          <span className="text-[8px] font-mono opacity-60">
                            {Math.round(alert.hoursLeft)}H
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white uppercase tracking-tight">
                          {alert.course_code}: {alert.task_description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl opacity-50">
                  <Zap size={16} className="text-emerald-400" />
                  <p className="text-xs font-bold text-slate-400">Neural system stable.</p>
                </div>
              )}
            </div>
          </section>

          {/* ACADEMIC MATRIX LIST */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8">
            <h3 className="text-xl font-bold italic text-white mb-8">Academic Matrix</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {profile?.academic_data?.map((course, idx) => (
                <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex justify-between items-center">
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
        </div>
      </div>
    </div>
  );
}
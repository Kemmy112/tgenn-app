import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  Calendar, RefreshCcw, Sparkles, Plus, 
  Bell, Zap, Loader2, Flame, AlertTriangle,
  Brain, X, MessageSquare, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { profile, setProfile } = useOutletContext();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Input States
  const [homework, setHomework] = useState("");
  const [targetCourse, setTargetCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  
  // Modal & Bot States
  const [isCalibOpen, setIsCalibOpen] = useState(false);
  const [calibSelections, setCalibSelections] = useState({});
  const [showBot, setShowBot] = useState(false);
  const [botMessage, setBotMessage] = useState("");

  const [activeAlerts, setActiveAlerts] = useState([]);
  const timetable = profile?.timetable_data;

  const streak = useMemo(() => profile?.timetable_data ? 3 : 0, [profile]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBotMessage(`Welcome back, ${profile?.full_name?.split(' ')[0]}! Ready for a neural reset?`);
      setShowBot(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [profile?.full_name]);

  useEffect(() => {
    const fetchDeadlines = async () => {
      if (!profile?.id) return;
      const { data, error } = await supabase
        .from('homework_logs')
        .select('id, course_code, task_description, due_date')
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
        }).filter(alert => alert.hoursLeft > -5 && alert.hoursLeft < 120);
        setActiveAlerts(processedAlerts);
      }
    };
    fetchDeadlines();
  }, [profile?.id]);

  // CORE ENGINE - CLEANED & DYNAMIC
  const generateTimetable = async () => {
    if (!profile?.academic_data?.length) return;
    setIsGenerating(true);

    const { data: frictionData } = await supabase
      .from('friction_logs')
      .select('course_code, friction_level')
      .eq('user_id', profile.id);

    const prefs = profile?.study_preferences || {};
    const peakZone = prefs.peak_period || "After Lectures";
    const baseDuration = Number(prefs.session_duration) || 60;

    const sorted = [...profile.academic_data].map(course => {
      const logs = frictionData?.filter(f => f.course_code === course.code) || [];
      // Use numeric values (1, 5, 9) directly
      const avgFriction = logs.length > 0 
        ? logs.reduce((sum, f) => sum + Number(f.friction_level || 5), 0) / logs.length 
        : (Number(course.difficulty) === 2 ? 7 : 3);

      let weight = (Number(course.difficulty) === 2 ? 8 : 4) + avgFriction;
      if (parseFloat(prefs.target_gpa) >= 3.8) weight += 2;

      return { ...course, neuralWeight: weight };
    }).sort((a, b) => b.neuralWeight - a.neuralWeight);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const newTable = {};
    const windows = { "Early Morning": 4, "After Lectures": 18, "Late Night": 23 };
    const startHour = windows[peakZone] || 18;

    days.forEach((day, i) => {
      const primary = sorted[i % sorted.length];
      const secondary = sorted[(i + 2) % sorted.length];

      newTable[day] = [primary, secondary].map((course, idx) => {
        const isPriority = idx === 0;
        const isStruggling = course.neuralWeight > 11;

        return {
          code: course.code,
          timeSlot: `${(startHour + (idx * 2)) % 24}:00`,
          duration: isStruggling ? baseDuration + 30 : baseDuration,
          isPriority,
          insight: isStruggling ? "🔥 HIGH FRICTION SHIELD" : "NEURAL PEAK"
        };
      });
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

  const handleBulkRecalibrate = async () => {
    if (Object.keys(calibSelections).length === 0) return;
    setIsGenerating(true);

    const logs = Object.entries(calibSelections).map(([code, level]) => ({
      user_id: profile.id,
      course_code: code,
      friction_level: Number(level) 
    }));

    const { error } = await supabase.from('friction_logs').insert(logs);
    if (!error) {
      await generateTimetable();
      setIsCalibOpen(false);
      setCalibSelections({});
    }
  };

  const handleAddHomework = async () => {
    if (!homework.trim() || !targetCourse || !dueDate) return alert("Fill all fields");
    const { error } = await supabase.from('homework_logs').insert([{
      user_id: profile.id, course_code: targetCourse, task_description: homework, due_date: dueDate, status: 'pending'
    }]);
    if (!error) { setHomework(""); setTargetCourse(""); setDueDate(""); alert("Task Registered."); }
  };

  const handleCompleteTask = async (taskId) => {
    const { error } = await supabase.from('homework_logs').update({ status: 'completed' }).eq('id', taskId);
    if (!error) setActiveAlerts(prev => prev.filter(alert => alert.id !== taskId));
  };

  return (
    <div className="p-4 md:p-8 lg:p-14 max-w-[1600px] mx-auto min-h-screen relative overflow-x-hidden">
      
      {/* 5. THE RECALIBRATION MODAL */}
      <AnimatePresence>
        {isCalibOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-6"
          >
            <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
              <button onClick={() => setIsCalibOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
              <h2 className="text-2xl md:text-3xl font-black italic uppercase text-white mb-2">Neural Recalibration</h2>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6 md:mb-10">Sync academic friction levels</p>
              
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {profile?.academic_data?.map(course => (
                  <div key={course.code} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 gap-4">
                    <span className="font-bold text-white text-sm">{course.code}</span>
                    <div className="flex gap-2">
                      {[ { label: 'Low', val: 1 }, { label: 'Mid', val: 5 }, { label: 'High', val: 9 } ].map((opt) => (
                        <button 
                          key={opt.val}
                          onClick={() => setCalibSelections(prev => ({ ...prev, [course.code]: opt.val }))}
                          className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all 
                            ${calibSelections[course.code] === opt.val ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleBulkRecalibrate} className="w-full mt-6 md:mt-10 py-4 md:py-5 bg-white text-black rounded-xl md:rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-indigo-500 hover:text-white transition-all">
                Execute Re-alignment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6. TGEN GHOST BOT */}
      <AnimatePresence>
        {showBot && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90] w-[calc(100%-3rem)] md:w-80"
          >
            <div className="bg-indigo-600 p-6 rounded-3xl shadow-2xl relative">
              <button onClick={() => setShowBot(false)} className="absolute top-4 right-4 text-white/50"><X size={14}/></button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white rounded-full text-indigo-600 animate-bounce"><Brain size={18}/></div>
                <span className="text-[10px] font-black uppercase text-white/80">TGen Assistant</span>
              </div>
              <p className="text-sm font-bold text-white mb-4 leading-relaxed">{botMessage}</p>
              <button onClick={() => { setShowBot(false); setIsCalibOpen(true); }} className="w-full py-3 bg-black/20 hover:bg-black/40 text-white rounded-xl text-[10px] font-black uppercase transition-all">
                Let's Calibrate
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 md:mb-16">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[9px] md:text-[10px] font-bold tracking-[0.2em] uppercase">
              Mission Control // {profile?.reg_no || 'NODE_ACTIVE'}
            </span>
            <div className="hidden md:block h-[1px] w-12 bg-white/10"></div>
            <div className="flex items-center gap-2 text-amber-500">
               <Flame size={14} fill="currentColor"/>
               <span className="text-[10px] font-black uppercase">{streak} Day Streak</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter leading-none">
            System Active, <span className="text-indigo-500">{profile?.full_name?.split(' ')[0]}</span>
          </h1>
        </div>
        <button onClick={() => setIsCalibOpen(true)} className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-indigo-600 transition-all group">
          <Zap size={18} className="group-hover:fill-current"/>
          <span className="text-xs font-black uppercase tracking-widest">Recalibrate Grid</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* MAIN FEED (Timetable) */}
        <div className="lg:col-span-8 space-y-12">
          <section className="space-y-8">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-xl md:text-2xl font-bold italic text-white flex items-center gap-3">
                <Calendar className="text-indigo-500" /> Weekly Matrix
              </h3>
              <button onClick={() => generateTimetable()} className="p-3 text-slate-500 hover:text-white transition-colors">
                <RefreshCcw size={18} className={isGenerating ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                <div key={day} className="bg-white/[0.02] border border-white/5 p-5 md:p-6 rounded-[2rem] relative group shadow-2xl">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase mb-4 md:mb-6 tracking-[0.2em]">{day}</h4>
                  {timetable?.[day]?.map((s, i) => (
                    <div key={i} className={`mb-4 md:mb-6 last:mb-0 border-l-2 pl-3 ${s.isPriority ? 'border-indigo-500' : 'border-white/10'} ${s.insight.includes("🔥") ? 'animate-pulse' : ''}`}>
                      <div className="text-[8px] md:text-[9px] font-mono text-slate-500 font-bold uppercase">{s?.timeSlot} // {s?.duration}m</div>
                      <div className="text-xs md:text-sm font-black text-white truncate italic uppercase leading-tight">{s?.code}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          {/* TASK LOGGING */}
          <section className="bg-white/[0.03] border border-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] max-w-xl">
             <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2"><Plus size={16} /> Log Task</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
               <select value={targetCourse} onChange={(e) => setTargetCourse(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none">
                 <option value="">Course...</option>
                 {profile?.academic_data?.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
               </select>
               <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none" />
             </div>
             <textarea value={homework} onChange={(e) => setHomework(e.target.value)} placeholder="What needs to be done?" className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-xs text-slate-300 min-h-[80px] mb-4 outline-none" />
             <button onClick={handleAddHomework} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 md:py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Add to Feed</button>
          </section>
        </div>

        {/* SIDEBAR FEED */}
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-indigo-500/5 border border-indigo-500/10 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem]">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 flex items-center gap-2"><Bell size={14} /> System Feed</h4>
            <div className="space-y-4">
              {activeAlerts.map((alert, i) => (
                <motion.div key={alert.id || i} animate={{ opacity: alert.severity === 'CRITICAL' ? [1, 0.5, 1] : 1 }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`group p-4 rounded-2xl border flex items-center justify-between transition-all ${alert.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                  <div className="flex-1">
                    <p className="text-[8px] md:text-[9px] font-black uppercase mb-1">{alert.severity}</p>
                    <p className="text-[11px] md:text-xs font-bold text-white uppercase">{alert.course_code}: {alert.task_description}</p>
                  </div>
                  <button onClick={() => handleCompleteTask(alert.id)} className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500 hover:text-white transition-all"><Zap size={14}/></button>
                </motion.div>
              ))}
              {!activeAlerts.length && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl opacity-50 flex items-center gap-3">
                  <Zap size={16} className="text-emerald-400" />
                  <p className="text-xs font-bold text-slate-400 uppercase">All clear.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { 
  Zap, User, BookOpen, Target, Settings2, 
  ChevronRight, ChevronLeft, Check, Plus, Trash2, Camera, Loader2 
} from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // --- COMPOSITE STATE ---
  const [studentInfo, setStudentInfo] = useState({
    regNo: '',
    courseOfStudy: '',
    level: '',
    semester: '1st',
    avatarUrl: null
  });

  const [courses, setCourses] = useState([
    // difficulty 1 = Easy, 2 = Hard. friction 1.0 = Baseline
    { id: Date.now(), code: '', title: '', units: '', difficulty: 1, friction: 1.0 }
  ]);

  const [goals, setGoals] = useState({
    targetGpa: '4.0',
    motivation: 'Mastery',
    weeklyHours: '20'
  });

  const [preferences, setPreferences] = useState({
    sessionLength: '45',
    preferredPeriod: 'Evening', 
    pushIntensity: 'Balanced'
  });

  useEffect(() => {
    const initUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    initUser();
  }, []);

  // --- FILE UPLOAD LOGIC ---
  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setStudentInfo(prev => ({ ...prev, avatarUrl: urlData.publicUrl }));
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- DATABASE SYNC ---
  const saveProgress = async (isFinal = false) => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        reg_no: studentInfo.regNo,
        course_of_study: studentInfo.courseOfStudy,
        level_of_study: studentInfo.level,
        semester: studentInfo.semester,
        avatar_url: studentInfo.avatarUrl,
        academic_data: courses,
        study_preferences: { ...goals, ...preferences },
        onboarding_completed: isFinal,
        last_completed_step: step,
        updated_at: new Date()
      })
      .eq('id', user.id);

    setLoading(false);
    if (error) {
      alert(error.message);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const success = await saveProgress(step === 4);
    if (success) {
      if (step === 4) navigate('/dashboard');
      else setStep(s => s + 1);
    }
  };

  const totalUnits = courses.reduce((acc, curr) => acc + (Number(curr.units) || 0), 0);

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl z-10">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Zap size={24} className="fill-current text-white" />
            </div>
          </div>
          <h1 className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Phase 0{step}</h1>
        </header>

        <div className="flex items-center gap-3 mb-16 justify-center">
          {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 
                ${step >= i ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'border-white/10 text-slate-600'}`}>
                {step > i ? <Check size={20} strokeWidth={3} /> : <span className="text-lg font-bold">{i}</span>}
              </div>
              {i < 4 && <div className={`h-[2px] w-8 md:w-12 transition-colors duration-500 ${step > i ? 'bg-indigo-600' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <Phase1StudentInfo 
              data={studentInfo} 
              setData={setStudentInfo} 
              onNext={handleNext} 
              loading={loading} 
              handleFileUpload={handleFileUpload}
            />
          )}
          {step === 2 && (
            <Phase2Courses 
              courses={courses} 
              setCourses={setCourses} 
              totalUnits={totalUnits} 
              onNext={handleNext} 
              onPrev={() => setStep(1)} 
              loading={loading} 
            />
          )}
          {step === 3 && (
            <Phase3Goals 
              data={goals} 
              setData={setGoals} 
              onNext={handleNext} 
              onPrev={() => setStep(2)} 
              loading={loading} 
            />
          )}
          {step === 4 && (
            <Phase4Preferences 
              data={preferences} 
              setData={setPreferences} 
              onNext={handleNext} 
              onPrev={() => setStep(3)} 
              loading={loading} 
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- PHASE 1 ---
function Phase1StudentInfo({ data, setData, onNext, loading, handleFileUpload }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/[0.03] border border-white/10 p-8 md:p-12 rounded-[3rem] backdrop-blur-3xl shadow-2xl">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><User size={28} /></div>
        <h2 className="text-3xl font-bold italic tracking-tight">Identity & Level</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] hover:border-indigo-500/50 transition-all group cursor-pointer relative overflow-hidden bg-white/5 h-64">
          {data.avatarUrl ? (
            <img src={data.avatarUrl} alt="Profile" className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="text-slate-600 group-hover:text-indigo-400 transition-colors mb-2" size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">
                {loading ? 'Processing...' : 'Upload Photo'}
              </span>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleFileUpload} disabled={loading} className="absolute inset-0 opacity-0 cursor-pointer" />
        </div>

        <div className="space-y-6">
          <InputGroup label="Reg Number (Optional)" value={data.regNo} onChange={(v) => setData({...data, regNo: v})} placeholder="2024/0001" />
          <InputGroup label="Course of Study" value={data.courseOfStudy} onChange={(v) => setData({...data, courseOfStudy: v})} placeholder="Computer Science" />
        </div>
        
        <InputGroup label="Level of Study" value={data.level} onChange={(v) => setData({...data, level: v})} placeholder="300 Level" />
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Semester</label>
          <div className="flex gap-4">
            {['1st', '2nd'].map(sem => (
              <button 
                key={sem}
                type="button"
                onClick={() => setData({...data, semester: sem})}
                className={`flex-1 py-4 rounded-2xl font-bold border transition-all ${data.semester === sem ? 'bg-indigo-600 border-indigo-500 shadow-lg' : 'bg-white/5 border-transparent text-slate-500'}`}
              >
                {sem} Semester
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button onClick={onNext} disabled={loading} className="bg-white text-black px-12 py-5 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all flex items-center gap-3">
          {loading ? <Loader2 className="animate-spin" /> : <>Phase 02 <ChevronRight size={20} /></>}
        </button>
      </div>
    </motion.div>
  );
}

// --- PHASE 2 ---
function Phase2Courses({ courses, setCourses, totalUnits, onNext, onPrev, loading }) {
  const addCourse = () => setCourses([...courses, { id: Date.now(), code: '', title: '', units: '', difficulty: 1, friction: 1.0 }]);
  const updateCourse = (id, field, val) => setCourses(courses.map(c => c.id === id ? {...c, [field]: val} : c));
  const removeCourse = (id) => courses.length > 1 && setCourses(courses.filter(c => c.id !== id));

  // --- SMART SCAN LOGIC ---
  const autoDetectDifficulty = (id, title) => {
    if (!title) return;
    
    const hardKeywords = [
      'math', 'physic', 'chem', 'bio', 'eng', 'quant', 'thermo', 
      'mechanic', 'calculus', 'circuit', 'data structure', 'algorithm',
      'organic', 'law', 'medicine', 'anatomy', 'advanced', 'complex'
    ];
    
    const lowercaseTitle = title.toLowerCase();
    const isHard = hardKeywords.some(word => lowercaseTitle.includes(word));
    
    if (isHard) {
      updateCourse(id, 'difficulty', 2);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.03] border border-white/10 p-8 md:p-12 rounded-[3rem] backdrop-blur-3xl">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><BookOpen size={28} /></div>
          <div>
            <h2 className="text-3xl font-bold italic tracking-tight text-white">Academic Inventory</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">AI will suggest difficulty based on title</p>
          </div>
        </div>
        <div className="text-right px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full">
          <span className="text-[10px] font-black uppercase text-indigo-400 block tracking-widest">Total Units</span>
          <span className="text-xl font-mono font-bold text-white">{totalUnits}</span>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
        {courses.map((c) => (
          <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-3xl items-center">
            <div className="md:col-span-2">
              <input placeholder="Code" value={c.code} onChange={(e) => updateCourse(c.id, 'code', e.target.value)} className="w-full bg-white/5 p-4 rounded-xl outline-none border border-transparent focus:border-indigo-500 font-mono uppercase text-sm text-white" />
            </div>
            
            <div className="md:col-span-4">
              <input 
                placeholder="Course Title" 
                value={c.title} 
                onChange={(e) => updateCourse(c.id, 'title', e.target.value)} 
                // TRIGER SMART SCAN ON BLUR (When user clicks away)
                onBlur={(e) => autoDetectDifficulty(c.id, e.target.value)}
                className="w-full bg-white/5 p-4 rounded-xl outline-none border border-transparent focus:border-indigo-500 text-sm text-white" 
              />
            </div>

            <div className="md:col-span-2">
              <input 
                type="number" 
                placeholder="Units" 
                value={c.units} 
                onChange={(e) => {
                  updateCourse(c.id, 'units', e.target.value);
                  // High units auto-suggest Hard
                  if (Number(e.target.value) >= 4) updateCourse(c.id, 'difficulty', 2);
                }} 
                className="w-full bg-white/5 p-4 rounded-xl outline-none border border-transparent focus:border-indigo-500 text-sm text-white" 
              />
            </div>

            <div className="md:col-span-3">
              <button 
                type="button"
                onClick={() => updateCourse(c.id, 'difficulty', c.difficulty === 1 ? 2 : 1)}
                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                  c.difficulty === 1 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                {c.difficulty === 1 ? '⚡ Suggested: Easy' : '🔥 Suggested: Hard'}
              </button>
            </div>

            <div className="md:col-span-1 flex justify-center">
              <button onClick={() => removeCourse(c.id)} className="text-slate-700 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addCourse} className="w-full py-4 mt-6 border-2 border-dashed border-white/10 rounded-2xl text-slate-600 font-bold flex items-center justify-center gap-2 hover:bg-white/5 hover:text-slate-400 transition-all text-sm">
        <Plus size={18} /> Add Course
      </button>

      <div className="mt-12 flex justify-between">
        <button onClick={onPrev} className="text-slate-500 font-black tracking-widest uppercase text-xs flex items-center gap-2"> <ChevronLeft size={16}/> Back </button>
        <button onClick={onNext} disabled={loading} className="bg-indigo-600 px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-600/20 text-white">Phase 03</button>
      </div>
    </motion.div>
  );
}

// --- PHASE 3 ---
function Phase3Goals({ data, setData, onNext, onPrev, loading }) {
  const motivations = ['Mastery', 'Scholarship', 'Graduation', 'Growth'];
  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.03] border border-white/10 p-12 rounded-[3rem]">
      <div className="flex items-center gap-4 mb-10 text-emerald-400">
        <Target size={32} />
        <h2 className="text-3xl font-bold italic">Ambitions & Goals</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4 text-center">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Target Semester GPA</label>
          <div className="text-6xl font-black text-emerald-400 py-4">{data.targetGpa}</div>
          <input type="range" min="1.0" max="5.0" step="0.1" value={data.targetGpa} onChange={(e) => setData({...data, targetGpa: e.target.value})} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Primary Motivation</label>
          <div className="grid grid-cols-2 gap-3">
            {motivations.map(m => (
              <button key={m} type="button" onClick={() => setData({...data, motivation: m})} className={`py-4 rounded-2xl border font-bold transition-all ${data.motivation === m ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-transparent text-slate-500'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-12 flex justify-between pt-8 border-t border-white/5">
        <button onClick={onPrev} className="text-slate-500 font-bold uppercase tracking-widest text-xs">Back</button>
        <button onClick={onNext} className="bg-white text-black px-10 py-4 rounded-2xl font-black">Final Phase</button>
      </div>
    </motion.div>
  );
}

// --- PHASE 4 ---
function Phase4Preferences({ data, setData, onNext, onPrev, loading }) {
  const periods = ['Morning', 'Evening', 'Crash'];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.03] border border-white/10 p-12 rounded-[3rem]">
      <div className="flex items-center gap-4 mb-10 text-indigo-400">
        <Settings2 size={32} />
        <h2 className="text-3xl font-bold italic">User Preferences</h2>
      </div>
      <div className="space-y-10">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-4">Prime Study Window</label>
          <div className="grid grid-cols-3 gap-4">
            {periods.map(p => (
              <button key={p} type="button" onClick={() => setData({...data, preferredPeriod: p})} className={`py-6 rounded-[2rem] border transition-all flex flex-col items-center gap-2 ${data.preferredPeriod === p ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-white/5 border-transparent text-slate-500'}`}>
                <span className="font-bold text-lg">{p}</span>
                <span className="text-[10px] uppercase opacity-50 tracking-tighter italic">{p === 'Crash' ? 'Late night' : 'Peak energy'}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-4">Base Session Length (Minutes)</label>
          <div className="flex justify-between px-2 text-indigo-400 font-black font-mono">
            <span>25m</span>
            <span>{data.sessionLength}m</span>
            <span>90m</span>
          </div>
          <input type="range" min="25" max="90" step="5" value={data.sessionLength} onChange={(e) => setData({...data, sessionLength: e.target.value})} className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400" />
        </div>
      </div>
      <div className="mt-12 flex justify-between">
        <button onClick={onPrev} className="text-slate-500 font-bold uppercase tracking-widest text-xs">Back</button>
        <button onClick={onNext} className="bg-indigo-600 px-12 py-5 rounded-2xl font-black text-xl shadow-xl shadow-indigo-600/20">Initialize Dashboard</button>
      </div>
    </motion.div>
  );
}

// --- REUSABLE INPUT ---
function InputGroup({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-indigo-500 transition-all font-medium text-white placeholder:text-slate-700"
      />
    </div>
  );
}
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

  // --- 1. STATE INITIALIZATION (Aligned with Dashboard) ---
  const [studentInfo, setStudentInfo] = useState({
    regNo: '',
    courseOfStudy: '',
    level: '',
    semester: '1st',
    avatarUrl: null
  });

  const [courses, setCourses] = useState([
    { id: Date.now(), code: '', title: '', units: '', difficulty: 1, friction: 5 }
  ]);

  const [preferences, setPreferences] = useState({
    targetGpa: '4.0',
    peak_period: 'After Lectures', // Options: Early Morning, After Lectures, Late Night
    session_duration: '60'
  });

  useEffect(() => {
    const initUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    initUser();
  }, []);

  // --- 2. FILE UPLOAD LOGIC ---
  const handleFileUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) return alert("File exceeds 2MB limit.");

      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
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

  // --- 3. DATABASE SYNC ---
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
        study_preferences: preferences, // plural column name check
        onboarding_completed: isFinal,
        updated_at: new Date()
      })
      .eq('id', user.id);

    setLoading(false);
    if (error) {
      alert("ENGINE ERROR: " + error.message);
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
    if (!studentInfo.regNo.trim()) {
      alert("IDENTITY ERROR: Registration Number is required for Neural Link.");
      return;
    }
    if (!studentInfo.courseOfStudy.trim()) {
      alert("IDENTITY ERROR: Course of Study is required.");
      return;
    }
    if (!studentInfo.level.trim()){
      alert("IDENTITY ERROR: Level is required for Neural Link.");
      return;
    }
  }
    const success = await saveProgress(step === 4);
    if (success) {
      if (step === 4) navigate('/dashboard');
      else setStep(s => s + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center p-6 md:p-12 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-4xl z-10">
        <header className="text-center mb-10">
          <PhaseIndicator currentStep={step} />
        </header>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <Phase1 data={studentInfo} setData={setStudentInfo} onNext={handleNext} loading={loading} handleFileUpload={handleFileUpload} />
          )}
          {step === 2 && (
            <Phase2 courses={courses} setCourses={setCourses} onNext={handleNext} onPrev={() => setStep(1)} />
          )}
          {step === 3 && (
            <Phase3 data={preferences} setData={setPreferences} onNext={handleNext} onPrev={() => setStep(2)} />
          )}
          {step === 4 && (
            <Phase4 onNext={handleNext} onPrev={() => setStep(3)} loading={loading} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function PhaseIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-3 mb-16 justify-center">
      {[1, 2, 3, 4].map((i) => (
        <React.Fragment key={i}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 
            ${currentStep >= i ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'border-white/10 text-slate-600'}`}>
            {currentStep > i ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-black">{i}</span>}
          </div>
          {i < 4 && <div className={`h-[1px] w-8 md:w-12 transition-colors duration-500 ${currentStep > i ? 'bg-indigo-600' : 'bg-white/10'}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function Phase1({ data, setData, onNext, loading, handleFileUpload }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
        <User className="text-indigo-400" /> Identity Initialization
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="relative group aspect-square max-h-[240px] bg-white/5 border-2 border-dashed border-white/10 rounded-3xl overflow-hidden flex flex-col items-center justify-center hover:border-indigo-500/50 transition-all cursor-pointer">
          {data.avatarUrl ? <img src={data.avatarUrl} className="w-full h-full object-cover" alt="Avatar" /> : (
            <>
              <Camera className="text-slate-500 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{loading ? 'Uploading...' : 'Upload Avatar'}</span>
            </>
          )}
          <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
        </div>
        <div className="space-y-4">
          <InputField label="Reg No" value={data.regNo} onChange={(v) => setData({...data, regNo: v})} placeholder="e.g. RUO21O22OOO1" />
          <InputField label="Course" value={data.courseOfStudy} onChange={(v) => setData({...data, courseOfStudy: v})} placeholder="e.g. Computer Science" />
          <InputField label="Level" value={data.level} onChange={(v) => setData({...data, level: v})} placeholder="e.g. 300L" />
        </div>
      </div>
      <div className="mt-10 flex justify-end">
        <button onClick={onNext} className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-400 hover:text-white transition-all">Next Phase <ChevronRight size={18} /></button>
      </div>
    </motion.div>
  );
}

function Phase2({ courses, setCourses, onNext, onPrev }) {

  const addCourse = () => setCourses([...courses, { id: Date.now(), code: '', title: '', units: '', difficulty: 1, friction: 1.0 }]);

  const updateCourse = (id, field, val) => setCourses(courses.map(c => c.id === id ? {...c, [field]: val} : c));

  const removeCourse = (id) => courses.length > 1 && setCourses(courses.filter(c => c.id !== id));



  // --- THE "NEURAL" SENSOR ---

  const autoDetectDifficulty = (id, title) => {

    if (!title) return;

    const hardKeywords = [

      'math', 'statistics', 'chem', 'bio', 'eng', 'quant', 'intelligence',

      'mechanic', 'data structure', 'algorithm',

      'organic', 'law', 'medicine', 'anatomy', 'advanced', 'complex', 'stochastic'

    ];

   

    const isHard = hardKeywords.some(word => title.toLowerCase().includes(word));

    if (isHard) {

      updateCourse(id, 'difficulty', 2); // Auto-set to Hard

    }

  };



  const totalUnits = courses.reduce((acc, curr) => acc + (Number(curr.units) || 0), 0);



  return (

    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem]">

      <div className="flex justify-between items-center mb-8">

        <h2 className="text-2xl font-bold flex items-center gap-3"><BookOpen className="text-indigo-400" /> Academic Matrix</h2>

        <div className="px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">

          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Units: {totalUnits}</span>

        </div>

      </div>



      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">

        {courses.map(c => (

          <div key={c.id} className="grid grid-cols-12 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 items-center group">

            <div className="col-span-2">

              <input placeholder="Code" value={c.code} onChange={(e) => updateCourse(c.id, 'code', e.target.value)} className="w-full bg-transparent outline-none font-mono text-sm uppercase placeholder:text-slate-700" />

            </div>

           

            <div className="col-span-5">

              <input

                placeholder="Course Title"

                value={c.title.toUpperCase()}

                onChange={(e) => updateCourse(c.id, 'title', e.target.value)}

                onBlur={(e) => autoDetectDifficulty(c.id, e.target.value)} // Trigger scan when user finishes typing

                className="w-full bg-transparent outline-none text-sm placeholder:text-slate-700"

              />

            </div>



            <div className="col-span-2">

              <input

                type="number"

                placeholder="Units"

                value={c.units}

                onChange={(e) => updateCourse(c.id, 'units', e.target.value)}

                className="w-full bg-transparent outline-none text-sm font-bold text-indigo-400 placeholder:text-slate-700"

              />

            </div>



            <div className="col-span-2">

              <button

                onClick={() => updateCourse(c.id, 'difficulty', c.difficulty === 1 ? 2 : 1)}

                className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${

                  c.difficulty === 1

                  ? 'text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10'

                  : 'text-rose-400 border-rose-400/20 bg-rose-400/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]'

                }`}

              >

                {c.difficulty === 1 ? '⚡ Easy' : '🔥 Hard'}

              </button>

            </div>



            <div className="col-span-1 flex justify-end">

              <button onClick={() => removeCourse(c.id)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">

                <Trash2 size={14} />

              </button>

            </div>

          </div>

        ))}

      </div>



      <button onClick={addCourse} className="w-full mt-4 py-3 border border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2 text-sm">

        <Plus size={16} /> Add New Entry

      </button>



      <div className="mt-10 flex justify-between">

        <button onClick={onPrev} className="text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">Back</button>

        <button onClick={onNext} className="bg-indigo-600 px-10 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform">Next Phase</button>

      </div>

    </motion.div>

  );

}

// function Phase2({ courses, setCourses, onNext, onPrev }) {

//   const addCourse = () => setCourses([...courses, { id: Date.now(), code: '', title: '', units: '', difficulty: 1, friction: 1.0 }]);

//   const updateCourse = (id, field, val) => setCourses(courses.map(c => c.id === id ? {...c, [field]: val} : c));

//   const removeCourse = (id) => courses.length > 1 && setCourses(courses.filter(c => c.id !== id));



//   // --- THE "NEURAL" SENSOR ---

//   const autoDetectDifficulty = (id, title) => {

//     if (!title) return;

//     const hardKeywords = [

//       'math', 'physic', 'chem', 'bio', 'eng', 'quant', 'thermo',

//       'mechanic', 'calculus', 'circuit', 'data structure', 'algorithm',

//       'organic', 'law', 'medicine', 'anatomy', 'advanced', 'complex', 'stochastic'

//     ];

   

//     const isHard = hardKeywords.some(word => title.toLowerCase().includes(word));

//     if (isHard) {

//       updateCourse(id, 'difficulty', 2); // Auto-set to Hard

//     }

//   };



//   const totalUnits = courses.reduce((acc, curr) => acc + (Number(curr.units) || 0), 0);



//   return (

//     <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem]">

//       <div className="flex justify-between items-center mb-8">

//         <h2 className="text-2xl font-bold flex items-center gap-3"><BookOpen className="text-indigo-400" /> Academic Matrix</h2>

//         <div className="px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">

//           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Units: {totalUnits}</span>

//         </div>

//       </div>



//       <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">

//         {courses.map(c => (

//           <div key={c.id} className="grid grid-cols-12 gap-3 bg-white/5 p-4 rounded-2xl border border-white/5 items-center group">

//             <div className="col-span-2">

//               <input placeholder="Code" value={c.code} onChange={(e) => updateCourse(c.id, 'code', e.target.value)} className="w-full bg-transparent outline-none font-mono text-sm uppercase placeholder:text-slate-700" />

//             </div>

           

//             <div className="col-span-5">

//               <input

//                 placeholder="Course Title"

//                 value={c.title}

//                 onChange={(e) => updateCourse(c.id, 'title', e.target.value)}

//                 onBlur={(e) => autoDetectDifficulty(c.id, e.target.value)} // Trigger scan when user finishes typing

//                 className="w-full bg-transparent outline-none text-sm placeholder:text-slate-700"

//               />

//             </div>



//             <div className="col-span-2">

//               <input

//                 type="number"

//                 placeholder="Units"

//                 value={c.units}

//                 onChange={(e) => updateCourse(c.id, 'units', e.target.value)}

//                 className="w-full bg-transparent outline-none text-sm font-bold text-indigo-400 placeholder:text-slate-700"

//               />

//             </div>



//             <div className="col-span-2">

//               <button

//                 onClick={() => updateCourse(c.id, 'difficulty', c.difficulty === 1 ? 2 : 1)}

//                 className={`w-full py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border transition-all ${

//                   c.difficulty === 1

//                   ? 'text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10'

//                   : 'text-rose-400 border-rose-400/20 bg-rose-400/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]'

//                 }`}

//               >

//                 {c.difficulty === 1 ? '⚡ Easy' : '🔥 Hard'}

//               </button>

//             </div>



//             <div className="col-span-1 flex justify-end">

//               <button onClick={() => removeCourse(c.id)} className="text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">

//                 <Trash2 size={14} />

//               </button>

//             </div>

//           </div>

//         ))}

//       </div>



//       <button onClick={addCourse} className="w-full mt-4 py-3 border border-dashed border-white/10 rounded-xl text-slate-500 hover:text-white hover:border-indigo-500/50 transition-all flex items-center justify-center gap-2 text-sm">

//         <Plus size={16} /> Add New Entry

//       </button>



//       <div className="mt-10 flex justify-between">

//         <button onClick={onPrev} className="text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-colors">Back</button>

//         <button onClick={onNext} className="bg-indigo-600 px-10 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-transform">Next Phase</button>

//       </div>

//     </motion.div>

//   );

// }

function Phase3({ data, setData, onNext, onPrev }) {
  const periods = [
    { id: 'Early Morning', time: '04:00 - 07:00' },
    { id: 'After Lectures', time: '18:00 - 21:00' },
    { id: 'Late Night', time: '23:00 - 02:00' }
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.02] border border-white/10 p-10 rounded-[2.5rem]">
      <div className="text-center mb-10">
        <Target className="mx-auto text-indigo-400 mb-4" size={32} />
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Neural Calibration</h2>
      </div>

      <div className="grid gap-6">
        {/* GPA SLIDER */}
        <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target GPA</label>
            <span className="text-2xl font-black text-indigo-400 italic">{data.targetGpa}</span>
          </div>
          <input type="range" min="1.0" max="5.0" step="0.1" value={data.targetGpa} onChange={(e) => setData({...data, targetGpa: e.target.value})} className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
        </div>

        {/* WINDOW SELECTOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {periods.map((p) => (
            <button key={p.id} onClick={() => setData({...data, peak_period: p.id})} className={`p-4 rounded-2xl border transition-all text-left ${data.peak_period === p.id ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'border-white/5 bg-white/5 opacity-50'}`}>
              <div className="text-[9px] font-black uppercase text-indigo-400 mb-1">{p.id}</div>
              <div className="text-xs font-bold text-white">{p.time}</div>
            </button>
          ))}
        </div>

        {/* DURATION SELECTOR */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-4">Study Session Length</label>
          <div className="grid grid-cols-4 gap-4">
            {['45', '60', '90', '120'].map((mins) => (
              <button key={mins} onClick={() => setData({...data, session_duration: mins})} className={`py-3 rounded-xl font-bold text-xs transition-all ${data.session_duration === mins ? 'bg-white text-black' : 'bg-white/5 text-slate-500'}`}>
                {mins}m
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-between items-center">
        <button onClick={onPrev} className="text-slate-500 font-bold uppercase text-xs">Back</button>
        <button onClick={onNext} className="bg-white text-black px-10 py-3 rounded-xl font-bold hover:bg-indigo-400 hover:text-white transition-all">Finalize Sync</button>
      </div>
    </motion.div>
  );
}

function Phase4({ onNext, onPrev, loading }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-indigo-600 p-12 rounded-[3rem] text-center shadow-[0_0_50px_rgba(79,70,229,0.3)]">
      <Zap className="mx-auto mb-6 animate-pulse" size={48} />
      <h2 className="text-4xl font-black mb-4 uppercase italic">Ready for Launch</h2>
      <p className="text-indigo-100 mb-10 opacity-80 max-w-md mx-auto">Neural engine calibration complete. Your study windows and GPA protection shields are active.</p>
      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        <button onClick={onNext} disabled={loading} className="bg-white text-indigo-600 py-5 rounded-2xl font-black text-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-3">
          {loading ? <Loader2 className="animate-spin" /> : 'BOOT DASHBOARD'}
        </button>
        <button onClick={onPrev} className="text-indigo-200 text-sm font-bold opacity-50 uppercase">Re-calibrate</button>
      </div>
    </motion.div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-white/5 border border-white/5 rounded-xl p-3 outline-none focus:border-indigo-500 transition-all text-sm" />
    </div>
  );
}
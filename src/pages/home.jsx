import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Cpu, Zap, Activity, BookOpen } from "lucide-react";

const Homepage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Neural Intake",
      desc: "Input your courses and constraints. TGEN parses your syllabus to understand credit loads and difficulty spikes.",
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
    },
    {
      title: "Tactical Synthesis",
      desc: "Our engine generates an optimized timetable, balancing high-intensity study blocks with recovery periods.",
      icon: <Cpu className="w-6 h-6 text-emerald-400" />,
    },
    {
      title: "Performance Pivot",
      desc: "TGEN tracks your grades and focus levels, automatically reshaping your schedule to attack your weaknesses.",
      icon: <Activity className="w-6 h-6 text-rose-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-200 selection:bg-indigo-500/30 font-sans">
      {/* --- BACKGROUND LAYER --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* --- NAV BAR --- */}
      <nav className="relative z-50 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white group-hover:rotate-90 transition-transform duration-500">
            T
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">TGEN</span>
        </div>
        <button 
          onClick={() => navigate("/signin")}
          className="text-sm font-medium hover:text-white transition-colors border-b border-transparent hover:border-indigo-500"
        >
          Access Portal
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative z-10 pt-20 pb-32 px-6 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-[0.3em] uppercase mb-8"
        >
          <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          Next-Gen Adaptive Planning
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Master your time. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
            Conquer your courses.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-slate-400 text-lg md:text-xl font-light leading-relaxed mb-10"
        >
          TGEN doesn't just build a timetable. It evolves with you, 
          identifying study gaps and tailoring your schedule for peak academic performance.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={() => navigate("/signup")}
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl shadow-white/5"
          >
            Get Started
          </button>
          <button 
            onClick={() => navigate("/signin")}
            className="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-white/10 transition-all"
          >
            Start Planning
          </button>
        </motion.div>
      </header>

      {/* --- CARDS SECTION --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group"
            >
              <div className="mb-6 p-3 w-fit rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{card.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- FOOTER TAG --- */}
      <footer className="relative z-10 text-center pb-10">
        <p className="text-[10px] tracking-widest text-slate-600 uppercase">
          TGEN // The Adaptive Academic Protocol
        </p>
      </footer>
    </div>
  );
};

export default Homepage;
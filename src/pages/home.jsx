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
    <div className="h-screen overflow-y-auto bg-[#08080a] text-slate-200 selection:bg-indigo-500/30 font-sans custom-scrollbar">
      {/* --- INLINE CSS FOR HIDDEN/NEURAL SCROLLBAR --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.4);
        }
        /* For Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(79, 70, 229, 0.1) transparent;
        }
      `}} />

      {/* --- FIXED BACKGROUND LAYER --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10">
        {/* --- NAV BAR --- */}
        <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white group-hover:rotate-90 transition-transform duration-500 shadow-lg shadow-indigo-500/20">
              T
            </div>
            <span className="text-xl font-bold tracking-tighter text-white">TGEN</span>
          </div>
          <button 
            onClick={() => navigate("/signin")}
            className="text-sm font-black tracking-widest uppercase hover:text-white transition-colors border-b border-transparent hover:border-indigo-500 py-1"
          >
            Access Portal
          </button>
        </nav>

        {/* --- HERO SECTION --- */}
        <header className="pt-20 pb-32 px-6 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.3em] uppercase mb-8 text-indigo-400"
          >
            <Zap className="w-3 h-3 fill-indigo-400" />
            Adaptive Academic Protocol
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
            className="max-w-xl text-slate-500 text-lg font-medium leading-relaxed mb-10"
          >
            TGEN isn't just a timetable. It's an evolution. 
            We identify study gaps and reshape your schedule for absolute performance.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <button 
              onClick={() => navigate("/signup")}
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/20 text-xs"
            >
              Initialize Sync
            </button>
            <button 
              onClick={() => navigate("/signin")}
              className="px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all text-xs"
            >
              Start Planning
            </button>
          </motion.div>
        </header>

        {/* --- CARDS SECTION --- */}
        <section className="max-w-7xl mx-auto px-6 pb-40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group"
              >
                <div className="mb-8 p-4 w-fit rounded-2xl bg-indigo-500/5 border border-indigo-500/10 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-black italic text-white mb-4 tracking-tighter uppercase">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium group-hover:text-slate-400 transition-colors">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="text-center pb-12 border-t border-white/5 pt-12 mx-8">
          <p className="text-[10px] font-black tracking-[0.5em] text-slate-700 uppercase">
            TGEN // Terminal Generation Adaptive Planning // 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Homepage;
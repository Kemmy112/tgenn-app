import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setMessage({ type: 'error', text: "Neural keys do not match." });
    }

    if (password.length < 6) {
      return setMessage({ type: 'error', text: "Key must be at least 6 characters." });
    }

    setLoading(true);
    setMessage(null);

    // Supabase handles the session automatically when arriving from the email link
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    } else {
      setMessage({ type: 'success', text: "Access Restored. Redirecting to Mission Control..." });
      // Short delay so the user can read the success message
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Neural Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-2xl p-10 rounded-[3rem] relative z-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Reset Access</h2>
          <p className="text-[10px] font-black text-indigo-400 tracking-[0.3em] uppercase mt-2">Establish New Neural Credentials</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                placeholder="New Neural Key"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all placeholder:text-slate-700"
                placeholder="Confirm Neural Key"
              />
            </div>
          </div>

          {message && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center ${
                message.type === 'error' 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="group relative w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl disabled:opacity-50 overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Authorize Password Reset"
              )}
            </span>
          </button>
        </form>
      </motion.div>

      {/* Footer Tag */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-[10px] tracking-widest text-slate-700 uppercase font-black">
          TGEN // Security Protocol 0.4.1
        </p>
      </div>
    </div>
  );
}
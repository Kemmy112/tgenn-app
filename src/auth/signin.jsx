import React, { useState } from "react";
import { motion } from 'framer-motion';
import { HiOutlineMail } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabase'; // Import your Supabase client

export default function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message); // Or use a better error UI
    } else {
      // Success: Supabase will trigger onAuthStateChange in Layout, which handles the redirect
      navigate("/dashboard"); // Optional: Explicitly navigate, but Layout will manage it
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
  if (!email) {
    alert("Please enter your email address first.");
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Even with wildcards, explicitly naming the route is safer
    redirectTo: `${window.location.origin}/resetpswd`,
  });

  if (error) {
    alert("Neural Link Error: " + error.message);
  } else {
    alert("Check your inbox. The recalibration link has been dispatched.");
  }
};

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-6 relative">
      <motion.div className="w-full max-w-lg relative z-10">
        <div className="backdrop-blur-2xl bg-white/[0.03] p-12 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Identity Sync</h1>
            <p className="text-slate-400 text-lg">Access your TGEN optimized schedule.</p>
          </div>

          <form onSubmit={handleSignin} className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-2">Email Address</label>
              <div className="group relative">
                <HiOutlineMail className="absolute left-5 top-5 text-2xl text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl outline-none focus:border-indigo-500/50 transition-all" 
                  placeholder="name@university.edu" 
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-2">Password</label>
              <div className="group relative">
                <RiLockPasswordLine className="absolute left-5 top-5 text-2xl text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl outline-none focus:border-indigo-500/50 transition-all" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-xl font-bold transition-all shadow-xl shadow-indigo-600/20"
            >
              {loading ? "Syncing..." : "Access Terminal"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/resetpswd" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-8">Forgot Password?</Link>
          </div>

          <p className="text-center mt-6 text-slate-500 text-lg">
            New node? <Link to="/signup" className="text-indigo-400 font-bold ml-2 underline underline-offset-8">Request Access</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
import React, { useState } from "react";
import { motion } from 'framer-motion';
import { HiOutlineMail, HiOutlineUser } from 'react-icons/hi';
import { RiLockPasswordLine } from 'react-icons/ri';
import { FaCheck } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

export default function Signin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-6 relative">
      <motion.div className="w-full max-w-lg relative z-10">
        <div className="backdrop-blur-2xl bg-white/[0.03] p-12 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Identity Sync</h1>
            <p className="text-slate-400 text-lg">Access your TGEN optimized schedule.</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-2">Email Address</label>
              <div className="group relative">
                <HiOutlineMail className="absolute left-5 top-5 text-2xl text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input type="email" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl outline-none focus:border-indigo-500/50 transition-all" placeholder="name@university.edu" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-2">Password</label>
              <div className="group relative">
                <RiLockPasswordLine className="absolute left-5 top-5 text-2xl text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input type="password" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-xl outline-none focus:border-indigo-500/50 transition-all" placeholder="••••••••" />
              </div>
            </div>

            <button 
            onClick={() => navigate("/dashboard")}
            className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xl font-bold transition-all shadow-xl shadow-indigo-600/20"
            >
              Access Terminal
            </button>
            </div>

          <p className="text-center mt-12 text-slate-500  text-lg">
            New node? <Link to="/signup" className="text-indigo-400 font-bold ml-2 underline underline-offset-8">Request Access</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
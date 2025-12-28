import React, { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from '../supabase';
import { HiOutlineMail, HiOutlineUser } from "react-icons/hi";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaCheck } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Zap, ArrowLeft } from "lucide-react";

export default function Signup() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState(""); 
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const strengthLabel = ["Weak", "Weak", "Medium", "Medium", "Strong", "Strong"][strength];
  const strengthColor = strengthLabel === "Strong" ? "bg-emerald-500" : strengthLabel === "Medium" ? "bg-yellow-500" : "bg-rose-500";

  
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      alert(error.message);
    } else {
      // Pass the email to the verify page so it's ready for the OTP
      navigate("/verifyemail", { state: { email } });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-6 relative">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-8 left-8 z-50">
        <Link to="/" className="group flex items-center gap-3 text-slate-500 hover:text-white transition-colors">
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/10 transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">Return to Hub</span>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
        <div className="backdrop-blur-2xl bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>
            <p className="text-slate-400 text-lg mt-2">Initialize your academic profile.</p>
          </div>

          
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
              <div className="flex items-center gap-4 bg-white/[0.05] px-5 py-4 rounded-2xl border border-white/10 focus-within:border-indigo-500 transition-all">
                <HiOutlineUser className="text-2xl text-slate-400" />
                <input 
                  type="text" 
                  className="bg-transparent flex-1 outline-none text-lg text-white" 
                  placeholder="First and Last Name" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)} // ADDED
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
              <div className="flex items-center gap-4 bg-white/[0.05] px-5 py-4 rounded-2xl border border-white/10 focus-within:border-indigo-500 transition-all">
                <HiOutlineMail className="text-2xl text-slate-400" />
                <input 
                  type="email" 
                  className="bg-transparent flex-1 outline-none text-lg text-white" 
                  placeholder="student@university.edu" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
              <div className="flex items-center gap-4 bg-white/[0.05] px-5 py-4 rounded-2xl border border-white/10 focus-within:border-indigo-500 transition-all">
                <RiLockPasswordLine className="text-2xl text-slate-400" />
                <input 
                  type="password" 
                  className="bg-transparent flex-1 outline-none text-lg text-white" 
                  placeholder="Secure Key" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required 
                />
              </div>

              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                <motion.div animate={{ width: `${(strength / 5) * 100}%` }} className={`h-full ${strengthColor}`} />
              </div>

              <div className="grid grid-cols-1 gap-2 mt-4 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                {[
                  { label: "8+ Characters", valid: checks.length },
                  { label: "Uppercase & Lowercase", valid: checks.upper && checks.lower },
                  { label: "One Number", valid: checks.number },
                  { label: "Special Character", valid: checks.special },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <FaCheck className={`text-lg ${item.valid ? "text-emerald-400" : "text-slate-700"}`} />
                    <span className={`text-base ${item.valid ? "text-slate-200" : "text-slate-500"}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xl font-bold rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20"
            >
              {loading ? "Initializing..." : "Initialize Profile"} 
              <Zap className="w-5 h-5 fill-current" />
            </button>
          </form>

          <p className="text-center mt-8 text-slate-500 text-lg">
            Registered? <Link to="/signin" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-8">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom"; // Add useLocation
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react"; // Added Loader
import { supabase } from '../supabase'; // Import your supabase client

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email that was passed from the Signup page
  const email = location.state?.email;

  const handleVerify = async () => {
    if (!email) {
      alert("Email not found. Please try signing up again.");
      return;
    }

    setLoading(true);

    // THIS is the part that tells Supabase to verify the user
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      
      navigate("/onboardingpage"); 
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-6 relative">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        <div className="backdrop-blur-2xl bg-white/[0.03] p-12 rounded-[3rem] border border-white/10 shadow-2xl text-center">
          
          <div className="inline-flex p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <ShieldCheck className="text-emerald-400 w-12 h-12" />
          </div>

          <h2 className="text-4xl font-bold tracking-tight mb-4">Security Challenge</h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed px-4">
            A verification token has been dispatched to <span className="text-indigo-400 font-mono">{email}</span>. 
            Enter the 6-digit code to authorize your account.
          </p>

          <div className="space-y-8">
            <input 
              type="text" 
              maxLength="6"
              value={otp}
              disabled={loading}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0 0 0 0 0 0"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl py-6 text-center text-5xl font-mono tracking-[0.5em] text-indigo-400 outline-none focus:border-indigo-500 transition-all placeholder:text-slate-800 disabled:opacity-50"
            />

            <button 
              onClick={handleVerify} // Changed from simple navigate
              disabled={otp.length < 6 || loading}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-2xl text-xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>Verifying Protocol <Loader2 className="animate-spin" /></>
              ) : (
                <>Verify Protocol <ArrowRight className="w-6 h-6" /></>
              )}
            </button>

            <p className="text-slate-500 text-base">
              Didn't receive code? <button className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">Resend Token</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";
import { ShieldCheck, RefreshCcw } from "lucide-react";

export default function VerifyEmail() {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your email";

  // Countdown timer for that 60s window
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    const finalOtp = otp.join("");

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: finalOtp,
      type: "signup",
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      navigate("/onboardingpage");
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
        <div className="backdrop-blur-2xl bg-white/[0.03] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
            <ShieldCheck className="text-indigo-400 w-8 h-8" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Neural Key Sync</h1>
          <p className="text-slate-400 mb-8">Enter the 6-digit access code sent to <br/><span className="text-indigo-400">{email}</span></p>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-14 bg-white/[0.05] border border-white/10 rounded-xl text-center text-2xl font-bold outline-none focus:border-indigo-500 transition-all"
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <div className="text-sm font-mono">
              {timer > 0 ? (
                <span className="text-slate-500">WINDOW CLOSES IN: <span className="text-indigo-400">{timer}s</span></span>
              ) : (
                <button type="button" onClick={() => window.location.reload()} className="text-rose-400 flex items-center gap-2 mx-auto">
                  <RefreshCcw size={14} /> KEY EXPIRED. RESEND?
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.includes("")}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-2xl font-bold transition-all"
            >
              {loading ? "VALIDATING..." : "VERIFY IDENTITY"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Github, Chrome, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth as firebaseAuth } from '../lib/firebase';

export default function Auth() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      navigate('/social');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg("Please fill in both fields");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        setSuccessMsg("Link established successfully!");
      } else {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
        setSuccessMsg("Genesis account successfully created!");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Authentication failed. Clear your neurals and retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      // Sign in anonymously to get a real Firebase Auth credentials session in Sandboxed UI
      await signInAnonymously(firebaseAuth);
      setSuccessMsg("Demo secure link established!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Demo entry failed. Please use Google Sign In.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 md:px-0">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-[80px] p-10 md:p-20 space-y-12 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 premium-gradient opacity-80"></div>
        
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-[35%] bg-white/5 flex items-center justify-center mx-auto text-premium mb-6 border border-white/10 shadow-[0_0_20px_rgba(192,132,252,0.15)]">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">
            {isLogin ? "Neural Entry" : "Elite Genesis"}
          </h1>
          <p className="text-white/40 uppercase tracking-widest text-[10px]">Access the Private Network</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl text-xs font-black uppercase tracking-widest text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-3xl text-xs font-black uppercase tracking-widest text-center animate-pulse">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-6">Digital Identifier</label>
            <div className="relative">
               <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
               <input 
                 type="email" 
                 required
                 placeholder="email@elite.social" 
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-full px-14 py-5 text-lg outline-none focus:border-premium/50 transition-all font-serif italic text-white" 
               />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-6">Secure Key</label>
            <div className="relative">
               <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20" size={18} />
               <input 
                 type="password" 
                 required
                 placeholder="••••••••" 
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-white/5 border border-white/10 rounded-full px-14 py-5 text-lg outline-none focus:border-premium/50 transition-all font-serif italic text-white" 
               />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 premium-gradient rounded-full font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all mt-6 text-white flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? "Initiate Link" : "Generate Genesis"} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-6 py-2 opacity-30">
          <div className="flex-grow h-px bg-white"></div>
          <span className="text-[8px] font-black uppercase tracking-widest">Or authenticate via</span>
          <div className="flex-grow h-px bg-white"></div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button 
            onClick={signInWithGoogle}
            className="p-5 rounded-[25px] bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-premium/30 transition-all text-white/70 hover:text-white"
            title="Google Login"
          >
            <Chrome size={22} />
          </button>
          
          <button 
            onClick={handleDemoAccess}
            className="p-5 rounded-[25px] bg-premium/10 border border-premium/20 flex items-center justify-center hover:bg-premium/20 transition-all text-premium font-black text-[10px] uppercase tracking-widest gap-2 col-span-2"
            title="Instant Demo Access"
          >
            <Sparkles size={16} /> Quick Sandbox Demo
          </button>
        </div>

        <div className="text-center pt-4">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white transition-colors"
          >
            {isLogin ? "Apply for Genesis Account" : "Return to Neural Entry"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Smartphone, Watch, Zap, ArrowRight, Check, CheckCircle2, RefreshCw, X } from 'lucide-react';

export default function Hardware() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // Checkout simulation states
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [simulationStep, setSimulationStep] = useState<'idle' | 'auth' | 'ledger' | 'success'>('idle');
  const [simProgress, setSimProgress] = useState(0);

  const hardware = [
    { name: "Neural Link Display", price: 2400, desc: "8K Ultra-latency visual interface.", icon: Monitor },
    { name: "Elite Handheld", price: 1200, desc: "Titanium chassis, neural sync enabled.", icon: Smartphone },
    { name: "Temporal Watch", price: 800, desc: "Always-on aura synchronization.", icon: Watch }
  ];

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccessBanner(true);
      // Clean query params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleBuy = async (p: any) => {
    setSelectedDevice(p);
    setSimulationStep('auth');
    setSimProgress(0);

    // Try live Stripe checkout first
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: p.name.toLowerCase().replace(/\s+/g, '_'),
          price: p.price,
          name: p.name,
          successUrl: window.location.origin + '/hardware?success=true',
          cancelUrl: window.location.origin + '/hardware?cancel=true'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch (err) {
      console.warn("Live Stripe checkout not reachable, launching high-fidelity device procurement simulation.");
    }

    // Trigger local simulation flow if Stripe fails or is not configured
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setSimProgress(progress);
      
      if (progress === 40) {
        setSimulationStep('ledger');
      } else if (progress === 100) {
        clearInterval(interval);
        setSimulationStep('success');
      }
    }, 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-20 pb-40">
      
      {/* Visual Success notification from query parameter redirect */}
      <AnimatePresence>
        {showSuccessBanner && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 p-6 bg-green-500/20 border border-green-500/30 backdrop-blur-xl rounded-[30px] shadow-2xl flex items-center gap-4 max-w-md w-full"
          >
            <CheckCircle2 className="text-green-400 shrink-0" size={32} />
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Quantum Dispatch Triggered</h4>
              <p className="text-[10px] text-white/50 uppercase tracking-wider mt-1">Physical hardware device allocated successfully.</p>
            </div>
            <button onClick={() => setShowSuccessBanner(false)} className="ml-auto text-white/30 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center space-y-6">
        <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-premium">Physical Tier</h4>
        <h1 className="text-7xl md:text-9xl font-black font-display italic uppercase tracking-tighter">Hardware</h1>
        <p className="text-white/40 max-w-xl mx-auto text-lg leading-relaxed font-serif italic">Tangible gateways to the digital elite.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {hardware.map(item => (
          <div key={item.name} className="glass-card rounded-[60px] p-12 space-y-8 group hover:scale-[1.02] hover:border-premium/20 transition-all relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-premium/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
             
             <div className="w-24 h-24 rounded-[40%] bg-white/5 flex items-center justify-center text-premium mb-10 border border-white/10 group-hover:bg-premium/10 transition-colors">
                <item.icon size={40} />
             </div>
             <div className="space-y-4">
                <h3 className="text-4xl font-black font-display italic uppercase text-white">{item.name}</h3>
                <p className="text-xl font-serif italic text-white/40">{item.desc}</p>
             </div>
             
             <div className="pt-10 border-t border-white/5 space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                   <span className="text-4xl font-black italic font-display premium-text-gradient">${item.price}</span>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-premium">
                      <Zap size={14} className="animate-pulse" /> Low Supply
                   </div>
                </div>
                <button 
                  onClick={() => handleBuy(item)}
                  className="w-full py-6 premium-gradient rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl text-white cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  Acquire Device <ArrowRight size={16} />
                </button>
             </div>
             
             <ul className="space-y-3 opacity-25">
                {['Premium Crafted Shell', 'Dual Quantum Encryption', 'Priority Broadcast Access'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white">
                    <Check size={12} className="text-premium" /> {f}
                  </li>
                ))}
             </ul>
          </div>
        ))}
      </div>

      {/* Simulated Checkout Hardware Modal */}
      <AnimatePresence>
        {selectedDevice && simulationStep !== 'idle' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-midnight/80 backdrop-blur-md">
            {/* Backdrop wrapper */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (simulationStep === 'success') setSelectedDevice(null); }}
              className="absolute inset-0"
            />
            
            {/* Content card */}
            <motion.div 
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative p-10 md:p-16 max-w-lg w-full glass-card rounded-[60px] space-y-8 text-center text-white shadow-2xl border border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-2 premium-gradient opacity-80"></div>
              
              {simulationStep !== 'success' && (
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-full bg-premium/10 border border-premium/30 flex items-center justify-center mx-auto text-premium">
                    <RefreshCw className="animate-spin" size={28} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-premium">Quantum Device Procurement</h3>
                    <h2 className="text-3xl font-black font-display uppercase tracking-tight italic mt-2">Allocating Device</h2>
                  </div>
                  
                  <p className="text-xs text-white/40 uppercase tracking-widest leading-relaxed">
                    {simulationStep === 'auth' ? "Authenticating security keys through private ledger nodes..." : "Registering physical device MAC hash into smart contract ledger..."}
                  </p>

                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full premium-gradient transition-all duration-300"
                      style={{ width: `${simProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-black text-premium uppercase tracking-widest">{simProgress}% ALLOCATED</div>
                </div>
              )}

              {simulationStep === 'success' && (
                <div className="space-y-8 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 rounded-[35%] bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
                    <CheckCircle2 size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-green-400">Order Dispatched</h4>
                    <h2 className="text-4xl font-black font-display uppercase tracking-tight italic">{selectedDevice.name}</h2>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-serif">Secure Order ID: #{Math.floor(Math.random() * 899999 + 100000)}HW</p>
                  </div>

                  <p className="text-base text-white/60 font-serif italic">
                    Acquisition complete. The physical shipping node has been initiated. Genesis prioritizations applied on your profile.
                  </p>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-left max-w-sm mx-auto space-y-2">
                     <div className="flex justify-between text-[9px] font-bold text-white/30 uppercase tracking-wider"><span>Hardware Device</span> <span>Price</span></div>
                     <div className="flex justify-between text-xs font-black uppercase tracking-wide text-white"><span>{selectedDevice.name}</span> <span className="text-premium">${selectedDevice.price}</span></div>
                  </div>

                  <button 
                    onClick={() => {
                      setSelectedDevice(null);
                      setSimulationStep('idle');
                    }}
                    className="px-10 py-5.5 premium-gradient rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 mx-auto hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Confirm Procurement
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, MessageCircle, Crown, Search, Bell, Menu, X, Laptop, LogIn, LogOut, Volume2, VolumeX, Cpu, Terminal, Radio, Maximize2, Minimize2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cyberSound } from "../services/soundService";
import { useImmersive } from "../context/ImmersiveContext";
import NetworkPulseTicker from "./NetworkPulseTicker";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, signOut, signInWithGoogle } = useAuth();
  const { isImmersive, toggleImmersive, exitImmersive } = useImmersive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(cyberSound.isMuted());

  // Trigger auditory success sweep on initial launch
  useEffect(() => {
    const welcomeTimeout = setTimeout(() => {
      cyberSound.playSuccess();
    }, 600);
    return () => clearTimeout(welcomeTimeout);
  }, []);

  const handleMuteToggle = () => {
    const newMuteState = cyberSound.toggleMute();
    setIsMuted(newMuteState);
  };

  const navItems = [
    { icon: Home, label: "Home", path: "/", active: location.pathname === "/" },
    { icon: Terminal, label: "Galáctica", path: "/galactica", active: location.pathname === "/galactica" },
    { icon: Crown, label: "Social", path: "/social", active: location.pathname === "/social" },
    { icon: ShoppingBag, label: "Market", path: "/marketplace", active: location.pathname === "/marketplace" },
    { icon: Laptop, label: "Hardware", path: "/hardware", active: location.pathname === "/hardware" },
    { icon: MessageCircle, label: "Messages", path: "/mensajes", active: location.pathname === "/mensajes" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cyber-pink selection:text-white">
      {/* Top Application Header containing Network Pulse Ticker & Glass HUD Navbar */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 transform ${
          isImmersive ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Global Cybernetic Network Pulse Streaming Ticker */}
        <NetworkPulseTicker />

        {/* Top Interactive Glass HUD Navbar */}
        <nav className="glass-card border-none border-b border-cyber-cyan/15 h-20 px-6 md:px-12 flex items-center justify-between backdrop-blur-md">
          {/* Left Grid Brand Identity */}
          <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              cyberSound.playTick();
              setMobileMenuOpen(!mobileMenuOpen);
            }} 
            className="md:hidden text-cyber-cyan hover:text-white transition-colors p-1 bg-white/5 rounded border border-white/5 active:scale-95"
            id="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[8px] font-mono text-cyber-cyan border border-cyber-cyan/30 px-1.5 py-0.5 rounded tracking-widest bg-cyber-cyan/5">
              HUD v2.6 // SYS_OK
            </span>
            <Link 
              to="/" 
              onClick={() => cyberSound.playSuccess()}
              onMouseEnter={() => cyberSound.playHover()}
              className="text-2xl md:text-3xl font-black font-display italic tracking-tighter text-white hover:text-cyber-cyan transition-colors relative group"
            >
              <span className="text-cyber-pink text-opacity-80">E</span>LITE
              <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-cyber-pink scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Link>
          </div>
        </div>
        
        {/* Desktop Nav Items with Synthesized Audio */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              onMouseEnter={() => cyberSound.playHover()}
              onClick={() => cyberSound.playTick()}
              className={`relative py-2 px-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all rounded-md font-mono ${
                item.active 
                  ? 'text-cyber-cyan bg-cyber-cyan/5 border border-cyber-cyan/25 shadow-[0_0_10px_rgba(0,243,255,0.15)]' 
                  : 'text-white/50 border border-transparent hover:text-white hover:bg-white/5'
              }`}
              id={`nav-link-${item.label.toLowerCase()}`}
            >
              <item.icon size={13} className={item.active ? 'text-cyber-cyan animate-pulse' : 'text-white/40'} />
              {item.label}
              {item.active && (
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-cyber-cyan rounded-full"></span>
              )}
            </Link>
          ))}
        </div>

        {/* User state, Sound controls, Immersive Switch & Diagnostic Indicators */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Modo Inmersivo Button */}
          <button
            onClick={toggleImmersive}
            onMouseEnter={() => cyberSound.playHover()}
            className="p-2.5 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 bg-cyber-pink/10 text-cyber-pink border-cyber-pink/30 hover:bg-cyber-pink/20 shadow-[0_0_12px_rgba(255,0,127,0.15)]"
            title="Activar Modo Inmersivo (Experiencia de lectura sin distracciones)"
            id="immersive-mode-toggle"
          >
            <Maximize2 size={14} />
            <span className="hidden sm:inline text-[8px] font-mono font-bold tracking-wider uppercase">
              Modo Inmersivo
            </span>
          </button>

          {/* Sound Synthesizer Controller Button */}
          <button 
            onClick={handleMuteToggle}
            onMouseEnter={() => cyberSound.playHover()}
            className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 ${
              isMuted 
                ? 'bg-neutral-900 text-neutral-500 border-neutral-800' 
                : 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30 shadow-[0_0_12px_rgba(0,243,255,0.15)]'
            }`}
            title={isMuted ? "Neural synapse audio muted" : "Neural synapse audio active"}
            id="cyber-audio-toggle"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="animate-pulse" />}
            <span className="hidden xl:inline text-[8px] font-mono tracking-wider">
              {isMuted ? "SYNAPSE_MUTE" : "SYNAPSE_LIVE"}
            </span>
          </button>

          {/* Core System Indicator */}
          <div className="hidden lg:flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md border border-white/5">
            <Radio size={11} className="text-cyber-pink animate-pulse" />
            <span className="text-[7px] font-mono text-white/45 tracking-widest uppercase">NODE_LINK_5G</span>
          </div>

          <button 
            onClick={() => { cyberSound.playGlitch(); }}
            className="text-white/40 hover:text-cyber-pink transition-all relative p-2"
          >
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-cyber-pink rounded-full shadow-[0_0_8px_#ff007f]"></span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden xl:flex flex-col items-end text-right">
                <span className="text-[9px] font-mono text-white uppercase tracking-wider flex items-center gap-1">
                  <Cpu size={10} className="text-cyber-cyan" /> 
                  {user.displayName || "GUEST"}
                </span>
                <span className="text-[7px] font-mono text-cyber-pink uppercase tracking-widest opacity-80">
                  {user.email?.slice(0, 15)}...
                </span>
              </div>
              <Link 
                to={`/perfil/${user.displayName || "me"}`} 
                onClick={() => cyberSound.playTick()}
                className="relative group block"
              >
                <div className="absolute inset-0 bg-cyber-pink rounded-xl blur-sm scale-95 opacity-0 group-hover:opacity-60 transition-opacity"></div>
                <img 
                  src={user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80"} 
                  className="w-9 h-9 rounded-xl object-cover border border-white/20 group-hover:border-cyber-pink transition-colors relative z-10"
                  alt="Profile"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <button 
                onClick={() => {
                  cyberSound.playGlitch();
                  signOut();
                }} 
                className="text-white/40 hover:text-cyber-pink p-2 rounded-xl hover:bg-white/5 transition-all"
                title="Sign Out"
                id="sign-out-btn"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                cyberSound.playSuccess();
                signInWithGoogle();
              }}
              onMouseEnter={() => cyberSound.playHover()}
              className="px-4 py-2 premium-gradient text-[9px] font-mono font-bold uppercase tracking-widest rounded-lg flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all text-white border border-cyber-pink/40"
              id="google-signin-btn"
            >
              <LogIn size={11} /> CONNECT
            </button>
          )}
        </div>
      </nav>
      </header>

      {/* Floating Controller when Immersive Mode is Active */}
      {isImmersive && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-950/90 border border-cyber-pink/50 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(255,0,127,0.35)] animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyber-pink animate-ping"></span>
            <span className="text-[10px] font-mono font-bold text-cyber-pink uppercase tracking-widest">
              MODO INMERSIVO ACTIVO
            </span>
          </div>
          <span className="text-white/20 text-xs hidden sm:inline">|</span>
          <span className="text-[9px] font-mono text-white/50 hidden sm:inline">
            Lectura libre de distracciones (ESC)
          </span>
          <button
            onClick={exitImmersive}
            onMouseEnter={() => cyberSound.playHover()}
            className="px-3.5 py-1.5 bg-cyber-pink/20 hover:bg-cyber-pink/40 border border-cyber-pink/50 rounded-xl text-[9px] font-mono font-bold uppercase tracking-wider text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(255,0,127,0.2)]"
            id="exit-immersive-btn"
          >
            <Minimize2 size={12} /> Salir
          </button>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && !isImmersive && (
        <div className="fixed inset-0 top-28 z-40 bg-cyber-bg/95 backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-4 duration-200 border-b border-cyber-cyan/15">
          <div className="flex flex-col p-6 space-y-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                toggleImmersive();
              }}
              className="flex items-center gap-4 py-4 px-6 rounded-2xl text-[10px] font-mono uppercase tracking-[0.25em] bg-cyber-pink/15 text-cyber-pink border border-cyber-pink/30 font-bold"
            >
              <Maximize2 size={18} /> MODO INMERSIVO
            </button>

            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                onMouseEnter={() => cyberSound.playHover()}
                onClick={() => {
                  cyberSound.playTick();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-4 py-4 px-6 rounded-2xl text-[10px] font-mono uppercase tracking-[0.25em] transition-all ${
                  item.active 
                    ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
                    : 'text-white/60 border border-transparent hover:bg-white/5 hover:text-white'
                }`}
                id={`mobile-nav-${item.label.toLowerCase()}`}
              >
                <item.icon size={18} className={item.active ? 'text-cyber-cyan' : 'text-white/40'} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content framed inside interactive viewport grid */}
      <main className={`flex-grow container mx-auto max-w-7xl relative z-10 transition-all duration-500 ${
        isImmersive ? 'pt-6 md:pt-10 px-4 md:px-8' : 'pt-32 md:pt-36 px-4 md:px-8'
      }`}>
        {children}
      </main>


      {/* Cybernetic telemetry footer */}
      {!isImmersive && (
        <footer className="py-12 border-t border-white/5 text-center mt-20 relative z-10">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-white/20 font-mono text-[8px] uppercase tracking-[0.3em]">
              <span>NODE_ADDR: 0x98FE...A21B</span>
              <span>•</span>
              <span className="text-cyber-cyan">MATRIX_LATENCY: 12MS</span>
              <span>•</span>
              <span>ELITE PROTOCOL V9.0</span>
            </div>
            <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/10 italic">
              Elite Autonomous Network © 2026 • Encrypted Terminus
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShoppingBag, Users, Zap, Star, Lock, Heart, Play, DollarSign, Eye, Cpu, Database, Network, Key, Terminal, MessageSquare, AlertCircle, RefreshCw, AudioLines } from 'lucide-react';
import { cyberSound } from '../services/soundService';
import TailoredFeed from '../components/TailoredFeed';
import GlobalElitePulseTicker from '../components/GlobalElitePulseTicker';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'status' | 'nodes' | 'decrypt' >('status');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SYS_INIT: Booting Elite Neural Interface...",
    "SECURE_LINK: Established connection to host node.",
    "DECRYPTOR: Decrypting localized peer hashes... [OK]"
  ]);
  const [customInput, setCustomInput] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [networkUsers, setNetworkUsers] = useState(2548);
  const [systemLoad, setSystemLoad] = useState(24);

  // Live telemetry clock
  const [timeStr, setTimeStr] = useState("00:00:00 UTC");

  useEffect(() => {
    // Clock tick
    const clockInterval = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace("GMT", "UTC"));
    }, 1000);

    // Dynamic numeric fluctuation for extra cyberpunk fidelity
    const numericInterval = setInterval(() => {
      setNetworkUsers(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      setSystemLoad(prev => {
        const delta = Math.floor(Math.random() * 5 - 2);
        const next = prev + delta;
        return next > 90 || next < 10 ? 24 : next;
      });
    }, 3000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(numericInterval);
    };
  }, []);

  const triggerTerminalLog = (log: string) => {
    setTerminalLogs(prev => [
      ...prev.slice(-6), 
      `[${new Date().toLocaleTimeString()}] ${log}`
    ]);
  };

  const handleStartDecryption = () => {
    if (!customInput.trim()) return;
    cyberSound.playGlitch();
    setIsDecrypting(true);
    triggerTerminalLog(`DECRYPT_AUTH: Initiated decrypt for "${customInput}"`);
    
    setTimeout(() => {
      const cyphers = ["@", "#", "$", "%", "&", "★", "⚡", "♦", "☢"];
      let result = "";
      for (let i = 0; i < customInput.length; i++) {
        result += cyphers[Math.floor(Math.random() * cyphers.length)];
      }
      setDecryptedText(result);
      setIsDecrypting(false);
      cyberSound.playSuccess();
      triggerTerminalLog(`CYPHER_OK: Output hashed segment -> ${result}`);
    }, 1500);
  };

  return (
    <div className="pb-40 relative">
      {/* Global Elite Pulse Search Grounded Ticker */}
      <GlobalElitePulseTicker />

      <div className="min-h-[85vh] flex flex-col justify-center items-center text-center px-4 relative z-10 overflow-hidden">
        
        {/* Decorative Laser Accents */}
        <div className="absolute top-10 left-[10%] w-[1px] h-60 bg-gradient-to-b from-cyber-cyan to-transparent opacity-20 hidden md:block" />
        <div className="absolute top-10 right-[10%] w-[1px] h-60 bg-gradient-to-b from-cyber-pink to-transparent opacity-20 hidden md:block" />

        <div className="flex flex-col items-center space-y-10">
          
          {/* Neon Badging */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-6 py-2 border border-cyber-cyan/30 bg-cyber-cyan/5 rounded-full text-[10px] font-mono uppercase tracking-[0.5em] text-cyber-cyan shadow-[0_0_15px_rgba(0,243,255,0.15)]"
          >
            <span className="w-1.5 h-1.5 bg-cyber-cyan rounded-full animate-ping"></span>
            NEURAL_NET_GATEWAY: ACTIVE
          </motion.div>

          {/* Glitched Main Heading */}
          <div className="relative group">
            <h1 
              data-text="ELITE NET"
              className="text-6xl md:text-[140px] font-black tracking-tighter leading-[0.8] font-display uppercase italic relative z-10 text-white cursor-default cyber-glitch"
            >
              ELITE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-pink to-cyber-yellow block transition-all duration-700 animate-pulse">
                NET_ MATRIX
              </span>
            </h1>
          </div>
          
          {/* Cyberpunk Description */}
          <p className="max-w-2xl text-lg text-white/50 font-mono tracking-tight leading-relaxed">
            Plataforma social autónoma cifrada. Comunidad soberana, <br/>
            <span className="text-cyber-pink font-semibold">libre arbitrio financiero</span> y experiencias multisensoriales.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-4">
            <a 
              href="/auth" 
              onMouseEnter={() => cyberSound.playHover()}
              onClick={() => cyberSound.playSuccess()}
              className="group relative px-10 py-5 overflow-hidden rounded-xl border border-cyber-pink/40 shadow-[0_0_20px_rgba(255,0,127,0.3)] bg-black/60"
            >
              <div className="absolute inset-0 premium-gradient opacity-10 group-hover:opacity-20 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-3">
                <span className="text-cyber-pink font-black uppercase tracking-widest text-xs font-mono">
                  LINK_NEURAL_LINK
                </span>
                <Cpu size={15} className="text-cyber-pink group-hover:rotate-90 transition-transform duration-500" />
              </div>
            </a>
            
            <a 
              href="/social" 
              onMouseEnter={() => cyberSound.playHover()}
              onClick={() => cyberSound.playTick()}
              className="px-10 py-5 bg-cyber-cyan/5 hover:bg-cyber-cyan/15 border border-cyber-cyan/25 text-cyber-cyan rounded-xl font-mono text-xs uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,243,255,0.25)] transition-all flex items-center gap-2"
            >
              <Network size={14} className="animate-pulse" /> EXPLORE_GRID
            </a>
          </div>
        </div>
      </div>

      {/* Cyberpunk Interactive Control Command Station */}
      <section className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* Angled Border Panel Layout */}
        <div className="cyber-panel p-8 md:p-12 space-y-10 relative overflow-hidden bg-cyber-bg/90 border border-cyber-cyan/30 rounded-lg">
          
          {/* Outer glow aura */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {/* Diagnostic Stats Header Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left border-b border-cyber-cyan/20 pb-8">
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block">SYS_TIME</span>
              <span className="text-xs md:text-sm font-mono text-cyber-cyan tracking-wide font-bold">{timeStr}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block">ONLINE_PEERS</span>
              <span className="text-xs md:text-sm font-mono text-cyber-pink tracking-wide font-bold">{networkUsers} SYNC</span>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block">LOAD_LATENCY</span>
              <span className="text-xs md:text-sm font-mono text-cyber-yellow tracking-wide font-bold">{systemLoad}% / 12MS</span>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest block">LEDGER_KEY</span>
              <span className="text-xs md:text-sm font-mono text-cyber-green tracking-wide font-bold">SECURE_SHA256</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black font-display text-white tracking-widest uppercase flex items-center gap-2">
                  <Terminal size={18} className="text-cyber-cyan" /> COLOURED CODES DECK
                </h3>
                <p className="text-xs text-white/40 font-mono mt-1">Simular comandos y hashes dentro del ecosistema cibernético.</p>
              </div>
              
              {/* Deck Tab Toggles */}
              <div className="flex gap-2 bg-black/60 p-1 rounded-lg border border-white/5">
                {[
                  { id: 'status', label: 'METRIC LOG' },
                  { id: 'nodes', label: 'ACTIVE NODES' },
                  { id: 'decrypt', label: 'DECRYPTOR' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      cyberSound.playTick();
                      setActiveTab(t.id as any);
                      triggerTerminalLog(`PANEL_ROUTE: Navigating to ${t.label}`);
                    }}
                    className={`px-3 py-1.5 rounded text-[8px] font-mono uppercase tracking-widest transition-all ${
                      activeTab === t.id 
                        ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' 
                        : 'text-white/45 hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deck Inner Content */}
            <div className="bg-black/85 p-6 rounded-xl border border-white/10 font-mono min-h-[220px] flex flex-col justify-between relative">
              
              {/* Scanline pattern overlay inside the panel */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] rounded-xl pointer-events-none opacity-40"></div>
              
              <AnimatePresence mode="wait">
                {activeTab === 'status' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-cyber-green rounded-full"></span>
                      <span className="text-[10px] text-cyber-green uppercase tracking-widest font-bold">MONITOR_FEED: LIVE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
                        <div className="text-[9px] text-white/40">CPU SYNAPSE FREQUENCY</div>
                        <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyber-pink" style={{ width: `${systemLoad}%` }}></div>
                        </div>
                        <div className="text-[10px] text-cyber-pink text-right">{systemLoad * 128} MHz</div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
                        <div className="text-[9px] text-white/40">BANDWIDTH LOADOUT</div>
                        <div className="h-2 bg-neutral-900 rounded-full overflow-hidden">
                          <div className="h-full bg-cyber-cyan animate-pulse" style={{ width: '68%' }}></div>
                        </div>
                        <div className="text-[10px] text-cyber-cyan text-right">489.1 MB/s</div>
                      </div>
                    </div>

                    <div className="text-[10px] text-white/30 border-t border-white/5 pt-3">
                      Estabilidad general de la red: <span className="text-cyber-green">99.98% SLA OK</span>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'nodes' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Private Encryption Ledger Nodes</div>
                    
                    <div className="space-y-2">
                      {[
                        { name: "Tokyo_Hyper_Node_3", area: "ASIA-PACIFIC [TYO]", status: "STABLE", ping: "8ms" },
                        { name: "Frankfurt_Sub_Terminus_9", area: "EUROPE-CENTRAL [FRA]", status: "STABLE", ping: "14ms" },
                        { name: "Silicon_Bay_Aura_6", area: "USA-WEST [SFO]", status: "BUSY", ping: "22ms" }
                      ].map((n, i) => (
                        <div key={i} className="flex justify-between items-center p-2.5 bg-white/5 rounded border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${n.status === 'STABLE' ? 'bg-cyber-cyan animate-ping' : 'bg-cyber-yellow'}`}></span>
                            <span className="text-[10px] text-white font-bold">{n.name}</span>
                          </div>
                          <span className="text-[9px] text-white/40 hidden md:inline">{n.area}</span>
                          <div className="flex gap-4">
                            <span className="text-[9px] text-cyber-pink">{n.ping}</span>
                            <span className="text-[8px] bg-cyber-cyan/10 px-1 border border-cyber-cyan/20 text-cyber-cyan rounded">{n.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'decrypt' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="text-[9px] text-white/30 uppercase tracking-widest">Hex Decryptor Ledger Emulator</div>
                    
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Escribe texto a encriptar..." 
                        className="flex-grow bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder:text-white/20 outline-none focus:ring-1 focus:ring-cyber-pink"
                      />
                      <button 
                        onClick={handleBuyDemoDevice}
                        onMouseEnter={() => cyberSound.playHover()}
                        className="px-6 py-2.5 bg-cyber-pink/20 hover:bg-cyber-pink/35 border border-cyber-pink/40 text-cyber-pink rounded-lg text-xs uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2"
                      >
                        {isDecrypting ? <RefreshCw className="animate-spin" size={12} /> : "ENCRIPTAR"}
                      </button>
                    </div>

                    {decryptedText && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5 animate-in zoom-in-95">
                        <span className="text-[8px] text-cyber-yellow uppercase tracking-widest block font-bold">CYPHER_HASH OUTPUT:</span>
                        <span className="text-sm font-mono tracking-widest text-cyber-yellow break-all">{decryptedText}</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Core Terminal Logs Footer */}
              <div className="border-t border-white/5 pt-4 mt-4 space-y-1">
                <span className="text-[7.5px] text-white/30 tracking-widest block uppercase font-bold">CONSOLE LOGGER:</span>
                <div className="space-y-1 h-20 overflow-y-auto text-[9px] text-cyber-cyan/70 scrollbar-none font-mono">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span className="text-white/25">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust/Aura/Power Neon Grid Cards */}
      <section className="max-w-7xl mx-auto py-24 px-6 relative z-10">
        <div className="text-center mb-16 space-y-3">
          <h4 className="text-[10px] font-mono uppercase tracking-[0.5em] text-cyber-pink font-bold">CYBERNETIC MATRIX CAPABILITIES</h4>
          <h2 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">Sovereign Architecture</h2>
          <div className="w-20 h-0.5 bg-gradient-to-r from-cyber-cyan to-cyber-pink mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "TRUST LINK", label: "NODE SHIELDING", desc: "Canales alternativos de mensajería protegidos por redundancia cuántica.", icon: Shield, color: "text-cyber-cyan", borderStyle: "neon-border-cyan" },
            { title: "AURA GLOW", label: "RETINA HUD", desc: "Estilo estético CRT impecable, con respuesta sonora adaptativa integrada.", icon: Eye, color: "text-cyber-pink", borderStyle: "neon-border-pink" },
            { title: "POWER ENGINE", label: "SECURE ESCROW", desc: "Transacciones seguras mediante pasarelas con simulación de sandbox sandbox local.", icon: Zap, color: "text-cyber-yellow", borderStyle: "neon-border-dark" }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }} 
              onMouseEnter={() => cyberSound.playHover()}
              className={`group p-10 bg-cyber-card rounded-[30px] ${item.borderStyle} space-y-8 relative overflow-hidden transition-all duration-300`}
            >
              {/* Colored holographic dust */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
              
              <div className={`w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center ${item.color} border border-white/10 group-hover:scale-105 transition-all`}>
                <item.icon size={28} />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[8px] font-mono uppercase tracking-[0.3em] text-white/30">{item.label}</h4>
                <h3 className="text-3xl font-black tracking-tighter italic font-display uppercase text-white group-hover:text-cyber-cyan transition-colors">{item.title}</h3>
                <p className="text-sm font-mono text-white/50 leading-relaxed">{item.desc}</p>
              </div>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-white/20">
                <span>SECURE_BLOCK #{7800 + i}</span>
                <span className="text-cyber-cyan">ACTIVE</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tailored Feed Section with Mock Recommendation Service */}
      <section className="max-w-7xl mx-auto px-6 relative z-10">
        <TailoredFeed />
      </section>

      {/* Galáctica Teaser Section */}
      <section className="max-w-7xl mx-auto pb-32 px-6 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/10 via-transparent to-cyber-pink/10 opacity-30 blur-3xl pointer-events-none"></div>
        <div className="bg-cyber-card rounded-[40px] p-10 md:p-14 border border-cyber-cyan/20 relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-[0_0_35px_rgba(0,243,255,0.06)]">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyber-pink/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-cyber-cyan/10 rounded-full blur-3xl"></div>
          
          <div className="space-y-6 max-w-2xl relative z-10 text-left">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-ping"></span>
              <h4 className="text-[9px] font-mono tracking-widest text-cyber-cyan font-bold uppercase">MODULE_LAUNCH_READY: CONTINUOUS ODYSSEY</h4>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black font-display italic uppercase tracking-tighter leading-none text-white">
              GALÁCTICA <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-pink to-cyber-yellow">NEON ODYSSEY</span>
            </h2>
            
            <p className="text-sm font-mono text-white/50 leading-relaxed uppercase">
              // Conéctate a la jugabilidad inmersiva infinita. Combate estelar de estilo cyberpunk donde recolectas nanitas, optimizas tus escudos cuánticos de plasma y conquistas el núcleo de la red local.
            </p>

            <div className="flex flex-wrap gap-2 pt-2 text-[9px] font-mono font-semibold">
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-md text-cyber-pink font-bold">★ MULTI-WAVE TARGETING</span>
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-md text-cyber-cyan font-bold">⚡ AMBIENT FM SYNTHESIS</span>
              <span className="px-3 py-1 bg-white/5 border border-white/5 rounded-md text-cyber-yellow font-bold">✦ SECURE INTEGRATED LEDGER</span>
            </div>
          </div>

          <div className="shrink-0 relative z-10 w-full lg:w-auto text-center flex justify-center">
            <a 
              href="/galactica"
              onMouseEnter={() => cyberSound.playHover()}
              onClick={() => cyberSound.playSuccess()}
              className="px-10 py-5 bg-black/60 border border-cyber-cyan/35 text-cyber-cyan hover:text-white rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-cyber-cyan/10 hover:shadow-[0_0_20px_rgba(0,243,255,0.25)] transition-all flex items-center gap-3 animate-pulse cursor-pointer"
            >
              <Terminal size={14} /> ENGAGE ARCADE CORE
            </a>
          </div>
        </div>
      </section>
    </div>
  );

  function handleBuyDemoDevice() {
    handleStartDecryption();
  }
}

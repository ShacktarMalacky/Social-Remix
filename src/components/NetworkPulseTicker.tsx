import React, { useState, useEffect } from 'react';
import { 
  Users, TrendingUp, Cpu, Activity, Zap, Radio, ChevronRight, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Layers, ShieldCheck, 
  Flame, Pause, Play, Eye, X, BarChart3, Globe
} from 'lucide-react';
import { cyberSound } from '../services/soundService';

export interface NetworkMetric {
  id: string;
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  category: 'USERS' | 'MARKET' | 'COMPUTE' | 'NETWORK';
  unit?: string;
  details?: string;
}

export default function NetworkPulseTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<NetworkMetric | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Realtime engagement state
  const [metrics, setMetrics] = useState<NetworkMetric[]>([
    {
      id: 'active_users',
      label: 'ACTIVE NODES',
      value: '14,892',
      change: '+12.4%',
      isPositive: true,
      category: 'USERS',
      details: 'Active connected human & AI agents streaming live telemetry.'
    },
    {
      id: 'market_trades',
      label: '24H MARKET TRADES',
      value: '3,418',
      change: '+8.9%',
      isPositive: true,
      category: 'MARKET',
      unit: 'TRADES',
      details: 'Verified peer-to-peer hardware & digital asset transactions.'
    },
    {
      id: 'trade_volume',
      label: '24H VOLUME',
      value: '892,410',
      change: '+18.2%',
      isPositive: true,
      category: 'MARKET',
      unit: 'ELITE',
      details: 'Total volume transacted across the decentralized market index.'
    },
    {
      id: 'neural_sync',
      label: 'GALÁCTICA AI SYNC',
      value: '99.85%',
      change: '+0.04%',
      isPositive: true,
      category: 'COMPUTE',
      details: 'Gemini 3.1 Neural model latency alignment index.'
    },
    {
      id: 'reaction_streams',
      label: 'VIDEO REACTION LOOPS',
      value: '1,240',
      change: '+24.1%',
      isPositive: true,
      category: 'USERS',
      details: 'Active Veo-3 generated video reaction loops playing.'
    },
    {
      id: 'network_hashrate',
      label: 'NETWORK HASHRATE',
      value: '142.8',
      change: '-1.2%',
      isPositive: false,
      category: 'NETWORK',
      unit: 'TH/s',
      details: 'Distributed consensus validation hashing power.'
    },
    {
      id: 'active_contracts',
      label: 'SMART CONTRACTS',
      value: '1,024',
      change: '+4.5%',
      isPositive: true,
      category: 'NETWORK',
      details: 'Autonomous hardware & NFT licensing agreements executed.'
    },
  ]);

  // Simulate live dynamic network pulse ticks every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPaused) return;

      setMetrics((prevMetrics) => {
        return prevMetrics.map((m) => {
          if (m.id === 'active_users') {
            const currentNum = parseInt((m.value as string).replace(/,/g, ''), 10);
            const delta = Math.floor(Math.random() * 9) - 3; // -3 to +5
            const nextNum = Math.max(12000, currentNum + delta);
            return {
              ...m,
              value: nextNum.toLocaleString(),
              change: delta >= 0 ? `+${(Math.random() * 0.4 + 11.5).toFixed(1)}%` : `-0.1%`,
              isPositive: delta >= 0
            };
          }
          if (m.id === 'market_trades') {
            const currentNum = parseInt((m.value as string).replace(/,/g, ''), 10);
            const delta = Math.floor(Math.random() * 3); // 0 to 2
            const nextNum = currentNum + delta;
            return {
              ...m,
              value: nextNum.toLocaleString(),
              change: `+${(Math.random() * 0.5 + 8.5).toFixed(1)}%`,
              isPositive: true
            };
          }
          if (m.id === 'trade_volume') {
            const currentNum = parseInt((m.value as string).replace(/,/g, ''), 10);
            const delta = Math.floor(Math.random() * 250);
            const nextNum = currentNum + delta;
            return {
              ...m,
              value: nextNum.toLocaleString()
            };
          }
          return m;
        });
      });

      setLastUpdated(new Date());
    }, 3200);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleMetricClick = (metric: NetworkMetric) => {
    cyberSound.playTick();
    setSelectedMetric(metric);
  };

  return (
    <>
      {/* Top Banner Cybernetic Ticker Band */}
      <div className="w-full bg-neutral-950/80 border-b border-cyber-cyan/20 backdrop-blur-md relative overflow-hidden select-none z-40">
        <div className="max-w-7xl mx-auto flex items-center h-8 px-2 md:px-4 text-[9px] font-mono">
          
          {/* Static Live Indicator Header Tag */}
          <div className="flex items-center gap-2 pr-3 border-r border-white/10 shrink-0 bg-neutral-950/90 z-10 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-pink opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-pink"></span>
            </span>
            <span className="font-bold tracking-widest text-cyber-cyan hidden sm:inline uppercase">
              NETWORK_PULSE
            </span>
            <span className="font-bold tracking-widest text-cyber-cyan sm:hidden uppercase">
              PULSE
            </span>
            <span className="bg-cyber-pink/20 text-cyber-pink px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border border-cyber-pink/40">
              LIVE
            </span>
          </div>

          {/* Marquee Streaming Metrics */}
          <div className="flex-1 overflow-hidden relative mx-2">
            <div className={`flex items-center gap-8 ${isPaused ? '' : 'animate-marquee'}`}>
              {/* Duplicate array for continuous smooth scrolling */}
              {[...metrics, ...metrics, ...metrics].map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => handleMetricClick(item)}
                  onMouseEnter={() => cyberSound.playHover()}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-all group shrink-0 border border-transparent hover:border-cyber-cyan/30"
                >
                  <span className="text-white/40 uppercase tracking-wider group-hover:text-cyber-cyan transition-colors font-semibold">
                    {item.label}:
                  </span>
                  <span className="text-white font-bold font-mono tracking-tight text-[10px] group-hover:text-white">
                    {item.value} {item.unit && <span className="text-white/40 text-[8px]">{item.unit}</span>}
                  </span>
                  <span
                    className={`flex items-center text-[8px] font-bold ${
                      item.isPositive ? 'text-cyber-green' : 'text-cyber-pink'
                    }`}
                  >
                    {item.isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {item.change}
                  </span>
                  <span className="text-white/10 ml-2">•</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pause / Play Controls */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/10 shrink-0 bg-neutral-950/90 z-10 py-1">
            <button
              onClick={() => {
                cyberSound.playTick();
                setIsPaused(!isPaused);
              }}
              className="text-white/40 hover:text-cyber-cyan transition-colors p-1 rounded hover:bg-white/5 cursor-pointer flex items-center gap-1"
              title={isPaused ? "Resume Ticker Stream" : "Pause Ticker Stream"}
            >
              {isPaused ? <Play size={10} className="text-cyber-cyan" /> : <Pause size={10} />}
              <span className="hidden lg:inline text-[8px] text-white/30 uppercase tracking-widest font-mono">
                {isPaused ? "RESUME" : "PAUSE"}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Metric Detail Telemetry Modal */}
      {selectedMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="glass-card max-w-lg w-full p-8 rounded-[40px] border border-cyber-cyan/40 shadow-[0_0_50px_rgba(0,243,255,0.2)] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyber-cyan/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-cyan/10 border border-cyber-cyan/30 rounded-2xl text-cyber-cyan">
                  <Activity size={20} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-cyber-cyan font-bold">
                    TELEMETRY NODE // {selectedMetric.category}
                  </span>
                  <h3 className="text-2xl font-black font-display uppercase italic tracking-tight text-white">
                    {selectedMetric.label}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  cyberSound.playTick();
                  setSelectedMetric(null);
                }}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Metric Core Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-white/5 border border-white/5 rounded-3xl">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">
                  CURRENT LIVE VALUE
                </span>
                <p className="text-3xl font-black font-mono text-white tracking-tight">
                  {selectedMetric.value} <span className="text-sm font-normal text-cyber-cyan">{selectedMetric.unit}</span>
                </p>
              </div>

              <div className="p-5 bg-white/5 border border-white/5 rounded-3xl">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block mb-1">
                  24H DELTA SHIFT
                </span>
                <p className={`text-2xl font-black font-mono flex items-center gap-1 ${
                  selectedMetric.isPositive ? 'text-cyber-green' : 'text-cyber-pink'
                }`}>
                  {selectedMetric.isPositive ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                  {selectedMetric.change}
                </p>
              </div>
            </div>

            {/* Details Description */}
            <div className="p-5 bg-black/40 border border-white/10 rounded-3xl space-y-2 font-mono text-xs text-white/70">
              <span className="text-[9px] text-cyber-pink uppercase tracking-widest font-bold block">
                METRIC SPECIFICATION:
              </span>
              <p className="leading-relaxed">{selectedMetric.details}</p>
            </div>

            {/* Live Telemetry Pulse Graphic Representation */}
            <div className="p-4 bg-neutral-950 border border-cyber-cyan/20 rounded-3xl space-y-3">
              <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-widest">
                <span>SYSTEM LATENCY: 12ms</span>
                <span>STATUS: OPTIMAL</span>
              </div>
              <div className="flex items-end gap-1.5 h-16 pt-2">
                {[40, 65, 50, 80, 95, 70, 85, 60, 90, 100, 75, 85, 95, 110, 105].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-cyber-cyan/20 to-cyber-cyan rounded-t transition-all duration-500 hover:brightness-125"
                    style={{ height: `${(h / 110) * 100}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Footer Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  cyberSound.playTick();
                  setSelectedMetric(null);
                }}
                className="w-full py-3.5 premium-gradient rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg cursor-pointer hover:opacity-90 active:scale-98 transition-all"
              >
                Close Telemetry Inspection
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

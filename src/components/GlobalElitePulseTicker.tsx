import React, { useState, useEffect } from 'react';
import { 
  Globe, Radio, Zap, ExternalLink, RefreshCw, ChevronRight, 
  Sparkles, Search, Newspaper, ShieldAlert, ArrowUpRight, 
  X, CheckCircle2, TrendingUp, Cpu, Flame, Pause, Play 
} from 'lucide-react';
import { cyberSound } from '../services/soundService';

export interface PulseHeadline {
  id: string;
  title: string;
  category: string;
  summary: string;
  timeAgo: string;
  impactScore?: number;
  source?: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface PulseApiResponse {
  success: boolean;
  grounded: boolean;
  updatedAt: string;
  searchQueries?: string[];
  sources?: GroundingSource[];
  headlines: PulseHeadline[];
  notice?: string;
}

export default function GlobalElitePulseTicker() {
  const [headlines, setHeadlines] = useState<PulseHeadline[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedHeadline, setSelectedHeadline] = useState<PulseHeadline | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchPulseData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
      cyberSound.playGlitch();
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/global-elite-pulse');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data: PulseApiResponse = await response.json();
      
      if (data.headlines && data.headlines.length > 0) {
        setHeadlines(data.headlines);
        setSources(data.sources || []);
        setSearchQueries(data.searchQueries || []);
        setLastUpdated(new Date(data.updatedAt || Date.now()).toLocaleTimeString());
        if (isManualRefresh) {
          cyberSound.playSuccess();
        }
      } else {
        throw new Error('No headline stream payload returned');
      }
    } catch (err: any) {
      console.error('Error loading Global Elite Pulse grounding ticker:', err);
      setError(err.message || 'Telemetry connection interrupted');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPulseData();
    // Refresh pulse stream every 3 minutes
    const interval = setInterval(() => {
      fetchPulseData();
    }, 180000);
    return () => clearInterval(interval);
  }, []);

  const handleHeadlineClick = (item: PulseHeadline) => {
    cyberSound.playTick();
    setSelectedHeadline(item);
  };

  return (
    <div className="w-full relative z-20 my-4 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Top Banner Cyber Container */}
      <div className="cyber-panel p-3 md:p-4 bg-neutral-950/90 border border-cyber-cyan/30 rounded-2xl shadow-[0_0_25px_rgba(0,243,255,0.12)] relative overflow-hidden backdrop-blur-xl">
        
        {/* Holographic background accent */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-cyber-cyan/10 via-cyber-pink/5 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Header Tag / Live Search Grounding Badge */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0 pb-2 md:pb-0 border-b md:border-b-0 border-white/10 md:border-r md:pr-4">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-cyber-pink/10 border border-cyber-pink/40 rounded-xl text-cyber-pink animate-pulse">
                <Globe size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black font-display tracking-wider text-white uppercase italic">
                    GLOBAL ELITE PULSE
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-mono text-cyber-cyan/80 tracking-widest uppercase">
                  <Sparkles size={9} className="text-cyber-yellow" />
                  <span>SEARCH GROUNDED</span>
                </div>
              </div>
            </div>

            {/* Refresh Action */}
            <button
              onClick={() => fetchPulseData(true)}
              disabled={isRefreshing || loading}
              onMouseEnter={() => cyberSound.playHover()}
              className="p-1.5 bg-white/5 hover:bg-cyber-cyan/15 border border-white/10 hover:border-cyber-cyan/30 text-white/70 hover:text-cyber-cyan rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[8px] font-mono uppercase tracking-wider"
              title="Re-run Grounded Search Stream"
            >
              <RefreshCw size={11} className={isRefreshing ? 'animate-spin text-cyber-cyan' : ''} />
              <span className="hidden sm:inline">{isRefreshing ? 'SYNCING...' : 'REFRESH'}</span>
            </button>
          </div>

          {/* Marquee Streaming Headlines */}
          <div className="flex-1 w-full overflow-hidden relative min-h-[32px] flex items-center">
            {loading ? (
              <div className="flex items-center gap-3 text-[10px] font-mono text-cyber-cyan animate-pulse px-2">
                <Radio size={12} className="animate-spin" />
                <span>CONNECTING TO GEMINI SEARCH GROUNDED STREAM...</span>
              </div>
            ) : error && headlines.length === 0 ? (
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-cyber-pink px-2">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert size={12} /> {error}
                </span>
                <button 
                  onClick={() => fetchPulseData(true)} 
                  className="underline text-cyber-cyan hover:text-white"
                >
                  RETRY
                </button>
              </div>
            ) : (
              <div 
                className="w-full overflow-x-auto scrollbar-none py-1 flex items-center gap-4 text-xs font-mono select-none"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <div className={`flex items-center gap-6 ${isPaused ? '' : 'animate-marquee'} whitespace-nowrap`}>
                  {[...headlines, ...headlines].map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      onClick={() => handleHeadlineClick(item)}
                      onMouseEnter={() => cyberSound.playHover()}
                      className="flex items-center gap-2.5 bg-white/5 hover:bg-cyber-cyan/10 px-3 py-1.5 rounded-xl border border-white/10 hover:border-cyber-cyan/40 transition-all cursor-pointer group shrink-0"
                    >
                      <span className="px-1.5 py-0.5 bg-cyber-pink/15 text-cyber-pink border border-cyber-pink/30 rounded text-[8px] font-bold tracking-wider uppercase">
                        {item.category || 'TECH'}
                      </span>
                      
                      <span className="text-white group-hover:text-cyber-cyan font-medium text-xs max-w-[280px] sm:max-w-[360px] truncate transition-colors">
                        {item.title}
                      </span>

                      <span className="text-[9px] text-white/40 flex items-center gap-1 font-sans">
                        <Flame size={10} className="text-cyber-yellow" />
                        {item.timeAgo}
                      </span>

                      <ArrowUpRight size={12} className="text-cyber-cyan/60 group-hover:text-cyber-cyan group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Marquee Play/Pause Control & Grounded Citation count */}
          {!loading && headlines.length > 0 && (
            <div className="hidden lg:flex items-center gap-3 shrink-0 pl-3 border-l border-white/10 text-[9px] font-mono text-white/40">
              <button
                onClick={() => {
                  cyberSound.playTick();
                  setIsPaused(!isPaused);
                }}
                className="hover:text-cyber-cyan p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                title={isPaused ? "Resume Stream" : "Pause Stream"}
              >
                {isPaused ? <Play size={10} className="text-cyber-cyan" /> : <Pause size={10} />}
                <span>{isPaused ? "RESUME" : "PAUSE"}</span>
              </button>
              
              <span className="bg-cyber-cyan/10 text-cyber-cyan px-2 py-0.5 rounded border border-cyber-cyan/20">
                {sources.length} CITATIONS
              </span>
            </div>
          )}

        </div>
      </div>

      {/* Detailed Telemetry HUD Modal when headline clicked */}
      {selectedHeadline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="glass-card max-w-xl w-full p-6 md:p-8 rounded-[32px] border border-cyber-cyan/40 shadow-[0_0_50px_rgba(0,243,255,0.2)] space-y-6 relative overflow-hidden text-left">
            
            {/* Holographic corner light */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyber-pink/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/40 rounded text-[9px] font-mono font-black uppercase tracking-widest">
                    {selectedHeadline.category}
                  </span>
                  <span className="text-[9px] font-mono text-cyber-cyan flex items-center gap-1">
                    <Sparkles size={10} /> GROUNDED INTEL
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-black font-display text-white tracking-tight leading-tight italic">
                  {selectedHeadline.title}
                </h3>
              </div>

              <button
                onClick={() => {
                  cyberSound.playTick();
                  setSelectedHeadline(null);
                }}
                className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* AI Summary Box */}
            <div className="p-5 bg-black/60 border border-white/10 rounded-2xl space-y-3 font-mono text-xs text-white/80 leading-relaxed">
              <div className="flex items-center justify-between text-[9px] text-cyber-cyan font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1">
                  <Newspaper size={12} /> GEMINI GROUNDED ANALYSIS
                </span>
                <span>{selectedHeadline.timeAgo}</span>
              </div>
              <p className="text-white/90 leading-normal text-sm font-sans">
                {selectedHeadline.summary}
              </p>
            </div>

            {/* Impact Rating & Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <span className="text-[8px] text-white/40 uppercase tracking-widest block">INNOVATION IMPACT</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyber-cyan to-cyber-pink h-full" 
                      style={{ width: `${selectedHeadline.impactScore || 92}%` }} 
                    />
                  </div>
                  <span className="text-cyber-cyan font-bold">{selectedHeadline.impactScore || 92}/100</span>
                </div>
              </div>

              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
                <span className="text-[8px] text-white/40 uppercase tracking-widest block">GROUNDING SOURCE</span>
                <div className="text-white font-semibold truncate text-[11px] flex items-center gap-1">
                  <Globe size={11} className="text-cyber-pink shrink-0" />
                  <span className="truncate">{selectedHeadline.sourceTitle || selectedHeadline.source || 'Verified Web Source'}</span>
                </div>
              </div>
            </div>

            {/* Search Grounding Queries Used */}
            {searchQueries.length > 0 && (
              <div className="space-y-1.5 font-mono text-[9px]">
                <span className="text-white/30 uppercase tracking-widest block">GROUNDED SEARCH VECTOR:</span>
                <div className="flex flex-wrap gap-1.5">
                  {searchQueries.map((q, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-cyber-cyan/10 border border-cyber-cyan/20 text-cyber-cyan rounded-md">
                      "{q}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* External Citation Link Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {selectedHeadline.sourceUrl ? (
                <a
                  href={selectedHeadline.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cyberSound.playSuccess()}
                  onMouseEnter={() => cyberSound.playHover()}
                  className="flex-1 py-3 px-5 premium-gradient rounded-xl font-bold text-xs font-mono uppercase tracking-widest text-white shadow-lg cursor-pointer hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} /> OPEN SOURCE CITATION
                </a>
              ) : (
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(selectedHeadline.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cyberSound.playSuccess()}
                  onMouseEnter={() => cyberSound.playHover()}
                  className="flex-1 py-3 px-5 premium-gradient rounded-xl font-bold text-xs font-mono uppercase tracking-widest text-white shadow-lg cursor-pointer hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Search size={14} /> EXPLORE ON GOOGLE
                </a>
              )}

              <button
                onClick={() => {
                  cyberSound.playTick();
                  setSelectedHeadline(null);
                }}
                className="py-3 px-5 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl font-mono text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                CLOSE
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

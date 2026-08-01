import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ShoppingBag, Users, RefreshCw, Filter, ArrowUpRight, 
  Check, Star, MessageSquare, Zap, ShieldCheck, Tag, Plus, CheckCircle2
} from 'lucide-react';
import { 
  fetchTailoredRecommendations, 
  RecommendationItem, 
  ALL_INTEREST_OPTIONS 
} from '../services/recommendationService';
import { useAuth } from '../context/AuthContext';
import { cyberSound } from '../services/soundService';

export default function TailoredFeed() {
  const { user } = useAuth();
  const storageKey = `elite_profile_interests_${user?.uid || 'guest'}`;

  // Get interests from LocalStorage or default
  const [userInterests, setUserInterests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return ["Cyberpunk Neon City", "Abstract Quantum Architecture"];
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'topic' | 'marketplace'>('all');
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInterestSelector, setShowInterestSelector] = useState<boolean>(false);

  // Sync state to localStorage whenever userInterests change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(userInterests));
    } catch (e) {
      console.error("Failed to save interests", e);
    }
  }, [userInterests, storageKey]);

  // Load recommendations from mock service
  const loadFeed = async () => {
    setLoading(true);
    try {
      const items = await fetchTailoredRecommendations(userInterests, activeFilter);
      setRecommendations(items);
    } catch (err) {
      console.error("Error fetching recommendations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [userInterests, activeFilter]);

  const handleRefresh = () => {
    cyberSound.playGlitch();
    loadFeed();
  };

  const handleToggleInterest = (interest: string) => {
    cyberSound.playTick();
    setUserInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <section className="space-y-8 my-16 relative">
      {/* Background Neon Aura */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-cyber-pink/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-cyber-cyan/20">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyber-pink/20 border border-cyber-pink/40 rounded-lg text-cyber-pink">
              <Sparkles size={16} className="animate-pulse" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.3em] text-cyber-pink">
              ALGORITMO DE RECOMENDACIÓN NEURAL
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black font-display italic uppercase tracking-tight text-white flex items-center gap-3">
            Sugerencias Personalizadas
          </h2>

          <p className="text-sm text-white/50 max-w-xl font-mono">
            Temas de la comunidad y hardware del mercado seleccionados dinámicamente según tus temas de interés y aura creativa.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              cyberSound.playTick();
              setShowInterestSelector(!showInterestSelector);
            }}
            className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer active:scale-95 ${
              showInterestSelector
                ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]'
                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Tag size={14} />
            <span>Ajustar Intereses ({userInterests.length})</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold uppercase tracking-wider text-white/80 border border-white/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            title="Recargar sugerencias"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-cyber-cyan' : ''} />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
        </div>
      </div>

      {/* Active Interests Chips & Interactive Customizer Panel */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest mr-1">
            Filtro de Interés:
          </span>
          {userInterests.length === 0 ? (
            <span className="text-xs font-mono text-cyber-pink italic">
              Ninguno seleccionado (Mostrando tendencias generales)
            </span>
          ) : (
            userInterests.map((interest) => (
              <span
                key={interest}
                onClick={() => handleToggleInterest(interest)}
                className="group px-3 py-1 rounded-xl bg-cyber-pink/15 border border-cyber-pink/30 text-cyber-pink text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-cyber-pink/30 transition-all"
                title="Haz clic para quitar este interés"
              >
                <span>{interest}</span>
                <span className="text-cyber-pink/60 group-hover:text-cyber-pink">×</span>
              </span>
            ))
          )}
        </div>

        {/* Expandable Interest Customizer Drawer */}
        {showInterestSelector && (
          <div className="p-6 bg-neutral-950/80 border border-cyber-cyan/30 rounded-3xl backdrop-blur-xl animate-in fade-in slide-in-from-top-3 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase text-cyber-cyan tracking-wider flex items-center gap-2">
                <CheckCircle2 size={14} /> Elige tus intereses principales para afinar las sugerencias:
              </span>
              <button
                onClick={() => setShowInterestSelector(false)}
                className="text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest"
              >
                Cerrar Panel
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {ALL_INTEREST_OPTIONS.map((interest) => {
                const isSelected = userInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => handleToggleInterest(interest)}
                    className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-cyber-pink/20 text-white border border-cyber-pink/60 shadow-[0_0_12px_rgba(255,0,127,0.3)]'
                        : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyber-pink' : 'bg-white/20'}`} />
                    {interest}
                    {isSelected ? <Check size={12} className="text-cyber-pink" /> : <Plus size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs (Todos / Temas / Mercado) */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => {
            cyberSound.playTick();
            setActiveFilter('all');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-white/15 text-white border border-white/20 shadow-md'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          Todos los Elementos
        </button>

        <button
          onClick={() => {
            cyberSound.playTick();
            setActiveFilter('topic');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === 'topic'
              ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users size={14} /> Temas de Comunidad
        </button>

        <button
          onClick={() => {
            cyberSound.playTick();
            setActiveFilter('marketplace');
          }}
          className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeFilter === 'marketplace'
              ? 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/40 shadow-[0_0_12px_rgba(255,0,127,0.2)]'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingBag size={14} /> Mercado Hardware
        </button>
      </div>

      {/* Recommendations Feed Content */}
      {loading ? (
        <div className="py-20 text-center space-y-4 bg-neutral-950/40 rounded-3xl border border-white/5">
          <RefreshCw size={32} className="animate-spin text-cyber-cyan mx-auto" />
          <p className="text-xs font-mono text-white/50 uppercase tracking-widest">
            Analizando tus preferencias y sintetizando feed personalizado...
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-16 text-center space-y-4 bg-neutral-950/40 rounded-3xl border border-white/5 p-8">
          <p className="text-sm text-white/60 font-mono">
            No se encontraron elementos sugeridos para los filtros seleccionados.
          </p>
          <button
            onClick={() => setUserInterests(ALL_INTEREST_OPTIONS.slice(0, 3))}
            className="px-6 py-3 premium-gradient rounded-2xl text-xs font-mono font-bold uppercase text-white cursor-pointer hover:scale-105 transition-all"
          >
            Cargar Intereses por Defecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-[36px] overflow-hidden border border-white/10 hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(0,243,255,0.15)] relative"
            >
              {/* Image Container with Badges */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />

                {/* Match Score Badge */}
                <div className="absolute top-4 left-4 bg-black/80 border border-cyber-cyan/40 px-3 py-1 rounded-full text-[9px] font-mono font-bold text-cyber-cyan backdrop-blur-md flex items-center gap-1">
                  <Zap size={10} className="text-cyber-cyan" />
                  <span>{item.matchScore}% MATCH</span>
                </div>

                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                  {item.type === 'topic' ? (
                    <span className="bg-cyber-cyan/20 border border-cyber-cyan/50 text-cyber-cyan px-2.5 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                      <Users size={10} /> COMUNIDAD
                    </span>
                  ) : (
                    <span className="bg-cyber-pink/20 border border-cyber-pink/50 text-cyber-pink px-2.5 py-1 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1">
                      <ShoppingBag size={10} /> MERCADO
                    </span>
                  )}
                </div>

                {item.badge && (
                  <div className="absolute bottom-3 left-4 bg-cyber-pink/80 text-white text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md shadow-md">
                    {item.badge}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono text-white/40 uppercase tracking-wider">
                    <span>{item.category}</span>
                    {item.author && <span className="text-cyber-cyan font-semibold">{item.author}</span>}
                    {item.price && <span className="text-cyber-pink font-bold text-xs">{item.price}</span>}
                  </div>

                  <h3 className="text-lg font-black font-display uppercase italic text-white group-hover:text-cyber-cyan transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-white/60 font-serif leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Meta details & Action link */}
                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-white/50">
                    {item.membersCount && (
                      <span className="flex items-center gap-1 text-[10px]">
                        <Users size={12} className="text-cyber-cyan" /> {item.membersCount}
                      </span>
                    )}
                    {item.rating && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-400">
                        <Star size={12} fill="currentColor" /> {item.rating} / 5.0
                      </span>
                    )}
                    <span className="text-[9px] text-white/30 uppercase tracking-widest">VERIFICADO</span>
                  </div>

                  <Link
                    to={item.link}
                    onClick={() => cyberSound.playTick()}
                    className="w-full py-3 rounded-2xl bg-white/5 hover:bg-cyber-cyan/20 border border-white/10 hover:border-cyber-cyan/40 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 group-hover:text-cyber-cyan"
                  >
                    <span>{item.type === 'topic' ? 'Unirse al Debate' : 'Ver en Mercado'}</span>
                    <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

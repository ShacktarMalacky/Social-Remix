import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Award, ShoppingBag, Sparkles, LogIn, Wand2, RefreshCw, Check, Palette, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cyberSound } from '../services/soundService';
import { useImmersive } from '../context/ImmersiveContext';
import posthog from '../lib/posthog';

const PRESET_INTERESTS = [
  "Cyberpunk Neon City",
  "Minimalist Zen Garden",
  "Deep Space Nebula",
  "Futuristic Synthwave",
  "Abstract Quantum Architecture",
  "Digital Holographic Aura"
];

export default function Profile() {
  const { handle } = useParams();
  const { user, signInWithGoogle } = useAuth();
  const { isImmersive, toggleImmersive } = useImmersive();

  const profileKey = `elite_profile_bg_${user?.uid || handle || 'default'}`;
  const [backgroundUrl, setBackgroundUrl] = useState<string>(() => {
    return localStorage.getItem(profileKey) || "";
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Cyberpunk Neon City", "Abstract Quantum Architecture"]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (backgroundUrl) {
      localStorage.setItem(profileKey, backgroundUrl);
    }
  }, [backgroundUrl, profileKey]);

  const profileData = {
    displayName: user?.displayName || (handle ? handle : "Elite Creator"),
    photoURL: user?.photoURL || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
    impactScore: 890,
    fansCount: "24.5k",
    verified: true
  };

  const handleToggleInterest = (interest: string) => {
    cyberSound.playTick();
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleGenerateBackground = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    cyberSound.playTick();

    try {
      const interestsStr = selectedInterests.join(', ');
      const response = await fetch('/api/generate-profile-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: interestsStr,
          customPrompt: customPrompt.trim() || undefined,
          aspectRatio: "16:9"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate profile background");
      }

      setBackgroundUrl(data.imageUrl);
      posthog.capture('profile_background_generated', {
        selected_interest_count: selectedInterests.length,
        has_custom_prompt: Boolean(customPrompt.trim())
      });
      cyberSound.playSuccess();
      setSuccessMsg("Neural aura successfully synthesized and applied!");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error("Background generation error:", err);
      setErrorMsg(err.message || "Failed to synthesize background. Please try again.");
      cyberSound.playGlitch();
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user && !handle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10 text-center">
        <div className="w-24 h-24 rounded-[40%] bg-white/5 flex items-center justify-center text-white/10">
          <LogIn size={48} />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black font-display italic uppercase">Establish Identity</h2>
          <p className="text-white/40 max-w-xs mx-auto">Neural authentication is required to access your elite profile.</p>
        </div>
        <button 
          onClick={signInWithGoogle}
          className="px-10 py-6 premium-gradient rounded-full font-black uppercase tracking-widest text-xs shadow-2xl cursor-pointer"
        >
          Begin Neural Entry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-16 pb-40">
      {/* Profile Card with Generated Background Banner */}
      <div className="glass-card rounded-[80px] overflow-hidden p-12 md:p-20 text-center relative group">
        {/* Immersive Mode Quick Toggle Button inside Profile Banner */}
        <div className="absolute top-8 right-8 z-20">
          <button
            onClick={toggleImmersive}
            className="px-5 py-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-cyber-pink text-white text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
            title={isImmersive ? "Salir de Modo Inmersivo" : "Activar Modo Inmersivo sin distracciones"}
          >
            {isImmersive ? (
              <>
                <Minimize2 size={14} className="text-cyber-pink" />
                <span>Vista Normal</span>
              </>
            ) : (
              <>
                <Maximize2 size={14} className="text-cyber-pink" />
                <span>Modo Inmersivo</span>
              </>
            )}
          </button>
        </div>

        {backgroundUrl ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={backgroundUrl} 
              alt="Profile AI Background" 
              className="w-full h-full object-cover filter brightness-75 contrast-115 transition-all duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/60 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-premium/15 via-midnight/40 to-midnight z-0"></div>
        )}

        <div className="relative z-10">
          <div className="relative inline-block">
             <img 
               src={profileData.photoURL} 
               className="w-48 h-48 rounded-[40%] border-8 border-midnight mx-auto shadow-[0_0_50px_rgba(192,132,252,0.3)] object-cover" 
               alt="Profile" 
               referrerPolicy="no-referrer"
             />
             <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-premium rounded-full border-4 border-midnight flex items-center justify-center shadow-xl">
                <Award size={24} className="text-white" />
             </div>
          </div>
          <h1 className="mt-12 text-5xl md:text-6xl font-black italic uppercase font-display premium-text-gradient tracking-tighter drop-shadow-lg">{profileData.displayName}</h1>
          <p className="text-white/40 text-xs font-black uppercase tracking-[0.4em] mt-4">
            {profileData.verified ? 'Verified Digital Human • Core Contributor' : 'Unverified Identity'}
          </p>
          
          <div className="flex justify-center gap-16 mt-16 pt-16 border-t border-white/10">
             <div className="space-y-2">
                <p className="text-5xl font-black font-display tracking-tighter italic">{profileData.fansCount}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Elite Fans</p>
             </div>
             <div className="space-y-2">
                <p className="text-5xl font-black font-display tracking-tighter italic">{profileData.impactScore}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Impact Score</p>
             </div>
          </div>
        </div>
      </div>

      {/* AI Profile Background Synthesizer Panel */}
      {!isImmersive && (
        <div className="glass-card p-10 md:p-14 rounded-[60px] space-y-8 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyber-pink/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-cyber-pink uppercase tracking-[0.3em] flex items-center gap-2">
                <Sparkles size={14} className="animate-spin" /> Neural Image Generator
              </span>
              <h2 className="text-3xl font-black font-display italic uppercase tracking-tight">Personalized Aesthetic Backgrounds</h2>
              <p className="text-sm text-white/50 max-w-xl">
                Synthesize an exquisite high-resolution banner background tailored to your unique interests and creative aura using Gemini Imagen.
              </p>
            </div>
            {backgroundUrl && (
              <button
                onClick={() => {
                  cyberSound.playTick();
                  setBackgroundUrl("");
                  localStorage.removeItem(profileKey);
                }}
                className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-mono font-bold uppercase tracking-widest text-white/60 transition-all border border-white/10 cursor-pointer"
              >
                Reset Default
              </button>
            )}
          </div>

          {/* Interest Tags Selector */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">Select Your Core Interests / Aesthetics:</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_INTERESTS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => handleToggleInterest(interest)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyber-pink/30 to-purple-500/30 text-white border border-cyber-pink/50 shadow-[0_0_15px_rgba(255,0,127,0.2)]'
                        : 'bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyber-pink shadow-[0_0_8px_#ff007f]' : 'bg-white/20'}`} />
                    {interest}
                    {isSelected && <Check size={12} className="text-cyber-pink ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-wider text-white/60 block">Custom Prompt Add-on (Optional):</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g. ethereal silver chrome sculptures under starlight, cinematic 8k..."
                className="flex-1 bg-neutral-950/60 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-cyber-pink/60 focus:ring-1 focus:ring-cyber-pink/30 font-serif"
              />
              <button
                onClick={handleGenerateBackground}
                disabled={isGenerating}
                className="px-8 py-4 premium-gradient rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 cursor-pointer shrink-0"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    Synthesize Aura
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-mono">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-xs font-mono flex items-center gap-2">
              <Check size={14} /> {successMsg}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="glass-card p-12 rounded-[60px] space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-premium">Bio Integration</h3>
            <p className="text-2xl font-serif italic text-white/60 leading-relaxed">
              "Creating worlds through neural synthesis and aesthetic precision. Focused on the convergence of light, sound, and digital soul."
            </p>
         </div>
         <div className="glass-card p-12 rounded-[60px] space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-premium">Active Assets</h3>
            <div className="space-y-4">
               {['Aura Filters', 'Backstage VIP', 'Neural Pack 01'].map(asset => (
                 <div key={asset} className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between">
                    <span className="font-black italic uppercase text-xs">{asset}</span>
                    <ShoppingBag size={18} className="text-white/40" />
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

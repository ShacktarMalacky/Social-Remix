import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Image as ImageIcon, Video, Heart, MessageCircle, Share2, 
  Award, CreditCard, Lock, Eye, ShoppingBag, DollarSign, Sparkles, LogIn, Sparkle, Globe, UserCheck, Maximize2, Minimize2
} from 'lucide-react';
import { generateVeoVideo } from '../services/videoService';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import VideoReactionRecorder, { getFilterStyle } from '../components/VideoReactionRecorder';
import { cyberSound } from '../services/soundService';
import { useImmersive } from '../context/ImmersiveContext';
import TailoredFeed from '../components/TailoredFeed';

export default function SocialPage() {
  const { user, signInWithGoogle } = useAuth();
  const { isImmersive, toggleImmersive } = useImmersive();
  const [posts, setPosts] = useState<any[]>([]);
  const [creationMode, setCreationMode] = useState<'text' | 'image' | 'video'>('text');
  const [videoPrompt, setVideoPrompt] = useState("");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoStyle, setVideoStyle] = useState('none');

  // New publishing states
  const [textContent, setTextContent] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [isPostPremium, setIsPostPremium] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Comments and trends states
  const [openCommentsPostId, setOpenCommentsPostId] = useState<string | null>(null);
  const [recordingPostId, setRecordingPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [commentsMap, setCommentsMap] = useState<{[key: string]: any[]}>({});
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Base list of static mock posts for immediately vibrant feed
  const baseMockPosts = [
    {
      id: 'mock-1',
      userId: 'system-1',
      userName: 'Anya Elite',
      content: 'The minimalist aesthetic in digital workspaces drives unbelievable productivity. Core focus over clutter, everyday. #ETHEREALAURA',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      likes: 135,
      isPremium: true,
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
      createdAt: { toDate: () => new Date(Date.now() - 3600000 * 2) }
    },
    {
      id: 'mock-2',
      userId: 'system-2',
      userName: 'Marco K.',
      content: 'Just analyzed the raw outputs of our neural displays. Sub-millisecond latent response times achieved! This hardware release will redefine spatial interaction. #VEOGENERATION',
      likes: 88,
      isPremium: false,
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80',
      createdAt: { toDate: () => new Date(Date.now() - 3600000 * 5) }
    }
  ];

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  // Listen to comments on active posts
  useEffect(() => {
    if (posts.length === 0) return;
    
    const unsubscribes = posts.map(post => {
      const commentsQuery = query(
        collection(db, 'posts', post.id, 'comments'),
        orderBy('createdAt', 'asc')
      );
      return onSnapshot(commentsQuery, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCommentsMap(prev => ({
          ...prev,
          [post.id]: commentsData
        }));
      });
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [posts]);

  const handleCreateVideo = async () => {
    if (!videoPrompt.trim() || !user) return;
    setIsGeneratingVideo(true);
    try {
      const url = await generateVeoVideo(videoPrompt, '16:9', '720p', videoStyle);
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || 'Elite Member',
        userAvatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
        content: `Veo Generation: ${videoPrompt} #VEOGENERATION`,
        video: url,
        isPremium: isPostPremium,
        likes: 0,
        createdAt: serverTimestamp()
      });
      setVideoPrompt("");
      setCreationMode('text');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleCustomPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (creationMode === 'text' && !textContent.trim()) return;
    if (creationMode === 'image' && !imagePrompt.trim()) return;

    setIsPublishing(true);
    try {
      let imageUrl = "";
      let textToPublish = textContent;

      if (creationMode === 'image') {
        // High end placeholder image pool that beautifully reinforces elite luxury-architecture / cyberpunk aesthetics
        const curatedAestheticPool = [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
        ];
        imageUrl = curatedAestheticPool[Math.floor(Math.random() * curatedAestheticPool.length)];
        textToPublish = `${imagePrompt} #ETHEREALAURA`;
      }

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        userName: user.displayName || 'Elite Member',
        userAvatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
        content: textToPublish,
        image: imageUrl || null,
        isPremium: isPostPremium,
        likes: 0,
        createdAt: serverTimestamp()
      });

      setTextContent("");
      setImagePrompt("");
      setIsPostPremium(false);
    } catch (err) {
      console.error("Publishing error: ", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    // Check if mock post or real database post
    if (postId.startsWith('mock-')) return;

    try {
      await updateDoc(doc(db, 'posts', postId), {
        likes: increment(1)
      });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handlePublishComment = async (postId: string) => {
    if (!commentInput.trim() || !user) return;

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: user.uid,
        userName: user.displayName || 'Elite user',
        userAvatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
        text: commentInput,
        createdAt: serverTimestamp()
      });
      setCommentInput("");
    } catch (err) {
      console.error("Commenting error:", err);
    }
  };

  const handlePublishVideoReaction = async (postId: string, text: string, videoBase64: string, filterId?: string) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        userId: user.uid,
        userName: user.displayName || 'Elite User',
        userAvatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80',
        text: text,
        video: videoBase64,
        filter: filterId || 'normal',
        createdAt: serverTimestamp()
      });
      setRecordingPostId(null);
    } catch (err) {
      console.error("Video reaction save error:", err);
      throw err;
    }
  };

  // Combine database posts with base mock posts
  const combinedPosts = [...posts, ...baseMockPosts].filter(post => {
    if (!activeTag) return true;
    return post.content.toUpperCase().includes(activeTag.toUpperCase());
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      {/* Sidebar - Profile status (Hidden in Immersive Mode for zero distractions) */}
      {!isImmersive && (
        <aside className="lg:col-span-3 space-y-10">
          <div className="glass-card rounded-[60px] overflow-hidden p-10 text-center relative group backdrop-blur-md">
            <div className="h-32 premium-gradient opacity-20 -mx-10 -mt-10 mb-8 relative">
              <div className="absolute inset-0 bg-radial-gradient from-transparent to-midnight"></div>
            </div>
            {user ? (
              <>
                <img 
                  src={user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80'} 
                  className="w-24 h-24 rounded-[40%] mx-auto border-4 border-midnight -mt-20 shadow-xl object-cover hover:rotate-6 transition-transform duration-500" 
                  alt="Your Profile" 
                  referrerPolicy="no-referrer"
                />
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[7px] font-black uppercase tracking-[0.3em] text-green-400">Live Connection</span>
                </div>
                <h2 className="mt-3 text-2xl font-black italic uppercase font-display premium-text-gradient">{user.displayName || 'Elite Member'}</h2>
              </>
            ) : (
              <div className="space-y-6">
                <div className="w-24 h-24 rounded-[40%] mx-auto bg-white/5 flex items-center justify-center -mt-20 shadow-xl border-4 border-midnight">
                  <Lock size={32} className="text-white/20" />
                </div>
                <button 
                  onClick={signInWithGoogle}
                  className="w-full py-4 premium-gradient rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-white shadow-lg"
                >
                  <LogIn size={16} /> Neural Entry
                </button>
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
              <div>
                <p className="font-black text-2xl tracking-tighter">1.2K</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">Fans</p>
              </div>
              <div>
                <p className="font-black text-2xl tracking-tighter">450</p>
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-30">Impact</p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Social Feed */}
      <main className={`space-y-10 transition-all duration-500 ${
        isImmersive ? 'lg:col-span-12 max-w-3xl mx-auto w-full' : 'lg:col-span-9'
      }`}>
        {/* Immersive Mode Status Header Banner */}
        {isImmersive && (
          <div className="p-4 px-6 bg-cyber-pink/10 border border-cyber-pink/30 rounded-full flex items-center justify-between text-xs font-mono text-cyber-pink animate-in fade-in slide-in-from-top-3">
            <span className="flex items-center gap-2 font-bold tracking-wider">
              <Sparkles size={14} className="animate-spin text-cyber-pink" /> MODO LECTURA INMERSIVO ACTIVO
            </span>
            <button
              onClick={toggleImmersive}
              className="text-[9px] uppercase font-bold tracking-widest bg-cyber-pink/20 hover:bg-cyber-pink/40 px-3.5 py-1.5 rounded-full text-white transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Minimize2 size={12} /> Salir (ESC)
            </button>
          </div>
        )}
        
        {/* Creator panel */}
        <div className="glass-card rounded-[50px] p-8 md:p-10 space-y-8 backdrop-blur-md">
          <div className="flex gap-3 bg-white/5 p-1 rounded-3xl">
            {['text', 'image', 'video'].map(mode => (
              <button 
                key={mode} 
                onClick={() => setCreationMode(mode as any)}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${creationMode === mode ? 'premium-gradient text-white shadow-md' : 'text-white/40 hover:text-white hover:bg-white/[0.02]'}`}
              >
                {mode === 'video' ? <Video size={14} className="inline mr-2" /> : mode === 'image' ? <ImageIcon size={14} className="inline mr-2" /> : <Sparkle size={14} className="inline mr-2" />}
                {mode}
              </button>
            ))}
          </div>

          {!user ? (
            <div className="py-6 text-center space-y-4">
              <Lock className="mx-auto text-premium/30 animate-bounce" size={24} />
              <p className="text-xs uppercase font-black tracking-widest text-white/30">Neural Authentication Required to Speak</p>
              <button onClick={signInWithGoogle} className="text-[10px] font-black uppercase tracking-widest text-premium underline">Connect Frequency</button>
            </div>
          ) : (
            <div className="space-y-6">
              {creationMode === 'text' && (
                <form onSubmit={handleCustomPublish} className="space-y-4 animate-in fade-in duration-200">
                  <textarea 
                    placeholder="Broadcast your digital vision onto the private network..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg font-serif italic outline-none focus:border-premium/30 transition-all min-h-[100px] text-white"
                  />
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isPostPremium} 
                        onChange={(e) => setIsPostPremium(e.target.checked)}
                        className="rounded-lg bg-white/5 border-white/10 text-premium focus:ring-premium focus:ring-offset-0" 
                      />
                      <span className="text-[9px] font-black uppercase tracking-wider text-premium flex items-center gap-1">
                        <Lock size={12} /> Encrypt for Premium Access
                      </span>
                    </label>
                    <button 
                      type="submit"
                      disabled={isPublishing || !textContent.trim()}
                      className="w-full sm:w-auto px-8 py-3.5 premium-gradient rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-transform text-white"
                    >
                      {isPublishing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={12} />}
                      Publish Feed
                    </button>
                  </div>
                </form>
              )}

              {creationMode === 'image' && (
                <form onSubmit={handleCustomPublish} className="space-y-4 animate-in fade-in duration-200">
                  <textarea 
                    placeholder="Descriptive image synthesis query... (e.g., Ethereal architecture over brutalist Tokyo skyline)"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg font-serif italic outline-none focus:border-premium/30 transition-all min-h-[100px] text-white"
                  />
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={isPostPremium} 
                        onChange={(e) => setIsPostPremium(e.target.checked)}
                        className="rounded bg-white/5 border-white/10 text-premium" 
                      />
                      <span className="text-[9px] font-black uppercase tracking-wider text-premium flex items-center gap-1">
                        <Lock size={12} /> Encrypt Image Post
                      </span>
                    </label>
                    <button 
                      type="submit"
                      disabled={isPublishing || !imagePrompt.trim()}
                      className="w-full sm:w-auto px-8 py-3.5 premium-gradient rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-transform text-white"
                    >
                      {isPublishing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Sparkles size={12} />}
                      Synthesize Art
                    </button>
                  </div>
                </form>
              )}

              {creationMode === 'video' && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <textarea 
                    placeholder="Provide a detailed cinematic prompt for Veo Gen 3.1..."
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-lg font-serif italic outline-none focus:border-premium/30 transition-all min-h-[100px] text-white"
                  />
                  <div className="flex flex-col sm:flex-row gap-4">
                     <select 
                       value={videoStyle} 
                       onChange={(e) => setVideoStyle(e.target.value)} 
                       className="bg-midnight border border-white/10 rounded-2xl px-5 py-3 text-xs font-bold text-white/70 focus:border-premium/30 outline-none"
                     >
                        <option value="none">Default Organic</option>
                        <option value="cinematic_noir">Cinematic Noir Shadow</option>
                        <option value="cyberpunk_elite">Cyberpunk Elite Aura</option>
                     </select>
                     <button 
                       onClick={handleCreateVideo}
                       disabled={isGeneratingVideo || !videoPrompt.trim()}
                       className="flex-grow py-3.5 premium-gradient rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all text-white"
                     >
                       {isGeneratingVideo ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={14} />}
                       {isGeneratingVideo ? 'Processing Neurals...' : 'Generate with Veo'}
                     </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Tag Identifier Notification */}
        {activeTag && (
          <div className="p-6 bg-premium/10 border border-premium/20 rounded-[30px] flex items-center justify-between animate-in slide-in-from-top-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-premium">Currently filtering: {activeTag}</span>
            <button onClick={() => setActiveTag(null)} className="text-[9px] font-black uppercase text-white/50 hover:text-white underline">Reset Filter</button>
          </div>
        )}

        {/* Combined Social Feed list */}
        <AnimatePresence mode="popLayout">
          {combinedPosts.map(post => (
            <motion.article 
              key={post.id} 
              layout
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card rounded-[60px] p-8 md:p-12 space-y-8 relative overflow-hidden backdrop-blur-md glitch-entrance neon-pulse-glow"
            >
              {post.isPremium && (
                <div className="absolute top-8 right-8 px-4 py-1.5 bg-premium/10 border border-premium/30 rounded-full flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-premium">
                  <Lock size={10} /> Encrypted
                </div>
              )}

              <div className="flex gap-4 md:gap-6 items-center">
                <img 
                  src={post.userAvatar} 
                  className="w-14 h-14 md:w-16 md:h-16 rounded-[40%] object-cover border-4 border-midnight shadow-lg" 
                  alt={post.userName} 
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="font-black text-xl md:text-2xl italic font-display uppercase text-white">{post.userName}</h3>
                  <p className="text-[9px] text-white/20 uppercase tracking-[0.25em]">{post.createdAt?.toDate?.() ? post.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Verified Network'}</p>
                </div>
              </div>

              <p className="text-xl md:text-2xl font-serif italic leading-relaxed text-white/90">{post.content}</p>
              
              {post.image && (
                <div className="rounded-[35px] overflow-hidden shadow-2xl border border-white/5 relative group bg-black">
                  <img 
                    src={post.image} 
                    className="w-full h-auto object-cover max-h-[450px] group-hover:scale-105 transition-transform duration-700" 
                    alt="Ethereal Vision" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {post.video && (
                <div className="rounded-[35px] overflow-hidden shadow-2xl bg-black border border-white/5">
                  <video src={post.video} controls className="w-full h-auto" crossOrigin="anonymous" />
                </div>
              )}

              <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                <button 
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2.5 text-white/40 hover:text-red-400 transition-colors cursor-pointer group"
                  id={`like-btn-${post.id}`}
                >
                  <Heart size={18} className={post.likes > 0 ? "fill-red-400 text-red-400 scale-110" : "group-hover:scale-115 transition-transform"} /> 
                  <span className="text-[10px] font-black">{post.likes}</span>
                </button>
                <button 
                  onClick={() => {
                    cyberSound.playTick();
                    setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id);
                  }}
                  className={`flex items-center gap-2.5 text-white/40 hover:text-premium transition-all cursor-pointer ${openCommentsPostId === post.id ? 'text-premium' : ''}`}
                  id={`comment-btn-${post.id}`}
                >
                  <MessageCircle size={18} />
                  <span className="text-[10px] font-black">{(commentsMap[post.id] || []).length}</span>
                </button>
                <button 
                  onClick={() => {
                    cyberSound.playTick();
                    if (!user) {
                      signInWithGoogle();
                      return;
                    }
                    setOpenCommentsPostId(post.id);
                    setRecordingPostId(recordingPostId === post.id ? null : post.id);
                  }}
                  className={`flex items-center gap-2 border border-cyber-pink/20 bg-cyber-pink/5 px-2.5 py-1.5 rounded-full text-white/50 hover:text-cyber-pink hover:border-cyber-pink/40 hover:bg-cyber-pink/10 transition-all cursor-pointer ${
                    recordingPostId === post.id ? 'text-cyber-pink border-cyber-pink/50 bg-cyber-pink/15 shadow-[0_0_10px_rgba(255,0,127,0.25)] font-mono' : ''
                  }`}
                  id={`video-reaction-btn-${post.id}`}
                >
                  <Video size={14} className={recordingPostId === post.id ? 'text-cyber-pink animate-pulse' : 'text-white/40'} />
                  <span className="text-[9px] uppercase tracking-wider font-mono">Video Reaction</span>
                </button>
              </div>

              {/* Reactive Sub-comment Flow */}
              {openCommentsPostId === post.id && (
                <div className="pt-6 border-t border-white/5 space-y-6 animate-in slide-in-from-top-4 duration-300">
                  <h4 className="text-[8.5px] font-black uppercase tracking-[0.3em] text-premium">Neural Echoes</h4>
                  
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-none">
                    {(!commentsMap[post.id] || commentsMap[post.id].length === 0) ? (
                      <p className="text-[9px] text-white/20 uppercase tracking-widest pl-2">No echoes recorded yet. Be the first...</p>
                    ) : (
                      commentsMap[post.id].map((comment) => (
                        <div key={comment.id} className="flex gap-3 pl-2 py-3 border-l border-white/5 comment-glitch">
                          <img 
                            src={comment.userAvatar} 
                            className="w-8 h-8 rounded-[35%] object-cover border-2 border-midnight animate-pulse" 
                            alt="" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-1 w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase italic text-white/60">{comment.userName}</span>
                              <span className="text-[7px] text-white/20 uppercase">
                                {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Rec'}
                              </span>
                            </div>
                            {comment.text && <p className="text-xs font-serif italic text-white/80">{comment.text}</p>}
                            {comment.video && (
                              <div className="mt-2 rounded-2xl overflow-hidden border border-white/10 max-w-[280px] shadow-lg bg-black/50 relative group">
                                <video 
                                  src={comment.video} 
                                  controls 
                                  className="w-full h-auto max-h-[180px] object-cover" 
                                  style={{ filter: getFilterStyle(comment.filter) }}
                                />
                                {comment.filter && comment.filter !== 'normal' && (
                                  <span className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[6.5px] font-mono font-bold border border-[#ff007f]/30 uppercase text-cyber-pink tracking-widest">
                                    {comment.filter}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {recordingPostId === post.id && user ? (
                    <div className="pt-2 animate-in slide-in-from-bottom-4 duration-300">
                      <VideoReactionRecorder 
                        postId={post.id}
                        onReactionPosted={(text, videoBase64, filterId) => handlePublishVideoReaction(post.id, text, videoBase64, filterId)}
                        onCancel={() => setRecordingPostId(null)}
                      />
                    </div>
                  ) : user ? (
                    <div className="relative pt-2">
                      <input 
                        type="text" 
                        placeholder="Project your echo..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePublishComment(post.id)}
                        className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-xs outline-none focus:border-premium/50 text-white font-serif italic"
                        id={`comment-input-${post.id}`}
                      />
                      <button 
                        onClick={() => handlePublishComment(post.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-premium rounded-full text-white hover:scale-105 active:scale-95 transition-transform"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-3 bg-white/5 rounded-2xl">
                      <p className="text-[8.5px] font-black uppercase tracking-widest text-white/30">Log in to post a comment</p>
                    </div>
                  )}
                </div>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </main>

      {/* Right Sidebar - Trends and Filtering */}
      <aside className="lg:col-span-3 space-y-10">
        <div className="glass-card rounded-[50px] p-10 space-y-8 backdrop-blur-md">
           <div className="flex items-center justify-between">
             <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-premium">Trends</h3>
             <Globe size={14} className="text-premium/50" />
           </div>
           <ul className="space-y-6">
              {[
                { tag: '#VEOGENERATION', count: '2.4K Postings' },
                { tag: '#ETHEREALAURA', count: '1.2K Postings' }
              ].map((item, i) => (
                <li 
                  key={i} 
                  onClick={() => setActiveTag(activeTag === item.tag ? null : item.tag)}
                  className={`flex flex-col gap-1 p-3 rounded-2xl cursor-pointer transition-all border ${activeTag === item.tag ? 'bg-premium/10 border-premium/20 text-premium scale-102 shadow-md' : 'border-transparent hover:bg-white/5 text-white/80'}`}
                  id={`trend-item-${i}`}
                >
                  <span className="text-sm font-black italic">{item.tag}</span>
                  <span className="text-[8.5px] opacity-30 uppercase tracking-[0.15em]">{item.count}</span>
                </li>
              ))}
           </ul>
        </div>
      </aside>

      {/* Tailored Feed Suggestions Section */}
      <div className="col-span-1 lg:col-span-12 pt-10 border-t border-white/10">
        <TailoredFeed />
      </div>
    </div>
  );
}

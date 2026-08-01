import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, Send, Plus, Search, Lock, LogIn } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, or } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user, signInWithGoogle } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [activeRecipient, setActiveRecipient] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<any>();

  useEffect(() => {
    socketRef.current = io();

    if (user) {
      socketRef.current.emit('register', { 
        id: user.uid, 
        name: user.displayName || 'Elite', 
        avatar: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}` 
      });
    }

    socketRef.current.on('presence_update', (users: any[]) => {
      setOnlineUsers(users.filter(u => u.id !== user?.uid));
    });

    return () => socketRef.current.disconnect();
  }, [user]);

  useEffect(() => {
    if (!user || !activeRecipient) return;

    const q = query(
      collection(db, 'messages'),
      or(
        where('fromId', '==', user.uid),
        where('toId', '==', user.uid)
      ),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((m: any) => 
          (m.fromId === user.uid && m.toId === activeRecipient.id) || 
          (m.fromId === activeRecipient.id && m.toId === user.uid)
        );
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, activeRecipient]);

  const sendMessage = async () => {
    if (!input.trim() || !activeRecipient || !user) return;
    
    const text = input;
    setInput("");

    try {
      await addDoc(collection(db, 'messages'), {
        text,
        fromId: user.uid,
        toId: activeRecipient.id,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error("Message send error:", err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex h-[80vh] gap-10">
      {/* Thread List */}
      <aside className="w-1/3 glass-card rounded-[50px] overflow-hidden flex flex-col">
        <div className="p-10 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-premium">Online Elite</h2>
          {user ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-premium/10 rounded-full border border-premium/20">
               <div className="w-2 h-2 bg-premium rounded-full animate-pulse"></div>
               <span className="text-[8px] font-black uppercase text-premium">{onlineUsers.length} active</span>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="text-[8px] font-black uppercase text-white/40 hover:text-white transition-colors">Enter</button>
          )}
        </div>
        <div className="p-10 flex-grow space-y-4 overflow-y-auto">
           {!user && (
             <div className="text-center py-10 space-y-4">
                <Lock size={24} className="mx-auto text-white/10" />
                <p className="text-[10px] text-white/20 uppercase tracking-widest">Login to see users</p>
                <button onClick={signInWithGoogle} className="text-[8px] font-black uppercase text-premium underline">Connect Neural Link</button>
             </div>
           )}
           {user && onlineUsers.length === 0 && (
             <p className="text-[10px] text-white/20 uppercase text-center py-10 tracking-widest">Waiting for other peers...</p>
           )}
           {user && onlineUsers.map(user => (
             <div 
               key={user.id} 
               onClick={() => setActiveRecipient(user)}
               className={`p-6 rounded-3xl cursor-pointer transition-all flex items-center gap-4 ${activeRecipient?.id === user.id ? 'bg-premium/10 border border-premium/20' : 'bg-white/5 hover:bg-white/10 border border-transparent'}`}
             >
                <div className="relative">
                  <img src={user.avatar} className="w-12 h-12 rounded-2xl object-cover" alt={user.name} />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-midnight"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-black italic uppercase text-xs">{user.name}</span>
                  <span className="text-[8px] uppercase tracking-widest text-white/30">Available</span>
                </div>
             </div>
           ))}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-grow glass-card rounded-[50px] overflow-hidden flex flex-col">
        {activeRecipient ? (
          <>
            <div className="p-10 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={activeRecipient.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                <div>
                   <h2 className="text-xs font-black uppercase tracking-widest italic">{activeRecipient.name}</h2>
                   <p className="text-[8px] uppercase text-premium font-black">Secure Neural Link Established</p>
                </div>
              </div>
              <button className="text-white/20 hover:text-white transition-colors">
                <Search size={18} />
              </button>
            </div>
            
            <div className="flex-grow p-10 overflow-y-auto space-y-8 scrollbar-hide">
               {messages.length === 0 && (
                 <div className="flex flex-col items-center justify-center h-full opacity-20">
                   <MessageCircle size={48} className="mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-[0.5em]">Start an elite dialogue</p>
                 </div>
               )}
               {messages.map(m => (
                 <div key={m.id} className={`flex flex-col gap-2 ${m.fromId === user?.uid ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-3">
                      {m.fromId !== user?.uid && <span className="text-[10px] font-black uppercase tracking-widest text-premium">{activeRecipient.name}</span>}
                      <span className="text-[8px] text-white/20 uppercase tracking-widest">{m.timestamp?.toDate?.() ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                    </div>
                    <p className={`p-6 bg-white/5 rounded-3xl italic font-serif text-lg max-w-[80%] ${m.fromId === user?.uid ? 'rounded-tr-none bg-premium/10 border border-premium/20' : 'rounded-tl-none border border-white/5'}`}>
                      {m.text}
                    </p>
                 </div>
               ))}
            </div>

            <div className="p-10 pt-0">
              <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Whisper to ${activeRecipient.name}...`}
                  className="w-full bg-white/10 border border-white/5 rounded-full px-10 py-6 text-xl outline-none focus:border-premium/50 transition-all font-serif italic"
                />
                <button 
                  onClick={sendMessage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 premium-gradient rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  <Send size={20} className="text-white" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
             <div className="w-32 h-32 rounded-[40%] bg-white/5 flex items-center justify-center text-white/10">
                <MessageCircle size={64} />
             </div>
             <div className="text-center">
                <h3 className="text-xl font-black italic uppercase font-display premium-text-gradient mb-2">Private Frequency</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 max-w-xs">Select a verified member to initiate a neural link.</p>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

export default function Atmosphere() {
  const [particles, setParticles] = useState<{ id: number; left: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate organic glowing matrix cyber-signals on mount
    const initialParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 3 + 2}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 15 + 10}s`
    }));
    setParticles(initialParticles);
  }, []);

  return (
    <div className="atmosphere-bg">
      {/* Laser-lit dynamic background grids */}
      <div className="cyber-grid" />

      {/* Futuristic floating glass glows */}
      <div 
        className="atmosphere-glow bg-cyber-pink" 
        style={{ top: '-15%', left: '-5%', animationDelay: '0s', width: '1000px', height: '1000px' }} 
      />
      <div 
        className="atmosphere-glow bg-cyber-cyan" 
        style={{ bottom: '-15%', right: '-10%', animationDelay: '-6s', width: '900px', height: '900px' }} 
      />
      <div 
        className="atmosphere-glow bg-cyber-purple opacity-[0.1]" 
        style={{ top: '35%', left: '25%', width: '700px', height: '700px', animationDelay: '-12s' }} 
      />

      {/* Cybernetic holographic particles drifting upwards */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-cyber-cyan opacity-40 shadow-[0_0_10px_#00f3ff]"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              bottom: '-20px',
              animation: `upward ${p.duration} infinite linear`,
              animationDelay: p.delay
            }}
          />
        ))}
      </div>

      {/* Dynamic scanlines layer filter */}
      <div className="scanlines"></div>

      <style>{`
        @keyframes upward {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-110vh) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

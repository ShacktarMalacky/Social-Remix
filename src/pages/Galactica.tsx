import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Sparkles, Trophy, Award, Target, Battery, RefreshCw, Cpu, ChevronRight } from 'lucide-react';

interface Upgrade {
  id: string;
  name: string;
  cost: number;
  level: number;
  maxLevel: number;
  desc: string;
}

interface TelemetryLog {
  time: string;
  message: string;
  type: 'info' | 'warn' | 'success' | 'danger';
}

export default function Galactica() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [nanites, setNanites] = useState(() => {
    const saved = localStorage.getItem('galactica_nanites');
    return saved ? parseInt(saved, 10) : 50; // default initial nano balance
  });
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('galactica_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [controlType, setControlType] = useState<'mouse_touch' | 'keyboard'>('mouse_touch');

  // Telemetry logs state
  const [logs, setLogs] = useState<TelemetryLog[]>([
    { time: '00:00:01', message: 'Hyper-drive preloaded. Systems online.', type: 'info' },
    { time: '00:00:03', message: 'Ready to establish neural linkage with Elite Fighter Core.', type: 'success' }
  ]);

  // Audio web synthesis ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Persistent dynamic upgrades
  const [upgrades, setUpgrades] = useState<Upgrade[]>(() => {
    const saved = localStorage.getItem('galactica_upgrades');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      { id: 'fireRate', name: 'Laser Fire-Rate', cost: 15, level: 1, maxLevel: 8, desc: 'Increases velocity and pulse rate of the photostatic beam.' },
      { id: 'shields', name: 'Shield Capacitance', cost: 25, level: 1, maxLevel: 8, desc: 'Strengthens electromagnetic hull structure to absorb more impacts.' },
      { id: 'magnet', name: 'Nanite Magnetism', cost: 20, level: 1, maxLevel: 5, desc: 'Broadens atomic collection scope for golden nanites from afar.' },
      { id: 'shipClass', name: 'Dual Heavy Plasma', cost: 100, level: 0, maxLevel: 1, desc: 'Splits main weapon stream into twin hyper-cannons.' }
    ];
  });

  // Level attributes extrapolated from upgrades
  const getFireRateMs = () => {
    const lValue = upgrades.find(u => u.id === 'fireRate')?.level || 1;
    return Math.max(120, 350 - (lValue * 28));
  };

  const getMaxShield = () => {
    const lValue = upgrades.find(u => u.id === 'shields')?.level || 1;
    return 100 + (lValue - 1) * 35;
  };

  const getMagnetRange = () => {
    const lValue = upgrades.find(u => u.id === 'magnet')?.level || 1;
    return 50 + lValue * 35;
  };

  const hasDualLasers = () => {
    return (upgrades.find(u => u.id === 'shipClass')?.level || 0) >= 1;
  };

  // Keyboard state
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Real-time loop parameters (using ref for extreme frame integrity and zero React rendering choke during 60FPS loops)
  const gameRef = useRef({
    player: { x: 0, y: 0, w: 32, h: 32, shield: 100, maxShield: 100, targetX: 0, targetY: 0 },
    lasers: [] as Array<{ x: number, y: number, w: number, h: number, dy: number, dx: number, color: string }>,
    enemies: [] as Array<{ id: string, x: number, y: number, w: number, h: number, type: 'basic' | 'viper' | 'titan', hp: number, maxHp: number, speedX: number, speedY: number, fireCooldown: number }>,
    enemyLasers: [] as Array<{ x: number, y: number, w: number, h: number, dy: number, dx: number }>,
    particles: [] as Array<{ x: number, y: number, vx: number, vy: number, alpha: number, color: string, size: number, decay: number }>,
    naniteDrops: [] as Array<{ x: number, y: number, size: number, collected: boolean }>,
    stars: [] as Array<{ x: number, y: number, size: number, speed: number, alpha: number }>,
    lastFireTime: 0,
    spawnTimer: 0,
    bossSpawned: false,
    scoreRef: 0,
    nanitesAwardedThisRun: 0,
    elapsedFrames: 0
  });

  // Sound generator
  const playSoundEffect = (type: 'laser' | 'hit' | 'explosion' | 'powerup' | 'gameover') => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(90, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'explosion') {
        // High quality simulated explosion
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'powerup') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        // Classic retro arpeggio notes
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(261.63, now); // C
        osc.frequency.setValueAtTime(329.63, now + 0.08); // E
        osc.frequency.setValueAtTime(392.00, now + 0.16); // G
        osc.frequency.setValueAtTime(523.25, now + 0.24); // High C
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(now + 0.35);
      } else if (type === 'gameover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {
      console.warn('Audio Context block:', e);
    }
  };

  const addTelemetryLog = (message: string, type: 'info' | 'warn' | 'success' | 'danger') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [
      { time: timeStr, message, type },
       ...prev.slice(0, 10) // Cache up to top 11 logs for perfect performance
    ]);
  };

  // Upgrades buying mechanism
  const buyUpgrade = (upgradeId: string) => {
    const updated = upgrades.map(u => {
      if (u.id === upgradeId) {
        if (u.level < u.maxLevel && nanites >= u.cost) {
          const nextLevel = u.level + 1;
          const newCost = Math.round(u.cost * 1.8);
          const nextNaniteBalance = nanites - u.cost;
          setNanites(nextNaniteBalance);
          localStorage.setItem('galactica_nanites', nextNaniteBalance.toString());
          
          playSoundEffect('powerup');
          addTelemetryLog(`Upgrade installed: ${u.name} reached Level ${nextLevel}`, 'success');
          
          return { ...u, level: nextLevel, cost: newCost };
        }
      }
      return u;
    });
    setUpgrades(updated);
    localStorage.setItem('galactica_upgrades', JSON.stringify(updated));
  };

  // Keyboard events listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      keysRef.current[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'Space', 'ArrowLeft', 'ArrowRight'].includes(e.key) && isPlaying) {
        e.preventDefault(); // prevent ambient scrolling
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying]);

  // Initiate default starfields
  useEffect(() => {
    const tempStars = [];
    for (let i = 0; i < 150; i++) {
      tempStars.push({
        x: Math.random() * 800,
        y: Math.random() * 800,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2
      });
    }
    gameRef.current.stars = tempStars;
  }, []);

  // Main game core loop handler
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Rescale to target dimensional scale
    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 550;

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    const checkCollision = (rect1: { x: number, y: number, w: number, h: number }, rect2: { x: number, y: number, w: number, h: number }) => {
      return rect1.x < rect2.x + rect2.w &&
             rect1.x + rect1.w > rect2.x &&
             rect1.y < rect2.y + rect2.h &&
             rect1.y + rect1.h > rect2.y;
    };

    // Pre-seed ship coordinate
    gameRef.current.player.x = canvas.width / 2;
    gameRef.current.player.y = canvas.height * 0.8;
    gameRef.current.player.targetX = gameRef.current.player.x;
    gameRef.current.player.targetY = gameRef.current.player.y;

    const loop = () => {
      const p = gameRef.current.player;
      const g = gameRef.current;
      g.elapsedFrames++;

      // Clear Canvas with sleek Cyberpunk grid alpha backdrop
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render Cyberpunk Neon Grid
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.03)';
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      const scrollOffset = (g.elapsedFrames * 1.5) % gridSpacing;
      for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = scrollOffset; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 1. Particle & starfield scrolling logic
      g.stars.forEach(star => {
        // Star movement simulates infinite galactic space travel
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (isPlaying && !isGameOver) {
        // Player controls interpolation handles lag-free continuous play
        if (controlType === 'mouse_touch') {
          // Smoothly glide position to target coords
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          p.x += dx * 0.15;
          p.y += dy * 0.15;
        } else {
          // Robust keyboard controls
          const keyboardSpeed = 6;
          if (keysRef.current['ArrowLeft'] || keysRef.current['a'] || keysRef.current['KeyA']) {
            p.x -= keyboardSpeed;
          }
          if (keysRef.current['ArrowRight'] || keysRef.current['d'] || keysRef.current['KeyD']) {
            p.x += keyboardSpeed;
          }
          if (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current['KeyW']) {
            p.y -= keyboardSpeed;
          }
          if (keysRef.current['ArrowDown'] || keysRef.current['s'] || keysRef.current['KeyS']) {
            p.y += keyboardSpeed;
          }
        }

        // Clamp inside bounds safely
        p.x = Math.max(20, Math.min(canvas.width - 20, p.x));
        p.y = Math.max(50, Math.min(canvas.height - 50, p.y));

        // 2. Weapon logic: continuous laser dispatch
        const now = Date.now();
        const fireRateMs = getFireRateMs();
        const autoFire = controlType === 'mouse_touch' || keysRef.current[' '] || keysRef.current['Space'];
        
        if (autoFire && now - g.lastFireTime > fireRateMs) {
          g.lastFireTime = now;
          playSoundEffect('laser');
          
          if (hasDualLasers()) {
            // Discharges dual heavy lasers
            g.lasers.push({
              x: p.x - 14,
              y: p.y - 10,
              w: 3,
              h: 18,
              dy: -12,
              dx: 0,
              color: '#00ffff'
            });
            g.lasers.push({
              x: p.x + 11,
              y: p.y - 10,
              w: 3,
              h: 18,
              dy: -12,
              dx: 0,
              color: '#00ffff'
            });
          } else {
            // Standard central laser beam
            g.lasers.push({
              x: p.x - 1.5,
              y: p.y - 15,
              w: 3.5,
              h: 16,
              dy: -11,
              dx: 0,
              color: '#bf55ec'
            });
          }
        }

        // 3. Enemy creation / Waves balance curve
        g.spawnTimer++;
        const currentCap = 8 + Math.floor(score / 500);
        if (g.spawnTimer % Math.max(20, 75 - Math.floor(score / 150)) === 0 && g.enemies.length < currentCap) {
          // Generate a custom cyber enemy
          const enemyTypeRand = Math.random();
          let type: 'basic' | 'viper' | 'titan' = 'basic';
          let hp = 1;
          let w = 26;
          let h = 26;
          let speedX = (Math.random() - 0.5) * 1.5;
          let speedY = Math.random() * 1.5 + 1.2;

          if (enemyTypeRand > 0.8 && score > 300) {
            type = 'viper';
            hp = 3;
            w = 32;
            h = 32;
            speedX = (Math.random() - 0.5) * 3;
            speedY = Math.random() * 2 + 1.5;
          }

          // Trigger massive boss at 1500 score mark milestone
          if (score > 1000 && !g.bossSpawned && score % 1500 < 200) {
            type = 'titan';
            hp = 22 + Math.floor(score / 200);
            w = 70;
            h = 50;
            speedX = 1.2;
            speedY = 0.4;
            g.bossSpawned = true;
            addTelemetryLog('WARNING: Cosmic Dreadnought entering localized quadrant!', 'warn');
          }

          g.enemies.push({
            id: Math.random().toString(),
            x: Math.random() * (canvas.width - 60) + 30,
            y: -50,
            w,
            h,
            type,
            hp,
            maxHp: hp,
            speedX,
            speedY,
            fireCooldown: Math.random() * 120 + 60
          });
        }

        // 4. Update core lasers and collision models
        g.lasers.forEach((laser, lIndex) => {
          laser.y += laser.dy;
          laser.x += laser.dx;

          if (laser.y < -30) {
            g.lasers.splice(lIndex, 1);
            return;
          }

          // Draw Glowing Lasers
          ctx.shadowBlur = 10;
          ctx.shadowColor = laser.color;
          ctx.fillStyle = laser.color;
          ctx.fillRect(laser.x, laser.y, laser.w, laser.h);
          ctx.shadowBlur = 0; // reset
        });

        // 5. Update enemy positions, weapons, and AI loops
        g.enemies.forEach((enemy, eIndex) => {
          enemy.y += enemy.speedY;
          enemy.x += enemy.speedX;

          // Wall bouncing limits for advanced interceptors
          if (enemy.x <= 10 || enemy.x >= canvas.width - enemy.w - 10) {
            enemy.speedX *= -1;
          }

          // Clean up offscreen enemies safely
          if (enemy.y > canvas.height + 60) {
            if (enemy.type === 'titan') {
              g.bossSpawned = false; // allow next boss spawn later
            }
            g.enemies.splice(eIndex, 1);
            return;
          }

          // Render Cyberpunk Enemies dynamically
          ctx.lineWidth = 2;
          ctx.shadowBlur = 8;
          
          if (enemy.type === 'basic') {
            ctx.shadowColor = '#f03434';
            ctx.strokeStyle = '#f03434';
            ctx.fillStyle = 'rgba(240, 52, 52, 0.15)';
            // Polygon diamond shape representation
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.w / 2, enemy.y);
            ctx.lineTo(enemy.x + enemy.w, enemy.y + enemy.h / 2);
            ctx.lineTo(enemy.x + enemy.w / 2, enemy.y + enemy.h);
            ctx.lineTo(enemy.x, enemy.y + enemy.h / 2);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
          } else if (enemy.type === 'viper') {
            ctx.shadowColor = '#f39c12';
            ctx.strokeStyle = '#f39c12';
            ctx.fillStyle = 'rgba(243, 156, 18, 0.15)';
            // Aggressive triangular fighter representation
            ctx.beginPath();
            ctx.moveTo(enemy.x + enemy.w / 2, enemy.y + enemy.h);
            ctx.lineTo(enemy.x + enemy.w, enemy.y);
            ctx.lineTo(enemy.x, enemy.y);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Viper shoots hostile pulses back
            enemy.fireCooldown--;
            if (enemy.fireCooldown <= 0) {
              enemy.fireCooldown = Math.random() * 140 + 80;
              g.enemyLasers.push({
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h,
                w: 3,
                h: 12,
                dy: 6.5,
                dx: (p.x - enemy.x) * 0.01 // aimed tracking
              });
            }
          } else if (enemy.type === 'titan') {
            ctx.shadowColor = '#e222b2';
            ctx.strokeStyle = '#e222b2';
            ctx.fillStyle = 'rgba(226, 34, 178, 0.2)';
            
            // Render gigantic command vessel
            ctx.beginPath();
            ctx.moveTo(enemy.x + 10, enemy.y);
            ctx.lineTo(enemy.x + enemy.w - 10, enemy.y);
            ctx.lineTo(enemy.x + enemy.w, enemy.y + 20);
            ctx.lineTo(enemy.x + enemy.w - 20, enemy.y + enemy.h);
            ctx.lineTo(enemy.x + 20, enemy.y + enemy.h);
            ctx.lineTo(enemy.x, enemy.y + 20);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();

            // Dreadnought core health state bar
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(enemy.x, enemy.y - 12, enemy.w, 4);
            ctx.fillStyle = '#e222b2';
            ctx.fillRect(enemy.x, enemy.y - 12, enemy.w * (enemy.hp / enemy.maxHp), 4);

            // Boss weapon discharge sequence
            enemy.fireCooldown--;
            if (enemy.fireCooldown <= 0) {
              enemy.fireCooldown = 60;
              // Tri-directional cosmic bolts
              g.enemyLasers.push({ x: enemy.x + 10, y: enemy.y + enemy.h, w: 3, h: 12, dy: 5, dx: -2 });
              g.enemyLasers.push({ x: enemy.x + enemy.w / 2, y: enemy.y + enemy.h, w: 3, h: 12, dy: 5.5, dx: 0 });
              g.enemyLasers.push({ x: enemy.x + enemy.w - 10, y: enemy.y + enemy.h, w: 3, h: 12, dy: 5, dx: 2 });
            }
          }
          ctx.shadowBlur = 0;

          // Player hull-collision with enemy ship directly
          if (checkCollision({ x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h }, enemy)) {
            p.shield -= enemy.type === 'titan' ? 50 : 25;
            playSoundEffect('hit');
            
            // Create particle crash explosion
            for (let i = 0; i < 15; i++) {
              g.particles.push({
                x: enemy.x + enemy.w / 2,
                y: enemy.y + enemy.h / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                alpha: 1,
                color: '#f03434',
                size: Math.random() * 3 + 1,
                decay: 0.04
              });
            }

            if (enemy.type === 'titan') {
              g.bossSpawned = false;
            }
            g.enemies.splice(eIndex, 1);
            addTelemetryLog(`Collision impact! Shield energy depleted.`, 'danger');

            if (p.shield <= 0) {
              triggerGameOver();
            }
          }

          // Laser impact scoring
          g.lasers.forEach((laser, lIndex) => {
            if (checkCollision({ x: laser.x, y: laser.y, w: laser.w, h: laser.h }, enemy)) {
              enemy.hp--;
              g.lasers.splice(lIndex, 1);
              playSoundEffect('hit');

              // Hit spark particles
              for (let i = 0; i < 4; i++) {
                g.particles.push({
                  x: laser.x,
                  y: laser.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: -Math.random() * 3,
                  alpha: 1,
                  color: '#00ffff',
                  size: Math.random() * 2 + 1,
                  decay: 0.08
                });
              }

              if (enemy.hp <= 0) {
                // Kill award
                const points = enemy.type === 'titan' ? 550 : enemy.type === 'viper' ? 120 : 40;
                g.scoreRef += points;
                setScore(g.scoreRef);

                // Drop golden Nanites
                const dropsCount = enemy.type === 'titan' ? 8 : enemy.type === 'viper' ? 3 : 1;
                for (let k = 0; k < dropsCount; k++) {
                  g.naniteDrops.push({
                    x: enemy.x + enemy.w / 2 + (Math.random() - 0.5) * 20,
                    y: enemy.y + enemy.h / 2 + (Math.random() - 0.5) * 20,
                    size: 8,
                    collected: false
                  });
                }

                // Boom expansion particles
                for (let i = 0; i < 20; i++) {
                  g.particles.push({
                    x: enemy.x + enemy.w / 2,
                    y: enemy.y + enemy.h / 2,
                    vx: (Math.random() - 0.5) * 9,
                    vy: (Math.random() - 0.5) * 9,
                    alpha: 1,
                    color: enemy.type === 'titan' ? '#e222b2' : enemy.type === 'viper' ? '#f39c12' : '#f03434',
                    size: Math.random() * 4 + 1.5,
                    decay: 0.03
                  });
                }

                if (enemy.type === 'titan') {
                  g.bossSpawned = false;
                  addTelemetryLog('Cosmic Dreadnought neutralized. Nanites extracted.', 'success');
                }
                g.enemies.splice(eIndex, 1);
                playSoundEffect('explosion');
              }
            }
          });
        });

        // 6. Update Hostile enemy laser pulses
        g.enemyLasers.forEach((eLaser, elIndex) => {
          eLaser.y += eLaser.dy;
          eLaser.x += eLaser.dx;

          if (eLaser.y > canvas.height + 20) {
            g.enemyLasers.splice(elIndex, 1);
            return;
          }

          // Draw neon enemy lasers
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ff3366';
          ctx.fillStyle = '#ff3366';
          ctx.fillRect(eLaser.x, eLaser.y, eLaser.w || 3, eLaser.h || 12);
          ctx.shadowBlur = 0;

          // Check if hits player
          if (checkCollision({ x: eLaser.x, y: eLaser.y, w: eLaser.w || 3, h: eLaser.h || 12 }, { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h })) {
            p.shield -= 15;
            g.enemyLasers.splice(elIndex, 1);
            playSoundEffect('hit');

            for (let i = 0; i < 8; i++) {
              g.particles.push({
                x: p.x,
                y: p.y - 10,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                alpha: 1,
                color: '#ff3366',
                size: Math.random() * 3 + 1,
                decay: 0.06
              });
            }

            if (p.shield <= 0) {
              triggerGameOver();
            }
          }
        });

        // 7. Nanite coins gravitation magnetism and pickup state logic
        g.naniteDrops.forEach((nano, nIndex) => {
          // Calculate distance to player ship
          const dx = p.x - nano.x;
          const dy = p.y - nano.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const magnetRadius = getMagnetRange();

          // Gravitates automatically towards player hull
          if (dist < magnetRadius) {
            const pullForce = 0.08 + (0.015 * (magnetRadius / 100));
            nano.x += dx * pullForce;
            nano.y += dy * pullForce;
          } else {
            // slow ambient drift downwards
            nano.y += 0.8;
          }

          // Overlap check
          if (dist < p.w / 2 + nano.size) {
            playSoundEffect('powerup');
            g.nanitesAwardedThisRun += 1;
            g.naniteDrops.splice(nIndex, 1);
            return;
          }

          // Clean up offscreen nanites
          if (nano.y > canvas.height + 20) {
            g.naniteDrops.splice(nIndex, 1);
            return;
          }

          // Render high density rotating glowing golden gems
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#D4AF37';
          ctx.fillStyle = '#D4AF37';
          ctx.beginPath();
          ctx.moveTo(nano.x, nano.y - nano.size / 2);
          ctx.lineTo(nano.x + nano.size / 2, nano.y);
          ctx.lineTo(nano.x, nano.y + nano.size / 2);
          ctx.lineTo(nano.x - nano.size / 2, nano.y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 8. Handle cosmic particle explosions
      g.particles.forEach((part, index) => {
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= part.decay;

        if (part.alpha <= 0) {
          g.particles.splice(index, 1);
          return;
        }

        ctx.fillStyle = part.color;
        ctx.globalAlpha = part.alpha;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1; // reset
      });

      // 9. Render player ship with rich neon emissions
      if (isPlaying && !isGameOver) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#bf55ec'; // Electric Purple glow emission

        // Dynamic Thruster light sparks
        const fireThrust = (g.elapsedFrames % 3) * 6;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(p.x - 6, p.y + p.h / 2);
        ctx.lineTo(p.x, p.y + p.h / 2 + fireThrust);
        ctx.lineTo(p.x + 6, p.y + p.h / 2);
        ctx.closePath();
        ctx.fill();

        // Sleek Poly Fighter Wing-craft shape
        ctx.strokeStyle = '#bf55ec';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(191, 85, 236, 0.25)';
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.h / 2); // Nose Tip
        ctx.lineTo(p.x + p.w / 2, p.y + p.h / 2); // Right wing tip
        ctx.lineTo(p.x + p.w / 6, p.y + p.h / 3); // Right engine bay
        ctx.lineTo(p.x - p.w / 6, p.y + p.h / 3); // Left engine bay
        ctx.lineTo(p.x - p.w / 2, p.y + p.h / 2); // Left wing tip
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Draw HUD status shield indicators layered on the spaceship nose
        ctx.shadowBlur = 0;
        const shieldPerc = p.shield / p.maxShield;
        ctx.strokeStyle = shieldPerc > 0.4 ? 'rgba(0, 255, 255, 0.4)' : 'rgba(255, 51, 102, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.w * 0.9, 0, Math.PI * 2);
        ctx.stroke();

        // Render virtual vector reticle
        if (controlType === 'mouse_touch') {
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.15)';
          ctx.beginPath();
          ctx.arc(p.targetX, p.targetY, 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Keep repeating the frame request infinitely
      animationId = requestAnimationFrame(loop);
    };

    const triggerGameOver = () => {
      setIsGameOver(true);
      playSoundEffect('gameover');
      addTelemetryLog(`Game Over. Sector lost. High-score: ${gameRef.current.scoreRef}`, 'danger');
      
      // Persist gathered Nanites to core balance
      const currentNanites = parseInt(localStorage.getItem('galactica_nanites') || '0', 10);
      const updatedTotal = currentNanites + gameRef.current.nanitesAwardedThisRun;
      setNanites(updatedTotal);
      localStorage.setItem('galactica_nanites', updatedTotal.toString());

      // Persist High-score
      const currentHighScore = parseInt(localStorage.getItem('galactica_highscore') || '0', 10);
      if (gameRef.current.scoreRef > currentHighScore) {
        setHighScore(gameRef.current.scoreRef);
        localStorage.setItem('galactica_highscore', gameRef.current.scoreRef.toString());
        addTelemetryLog(`NEW ELITE HIGHSCORE ESTABLISHED: ${gameRef.current.scoreRef}`, 'success');
      }
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, isGameOver, controlType]);

  const handleStartGame = () => {
    // Reset all parameters
    const p = gameRef.current.player;
    p.maxShield = getMaxShield();
    p.shield = p.maxShield;
    gameRef.current.scoreRef = 0;
    gameRef.current.nanitesAwardedThisRun = 0;
    gameRef.current.lasers = [];
    gameRef.current.enemies = [];
    gameRef.current.enemyLasers = [];
    gameRef.current.particles = [];
    gameRef.current.naniteDrops = [];
    gameRef.current.bossSpawned = false;
    
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
    playSoundEffect('powerup');
    addTelemetryLog('Neural fighter linkage complete. Sector launch initialized!', 'info');
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isGameOver || controlType !== 'mouse_touch') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    gameRef.current.player.targetX = e.clientX - rect.left;
    gameRef.current.player.targetY = e.clientY - rect.top;
  };

  return (
    <div className="space-y-10 pb-40">
      
      {/* Immersive Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-premium animate-ping"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-premium">Galaxy Arcade Module</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-display italic uppercase tracking-tighter premium-text-gradient">
            GALÁCTICA: NEON ODYSSEY
          </h1>
          <p className="text-xs text-white/40 font-mono uppercase tracking-widest">
            Endless space action powered by neural fiber networks • Version 2.06
          </p>
        </div>

        {/* HUD Scoreboard header */}
        <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl font-mono text-right">
          <div>
            <div className="text-[8px] uppercase tracking-widest text-white/30">Total Highscore</div>
            <div className="text-xl font-black text-premium">{highScore} PTS</div>
          </div>
          <div className="w-px bg-white/10 h-8 self-center"></div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-white/30">Nano Nanites</div>
            <div className="text-xl font-black text-[#D4AF37] flex items-center gap-1">
              <Sparkles size={14} /> {nanites}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Core Game Viewport Column */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          <div className="relative aspect-video w-full rounded-[40px] overflow-hidden bg-black border border-white/10 shadow-[0_0_80px_rgba(192,132,252,0.15)] flex flex-col">
            
            {/* Ambient HUD state layer */}
            <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center pointer-events-none font-mono">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[8.5px] uppercase tracking-widest text-white/40 block">SCORE UNIT</span>
                  <span className="text-2xl font-black text-white">{score}</span>
                </div>
                <div className="w-px bg-white/15 h-6"></div>
                <div>
                  <span className="text-[8.5px] uppercase tracking-widest text-white/40 block flex items-center gap-1">
                    <Battery size={10} className="text-premium icon-glowing" /> EXTRACTS GATHERED
                  </span>
                  <span className="text-sm font-black text-[#D4AF37]">{gameRef.current.nanitesAwardedThisRun}</span>
                </div>
              </div>

              {/* Responsive custom-built life rating indicators */}
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-cyan-400" />
                <div className="w-36 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${(isPlaying && !isGameOver) ? (gameRef.current.player.shield / gameRef.current.player.maxShield) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Core Canvas Object Rendering */}
            <canvas 
              ref={canvasRef}
              onPointerMove={handlePointerMove}
              className="flex-grow w-full h-full cursor-none block touch-none"
            />

            {/* Inactive Overlay Overlay Screen */}
            <AnimatePresence>
              {(!isPlaying || isGameOver) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-30 bg-midnight/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center space-y-8"
                >
                  <div className="absolute top-0 left-0 w-full h-1 premium-gradient"></div>
                  
                  {isGameOver ? (
                    <div className="space-y-4">
                      <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                        <RotateCcw className="animate-spin-slow" size={36} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.6em] text-red-500">Core Depleted</h4>
                        <h2 className="text-5xl font-black font-display italic uppercase tracking-tighter">Connection Dropped</h2>
                        <p className="text-sm text-white/40 font-serif max-w-sm mx-auto">
                          Hull disintegrated during spatial navigation. Gathered golden nanites saved properly.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto pt-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Score Achieved</p>
                          <p className="text-xl font-black text-white">{score}</p>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                          <p className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Nanites Saved</p>
                          <p className="text-xl font-black text-[#D4AF37] flex items-center justify-center gap-1">
                            +{gameRef.current.nanitesAwardedThisRun}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="w-24 h-24 rounded-[40%] bg-premium/10 border-2 border-premium/30 flex items-center justify-center mx-auto text-premium shadow-[0_0_40px_rgba(192,132,252,0.3)]">
                        <Cpu className="animate-pulse" size={48} />
                      </div>
                      <div className="space-y-2 max-w-md mx-auto">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-premium">READY TO LAUNCH</h3>
                        <h2 className="text-5xl font-black font-display italic uppercase tracking-tighter">NEURAL CYBER FIGHTER</h2>
                        <p className="text-sm text-white/40 font-serif">
                          Link your reflexes into the continuous quantum vector stream. Defeat hostile grids, acquire precious nanites, and purchase permanent system upgrades.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 max-w-md w-full justify-center">
                    <button 
                      onClick={handleStartGame}
                      className="px-12 py-5.5 premium-gradient rounded-full font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center gap-3 cursor-pointer"
                    >
                      <Play size={14} /> {isGameOver ? 'Initiate Respawn Link' : 'Engage Neural Core'}
                    </button>
                  </div>

                  {/* Operational guidelines */}
                  <div className="text-[10px] text-white/20 font-mono uppercase tracking-widest block">
                    Use Cursor Pointer to Glide with Auto-laser stream, or customize controls below
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick HUD Action Controls bar */}
          <div className="glass-card p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs">
            <div className="flex items-center gap-6">
              <span className="text-white/40 uppercase tracking-wider">Control Link:</span>
              <div className="flex bg-midnight p-1 rounded-xl">
                <button 
                  onClick={() => setControlType('mouse_touch')}
                  className={`px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-all text-[9px] ${controlType === 'mouse_touch' ? 'bg-premium text-white' : 'text-white/40 hover:text-white'}`}
                >
                  Mouse / Touch
                </button>
                <button 
                  onClick={() => setControlType('keyboard')}
                  className={`px-4 py-2 rounded-lg font-black uppercase tracking-wider transition-all text-[9px] ${controlType === 'keyboard' ? 'bg-premium text-white' : 'text-white/40 hover:text-white'}`}
                >
                  Keyboard (WASD + Space)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white/40 uppercase tracking-wider">Synthetic Audio:</span>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white ${soundEnabled ? 'text-premium' : 'text-white/20'}`}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* Tactical Upgrade Shop Column & Telemetry Section */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Shop Upgrade Ledger panel */}
          <div className="glass-card p-8 rounded-[40px] space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-premium/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="space-y-0.5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-premium">Systems Upgrade Depot</h3>
                <h4 className="text-2xl font-black font-display uppercase tracking-tight italic text-white">Nano Infusion</h4>
              </div>
              <Sparkles className="text-[#D4AF37] animate-pulse" size={24} />
            </div>

            {/* Upgrades loop */}
            <div className="space-y-4">
              {upgrades.map((upg) => {
                const isMaxed = upg.level >= upg.maxLevel;
                const canAfford = nanites >= upg.cost;
                
                return (
                  <div key={upg.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between gap-4 group hover:border-white/10 transition-colors">
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-white group-hover:text-premium transition-colors">{upg.name}</span>
                        <span className="text-[9px] font-mono font-bold text-premium uppercase">
                          {isMaxed ? 'MAX LVL' : `LVL ${upg.level}/${upg.maxLevel}`}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 italic leading-relaxed">{upg.desc}</p>
                      
                      {/* Level progress dots */}
                      <div className="flex gap-1 pt-1">
                        {Array.from({ length: upg.maxLevel }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`h-1.5 flex-grow rounded-full transition-all ${idx < upg.level ? 'premium-gradient' : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Buy Upgrade Button */}
                    <button 
                      onClick={() => buyUpgrade(upg.id)}
                      disabled={isMaxed || !canAfford}
                      className={`flex-shrink-0 p-3 h-14 rounded-xl font-mono text-center flex flex-col justify-center items-center font-bold tracking-tight outline-none border transition-all ${
                        isMaxed 
                          ? 'bg-transparent border-white/5 text-white/20 cursor-not-allowed'
                          : canAfford
                            ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20 cursor-pointer'
                            : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                      }`}
                      style={{ minWidth: '70px' }}
                    >
                      {isMaxed ? (
                        <span className="text-[8px] uppercase font-bold text-white/20">MAX</span>
                      ) : (
                        <>
                          <span className="text-[8px] uppercase opacity-60 text-white/40">COST</span>
                          <span className="text-xs font-black text-[#D4AF37] flex items-center gap-0.5 mt-0.5">
                            <Sparkles size={8} /> {upg.cost}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick help layout */}
            <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl text-[10px] text-[#D4AF37]/75 leading-relaxed italic">
              *Collecting floating golden nanites mid-flight instantly allocates tokens to your persistent cyber account budget. Upgrades apply permanently to all subsequent launches.
            </div>
          </div>

          {/* Chronological Cybernetic Telemetry logs */}
          <div className="glass-card p-8 rounded-[40px] space-y-6">
            <div className="pb-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Sector Telemetry</h3>
              <Cpu size={14} className="text-white/20" />
            </div>

            <div className="space-y-3 font-mono text-[9.5px] max-h-[180px] overflow-y-auto pr-1">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3 leading-relaxed animate-in fade-in duration-300">
                  <span className="text-white/25 shrink-0">[{log.time}]</span>
                  <span className={`
                    ${log.type === 'danger' ? 'text-red-400' : ''}
                    ${log.type === 'warn' ? 'text-[#f39c12]' : ''}
                    ${log.type === 'success' ? 'text-emerald-400 font-bold' : ''}
                    ${log.type === 'info' ? 'text-cyan-400' : ''}
                  `}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

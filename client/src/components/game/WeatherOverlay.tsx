import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, WEATHER_TYPES } from '@/contexts/GameContext';

// Composant de particules de pluie/neige
function RainParticles({ count = 60, color = 'rgba(120,160,255,0.5)', speed = 1 }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const drops = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      length: 8 + Math.random() * 14,
      speed: (2 + Math.random() * 4) * speed,
      opacity: 0.3 + Math.random() * 0.4,
    }));

    let animId: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      drops.forEach(drop => {
        ctx!.beginPath();
        ctx!.strokeStyle = color;
        ctx!.globalAlpha = drop.opacity;
        ctx!.lineWidth = 1;
        ctx!.moveTo(drop.x, drop.y);
        ctx!.lineTo(drop.x - 1, drop.y + drop.length);
        ctx!.stroke();
        drop.y += drop.speed;
        if (drop.y > canvas!.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas!.width;
        }
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [count, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

// Particules de neige
function SnowParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const flakes = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1.5 + Math.random() * 3,
      speed: 0.5 + Math.random() * 1.5,
      drift: (Math.random() - 0.5) * 0.5,
      opacity: 0.4 + Math.random() * 0.5,
    }));

    let animId: number;
    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      flakes.forEach(f => {
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(220, 235, 255, ${f.opacity})`;
        ctx!.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > canvas!.height) {
          f.y = -f.r;
          f.x = Math.random() * canvas!.width;
        }
        if (f.x > canvas!.width) f.x = 0;
        if (f.x < 0) f.x = canvas!.width;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

export default function WeatherOverlay() {
  const { state } = useGame();
  const weather = WEATHER_TYPES[state.weather];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.weather}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 2 }}
      >
        {/* Filtre de couleur global */}
        {weather.filterOpacity > 0 && (
          <div
            className="absolute inset-0"
            style={{
              background: weather.filter,
              opacity: weather.filterOpacity / (weather.filterOpacity || 1),
              mixBlendMode: 'multiply',
            }}
          />
        )}

        {/* Particules de pluie */}
        {state.weather === 'rainy' && (
          <RainParticles count={60} color="rgba(100,140,220,0.5)" speed={1} />
        )}

        {/* Particules d'orage (pluie intense) */}
        {state.weather === 'storm' && (
          <>
            <RainParticles count={120} color="rgba(80,100,200,0.6)" speed={1.8} />
            {/* Éclairs occasionnels */}
            <motion.div
              className="absolute inset-0"
              style={{ background: 'rgba(200, 220, 255, 0.15)', zIndex: 6 }}
              animate={{ opacity: [0, 0, 0, 0.8, 0, 0, 0, 0, 0, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: Math.random() * 3 }}
            />
          </>
        )}

        {/* Particules de neige */}
        {state.weather === 'snow' && <SnowParticles />}

        {/* Brouillard : gradient flou */}
        {state.weather === 'fog' && (
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(200,205,215,0) 30%, rgba(200,205,215,0.35) 100%)',
              backdropFilter: 'blur(0.5px)',
            }}
          />
        )}

        {/* Canicule : shimmer chaud */}
        {state.weather === 'heatwave' && (
          <motion.div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(255,120,30,0.08) 0%, rgba(255,80,10,0.04) 100%)' }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

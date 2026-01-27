import React, { useState, useEffect, useRef } from 'react';
import { Trophy, MusicNotes, Pause } from 'phosphor-react';

const AGENTS_DATA = [
  { month: 'OCTUBRE 2025', name: 'ALONSO CASTAÑO', image: '/alonso_escracho.png', order: 10 },
  { month: 'SEPTIEMBRE 2025', name: 'ALONSO CASTAÑO', image: '/alonso_escracho.png', order: 9 },
  { month: 'AGOSTO 2025', name: 'ALONSO CASTAÑO', image: '/alonso_escracho.png', order: 8 },
  { month: 'JULIO 2025', name: 'MAURO BARRAZA', image: '/mauro.png', order: 7 },
  { month: 'JUNIO 2025', name: 'MAURO BARRAZA', image: '/mauro.png', order: 6 },
  { month: 'MAYO 2025', name: 'ANDREA VEDIA', image: '/andrea.png', order: 5 },
  { month: 'ABRIL 2025', name: 'ANDREA VEDIA', image: '/andrea.png', order: 4 },
  { month: 'MARZO 2025', name: 'MAURO BARRAZA', image: '/mauro.png', order: 3 },
  { month: 'FEBRERO 2025', name: 'ANDREA VEDIA', image: '/andrea.png', order: 2 },
  { month: 'ENERO 2025', name: 'MAURO BARRAZA', image: '/mauro.png', order: 1 },
];

export default function AgenteMes() {
  const [currentAgent, setCurrentAgent] = useState(AGENTS_DATA[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Efecto de Partículas Doradas
  useEffect(() => {
    const canvas = document.getElementById('gold-particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        ctx.fillStyle = 'rgba(238, 210, 84, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="relative h-full w-full bg-black text-warner-gold flex flex-col items-center justify-start py-10 overflow-hidden font-serif">
      {/* Fondo de Partículas */}
      <canvas id="gold-particles" className="absolute inset-0 z-0 pointer-events-none"></canvas>

      {/* Música Oculta */}
      <audio ref={audioRef} src="/MÚSICA DE PELÍCULAS_ GLADIADOR TEMA COMPLETO.mp4" loop />

      {/* Contenido Principal */}
      <div className="z-10 flex flex-col items-center max-w-4xl w-full px-4 animate-fade-in">
        
        <div className="flex items-center gap-4 mb-8">
          <Trophy size={48} weight="fill" className="text-warner-gold animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-black tracking-widest text-center" style={{ textShadow: '0 0 20px rgba(238, 210, 84, 0.4)' }}>
            WARNER ELITE
          </h1>
          <Trophy size={48} weight="fill" className="text-warner-gold animate-pulse" />
        </div>

        {/* Agente Actual */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-warner-gold/30 shadow-[0_0_30px_rgba(238,210,84,0.15)] flex flex-col items-center w-full max-w-sm transition-all duration-500">
          <div className="w-full aspect-square bg-black rounded-lg overflow-hidden border border-warner-gold/50 mb-6 relative">
            <img 
              src={currentAgent.image} 
              alt={currentAgent.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=FOTO' }} // Fallback por si falta la imagen
            />
          </div>
          <h2 className="text-3xl font-bold tracking-wider text-white mb-2">{currentAgent.name}</h2>
          <p className="text-xl tracking-widest text-warner-gold font-medium">{currentAgent.month}</p>
        </div>

        {/* Historial (Botones) */}
        <div className="mt-12 w-full">
          <h3 className="text-center text-sm tracking-widest text-slate-500 mb-6 uppercase font-bold">Historial de Ganadores</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {AGENTS_DATA.sort((a,b) => b.order - a.order).map(agent => (
              <button
                key={agent.month}
                onClick={() => setCurrentAgent(agent)}
                className={`px-4 py-2 text-sm font-bold tracking-wider rounded-lg border transition-all duration-300 ${
                  currentAgent.month === agent.month 
                    ? 'bg-warner-gold text-black border-warner-gold shadow-[0_0_15px_rgba(238,210,84,0.5)]' 
                    : 'bg-black/50 text-warner-gold border-warner-gold/30 hover:bg-warner-gold/10'
                }`}
              >
                {agent.month}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Botón Flotante de Música */}
      <button 
        onClick={toggleMusic}
        className="absolute bottom-8 right-8 z-50 bg-warner-gold text-black p-4 rounded-full shadow-[0_0_20px_rgba(238,210,84,0.6)] hover:scale-110 transition-transform flex items-center gap-2 font-bold"
      >
        {isPlaying ? <Pause size={24} weight="fill" /> : <MusicNotes size={24} weight="fill" />}
      </button>

    </div>
  );
}
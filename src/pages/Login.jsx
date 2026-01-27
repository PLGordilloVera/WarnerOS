import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LockKey, CaretRight, Sparkle, CircleNotch, Buildings, Eye, EyeSlash } from 'phosphor-react';

// TU URL DE APPS SCRIPT
const API_URL = import.meta.env.VITE_API_URL;

const BG_IMAGE = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop";

const WarnerLogo = () => {
  const [imgError, setImgError] = useState(false);
  const localLogoPath = "/logo.png"; 

  if (imgError) {
    return (
      <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-amber-200 rounded-full opacity-80 shadow-[0_0_15px_rgba(253,230,138,0.3)]"></div>
        <Buildings weight="fill" className="text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-md" />
      </div>
    );
  }
  return (
    <img 
      src={localLogoPath} 
      alt="Warner OS Logo" 
      className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
      onError={() => setImgError(true)} 
    />
  );
};

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', dni: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}?action=login`, {
        method: 'POST',
        mode: 'cors', 
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ user: credentials.email, pass: credentials.dni })
      });

      const data = await response.json();

      if (data.auth) {
        login({ 
            name: data.name, 
            email: data.email, 
            role: data.role, 
            cargo: data.cargo,
            telefono: data.telefono,
            departamento: data.departamento,
            fechaIngreso: data.fechaIngreso,
            avatar: data.avatar || (data.name ? data.name.charAt(0) : 'W')
        });
        navigate('/', { replace: true });
      } else {
        throw new Error(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión: ' + (err.message || 'Intente nuevamente'));
    } finally {
      setLoading(false);
    }
  };

  return (
    // min-h-[100dvh] asegura que cubra toda la pantalla en móbile incluso con la barra de navegación del navegador
    <div className="flex min-h-[100dvh] w-full bg-slate-950 overflow-hidden font-sans selection:bg-amber-200 selection:text-slate-900 relative">
      
      {/* --- FONDO PARA MÓVIL (Solo visible en pantallas pequeñas) --- */}
      <div className="absolute inset-0 lg:hidden z-0">
         <img src={BG_IMAGE} className="w-full h-full object-cover opacity-30" alt="Background" />
         <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/90 to-slate-950" />
      </div>

      {/* --- IZQUIERDA: DISEÑO VISUAL (Solo Desktop) --- */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex w-[60%] relative overflow-hidden z-10"
      >
        <motion.img 
            initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 10 }}
            src={BG_IMAGE} className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/50 to-transparent mix-blend-multiply" />
        
        <div className="relative z-10 flex flex-col justify-end p-16 h-full max-w-2xl">
          <div className="flex items-center gap-2 text-amber-200 mb-4">
            <Sparkle weight="fill" />
            <span className="text-xs font-bold tracking-[0.3em] uppercase">WARNER OS <span className="opacity-50">v2.0</span></span>
          </div>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            La excelencia <br/> comienza aquí.
          </h1>

          <p className="text-lg text-slate-300 font-light border-l-2 border-amber-200 pl-4 mt-2 leading-relaxed">
            "Transformamos propiedades en historias de éxito. <br/> Bienvenido al sistema operativo inmobiliario."
          </p>
        </div>
      </motion.div>

      {/* --- DERECHA: FORMULARIO (Centrado en Móvil) --- */}
      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center p-6 md:p-8 relative z-10">
        
        {/* Decoración ambiental para escritorio */}
        <div className="hidden lg:block absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Contenedor tipo Tarjeta en Móvil / Limpio en Desktop */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-sm md:max-w-md bg-slate-900/60 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border border-white/10 lg:border-none p-8 lg:p-0 rounded-3xl lg:rounded-none shadow-2xl lg:shadow-none"
        >
          <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
            <div className="mb-2 md:mb-4"><WarnerLogo /></div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Warner OS</h2>
            <p className="text-slate-400 text-xs md:text-sm text-center">Inicie sesión en el sistema.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200"><User size={20} weight="duotone" /></div>
              <input
                type="text"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                placeholder="Usuario / Email"
                // text-base evita el zoom automático en iPhone al enfocar
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-base text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200">
                <LockKey size={20} weight="duotone" />
              </div>
              <input
                type={showPassword ? "text" : "password"} 
                name="dni"
                value={credentials.dni}
                onChange={handleChange}
                placeholder="Contraseña / DNI"
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-base text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-200 transition-colors cursor-pointer z-20 p-2"
              >
                {showPassword ? <EyeSlash size={20} weight="duotone" /> : <Eye size={20} weight="duotone" />}
              </button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="text-red-400 text-xs md:text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-200 to-amber-100 text-slate-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 hover:scale-[1.01] active:scale-95 mt-2"
            >
              {loading ? <CircleNotch size={24} className="animate-spin" /> : <>Iniciar Sistema <CaretRight size={18} weight="bold" /></>}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">POWERED BY WARNER OS</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
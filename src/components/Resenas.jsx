import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { 
  Star, CaretRight, User, SpinnerGap, Link as LinkIcon, CheckCircle, IdentificationBadge
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const SectionCard = ({ title, icon, children, className = "" }) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl ${className}`}>
    <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, name, value, onChange, type="text", placeholder, className="", ...props }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
    <div className="relative group">
        {props.icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors">{props.icon}</div>}
        <input 
          type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} {...props}
          className={`w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 ${props.icon ? 'pl-12' : ''} text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all placeholder:text-slate-600`} 
        />
    </div>
  </div>
);

export default function Resenas() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    link: '',
    mencion: 'NO'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const toggleMencion = () => {
    setFormData(prev => ({ ...prev, mencion: prev.mencion === 'SI' ? 'NO' : 'SI' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.link) return toast.warning("Ingresa el link de la reseña");

    setLoading(true);
    try {
      await fetch(API_URL, { 
        method: 'POST', 
        body: JSON.stringify({ action: 'addResena', agente: user?.name, ...formData }) 
      });
      toast.success("¡Reseña registrada con éxito!");
      setTimeout(() => navigate('/', { state: { view: 'FORMS' } }), 1500);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans overflow-y-auto overflow-x-hidden custom-scroll relative selection:bg-amber-500/30 selection:text-amber-900">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Fondos */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Botón Volver */}
      <button onClick={() => navigate('/', { state: { view: 'FORMS' } })} className="fixed top-4 left-4 z-50 group flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full hover:border-amber-200/50 transition-all shadow-lg active:scale-95">
        <CaretRight size={14} weight="bold" className="rotate-180 text-slate-400 group-hover:text-amber-200 transition-colors" />
        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-200 uppercase tracking-widest transition-colors">Volver</span>
      </button>

      <div className="min-h-full flex justify-center p-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
            
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-white/10 shadow-xl mb-4">
                  <Star size={40} weight="duotone" className="text-amber-200" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Registro de Reseña</h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">CALIDAD Y PRESTIGIO</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* RESPONSABLE */}
              <SectionCard title="Agente Responsable" icon={<IdentificationBadge size={16}/>}>
                <div className="relative flex items-center bg-slate-950/50 border border-amber-500/20 rounded-xl p-4 text-slate-200">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300 mr-4">
                        <User size={24} weight="fill" />
                    </div>
                    <div>
                        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block">Agente</span>
                        <span className="font-bold text-lg text-white tracking-wide">{user?.name || "Usuario"}</span>
                    </div>
                </div>
              </SectionCard>

              {/* DATOS DE LA RESEÑA */}
              <SectionCard title="Detalles de la Reseña" icon={<Star size={16}/>}>
                 <div className="space-y-6">
                    <Input 
                        label="Link de Google Maps / Reseña" 
                        name="link" 
                        placeholder="https://g.page/..." 
                        value={formData.link} 
                        onChange={handleChange} 
                        icon={<LinkIcon size={18}/>} 
                    />
                    
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-2 block tracking-wider">¿Mención al Agente?</label>
                        <button 
                            type="button"
                            onClick={toggleMencion}
                            className={`w-full py-4 rounded-xl border transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-wider
                                ${formData.mencion === 'SI' 
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                                    : 'bg-slate-950/50 border-white/10 text-slate-500 hover:bg-slate-900'
                                }`}
                        >
                            {formData.mencion === 'SI' ? <CheckCircle size={20} weight="fill" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-600" />}
                            {formData.mencion === 'SI' ? 'SÍ, FUI MENCIONADO' : 'NO FUI MENCIONADO'}
                        </button>
                    </div>
                 </div>
              </SectionCard>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-base uppercase tracking-widest hover:brightness-110">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <> <CheckCircle size={24} weight="fill"/> CONFIRMAR RESEÑA</>}
              </button>

            </form>
        </motion.div>
      </div>
    </div>
  );
}
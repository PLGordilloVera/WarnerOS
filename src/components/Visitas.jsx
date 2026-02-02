import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, CaretRight, User, SpinnerGap, House, 
  MapPin, Phone, Money, CheckCircle, MagnifyingGlass, X, Funnel
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const RATING_FIELDS = [
    { name: 'humedad', label: 'Humedad' },
    { name: 'pintura', label: 'Pintura' },
    { name: 'pisos', label: 'Pisos' },
    { name: 'revoque', label: 'Revoques' },
    { name: 'fachada', label: 'Fachada' },
    { name: 'distribucion', label: 'Distribución' },
    { name: 'ubicacion', label: 'Ubicación' },
];

export default function Visitas() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const dropdownRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  
  const [formData, setFormData] = useState({
    padron: '', direccion_manual: '', celular: '',
    agente: user?.name || '', oferta: '', moneda: 'PESOS',
    humedad: '', pintura: '', pisos: '', revoque: '', 
    fachada: '', distribucion: '', ubicacion: ''
  });

  useEffect(() => {
    fetch(`${API_URL}?action=getInmuebles`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProperties(data);
        setLoadingProps(false);
      })
      .catch(() => setLoadingProps(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const filteredProperties = properties.filter(p => 
    p.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProperty = (prop) => {
    setFormData({ ...formData, padron: prop.padron });
    setSearchTerm(prop.direccion); 
    setIsDropdownOpen(false); 
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.padron) return toast.warning("Selecciona una propiedad");
    if (formData.padron === 'COMPARTIDA' && !formData.direccion_manual) return toast.warning("Falta dirección manual");
    if (!formData.celular) return toast.warning("Falta celular");

    setLoading(true);
    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'addVisita', ...formData }) });
      toast.success("¡Visita registrada!");
      setFormData({
        ...formData, padron: '', direccion_manual: '', celular: '', oferta: '',
        humedad: '', pintura: '', pisos: '', revoque: '', fachada: '', distribucion: '', ubicacion: ''
      });
      setSearchTerm(''); 
    } catch { toast.error("Error al guardar"); } 
    finally { setLoading(false); }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans overflow-y-auto overflow-x-hidden custom-scroll relative selection:bg-amber-500/30 selection:text-amber-900">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Fondos Ambientales */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Botón Volver */}
        <button onClick={() => navigate('/', { state: { view: 'FORMS' } })} className="fixed top-4 left-4 z-50 group flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full hover:border-amber-200/50 transition-all shadow-lg active:scale-95">
        <CaretRight size={14} weight="bold" className="rotate-180 text-slate-400 group-hover:text-amber-200 transition-colors" />
        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-200 uppercase tracking-widest transition-colors">Volver</span>
        </button>

      <div className="min-h-full flex justify-center p-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl relative z-10">
            
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-white/10 shadow-xl mb-4">
                  <CalendarCheck size={40} weight="duotone" className="text-amber-200" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
                Registro de Visita
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">CAPTURA DE DATOS EN TIEMPO REAL</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* TARJETA 1: RESPONSABLE (IGUAL QUE EN CARTELES) */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <User size={16} /> Responsable
                </h3>
                <div className="relative flex items-center bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-slate-200">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-4 border border-amber-500/30">
                        <User size={20} className="text-amber-200" weight="fill" />
                    </div>
                    <div>
                        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block">Agente Actual</span>
                        <span className="font-bold text-lg text-white tracking-wide">{user?.name || "Usuario"}</span>
                    </div>
                </div>
              </div>

              {/* TARJETA 2: DATOS PROPIEDAD Y CLIENTE */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <House size={16} /> Datos de la Visita
                </h3>

                <div className="space-y-5">
                    {/* Buscador Propiedad */}
                    <div className="relative" ref={dropdownRef}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Propiedad</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-200">
                                {loadingProps ? <SpinnerGap className="animate-spin" size={20} /> : <MagnifyingGlass size={20} />}
                            </div>
                            <input 
                                type="text" placeholder="Buscar dirección..." value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setFormData({ ...formData, padron: '' }); setIsDropdownOpen(true); }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:border-amber-200/50 focus:ring-1 focus:ring-amber-200/20 focus:outline-none transition-all"
                            />
                            {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); setFormData({...formData, padron:''}) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={16} /></button>}
                        </div>

                        <AnimatePresence>
                            {isDropdownOpen && !loadingProps && (
                            <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} 
                                className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scroll overflow-x-hidden">
                                {filteredProperties.length > 0 ? (
                                filteredProperties.map((prop, idx) => (
                                    <li key={idx} onClick={() => handleSelectProperty(prop)} className="px-5 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 transition-all group">
                                        <House size={16} className="text-slate-500 group-hover:text-amber-200 transition-colors" />
                                        <div><span className="text-sm font-bold text-slate-300 block group-hover:text-white">{prop.direccion}</span><span className="text-[10px] text-slate-600 font-mono">ID: {prop.padron}</span></div>
                                    </li>
                                ))
                                ) : <li className="px-4 py-6 text-slate-600 text-xs text-center uppercase tracking-widest">Sin resultados</li>}
                                <li onClick={() => { setFormData({...formData, padron:'COMPARTIDA'}); setSearchTerm('PROPIEDAD COMPARTIDA'); setIsDropdownOpen(false); }} className="px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 cursor-pointer border-t border-white/10 flex items-center gap-3 font-bold sticky bottom-0 backdrop-blur-md">
                                    <Funnel size={16} weight="fill" /><span className="text-xs uppercase tracking-wider">Propiedad Compartida / Otra</span>
                                </li>
                            </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Dirección Manual */}
                    <AnimatePresence>
                        {formData.padron === 'COMPARTIDA' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                                <label className="text-[10px] font-bold text-amber-500 uppercase ml-1 mb-1 block tracking-wider">Dirección Manual</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                                    <input type="text" name="direccion_manual" placeholder="Escribe la dirección..." value={formData.direccion_manual} onChange={handleChange}
                                    className="w-full bg-amber-900/10 border border-amber-500/30 rounded-xl p-4 pl-12 text-amber-100 placeholder:text-amber-500/50 focus:border-amber-400/50 focus:outline-none transition-all" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Celular */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Celular Cliente</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors" size={20} />
                            <input type="number" name="celular" placeholder="Ej: 381..." value={formData.celular} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:border-amber-200/50 focus:ring-1 focus:ring-amber-200/20 focus:outline-none transition-all" />
                        </div>
                    </div>
                </div>
              </div>

              {/* SECCIÓN EVALUACIÓN */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                   Calificación (1-10)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    {RATING_FIELDS.map((field) => (
                        <div key={field.name} className="relative">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1 tracking-wider">{field.label}</label>
                            <div className="relative">
                                <select name={field.name} value={formData[field.name]} onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-lg p-3 text-sm text-slate-200 appearance-none focus:border-amber-200/50 focus:outline-none transition-all cursor-pointer hover:bg-slate-800">
                                    <option value="" className="bg-slate-900 text-slate-500">-</option>
                                    {[...Array(10)].map((_, i) => <option key={i+1} value={i+1} className="bg-slate-900">{i+1}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600"><CaretRight size={12} className="rotate-90" /></div>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              {/* SECCIÓN CIERRE */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">Cierre</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Oferta (Opcional)</label>
                        <div className="relative group">
                            <Money className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-400 transition-colors" size={20} />
                            <input type="number" name="oferta" placeholder="Monto..." value={formData.oferta} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 focus:outline-none transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Moneda</label>
                        <div className="flex bg-slate-950/80 rounded-xl border border-white/5 p-1 h-[58px]">
                            {['PESOS', 'DOLARES'].map(m => (
                                <button key={m} type="button" onClick={() => setFormData({...formData, moneda: m})}
                                    className={`flex-1 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 ${formData.moneda === m ? 'bg-slate-800 text-white shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-400'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

              {/* Botón Principal (Estilo Dashboard Action) */}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-sm uppercase tracking-widest hover:brightness-110">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <> <CheckCircle size={24} weight="fill"/> REGISTRAR VISITA</>}
              </button>

            </form>
        </motion.div>
      </div>
    </div>
  );
}
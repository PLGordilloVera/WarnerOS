import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarCheck, CaretRight, User, SpinnerGap, House, 
  MapPin, Phone, Money, CheckCircle, MagnifyingGlass, X, Funnel, IdentificationCard
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const RATING_FIELDS = [
    { name: 'HUMEDAD', label: 'Humedad' },
    { name: 'PINTURA', label: 'Pintura' },
    { name: 'PISOS', label: 'Pisos' },
    { name: 'REVOQUES', label: 'Revoques' },
    { name: 'FACHADA', label: 'Fachada' },
    { name: 'DISTRIBUCION', label: 'Distribución' },
    { name: 'UBICACION', label: 'Ubicación' },
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
    'CELULAR_CLIENTE': '',
    'CLIENTE': '',
    'PADRON_CATASTRAL': '',
    'CALLE': '',
    'NUMERO': '',
    'AGENTE INMOBILIARIO': user?.name || '',
    'HUMEDAD': '',
    'PINTURA': '',
    'PISOS': '',
    'REVOQUES': '',
    'FACHADA': '',
    'UBICACION': '',
    'OFERTA': '',
    'MONEDA': 'PESOS',
    'DISTRIBUCION': '',
    'TIPO_DE_INMUEBLE': ''
  });

  const { token, userEmail } = useAppStore();

  useEffect(() => {
    fetch(`${API_URL}?action=getInmuebles&token=${encodeURIComponent(token || '')}&userEmail=${encodeURIComponent(userEmail || '')}`)
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
    setFormData({ ...formData, 'PADRON_CATASTRAL': prop.padron, 'CALLE': prop.direccion });
    setSearchTerm(prop.direccion); 
    setIsDropdownOpen(false); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData['PADRON_CATASTRAL']) return toast.warning("Selecciona una propiedad");
    if (formData['PADRON_CATASTRAL'] === 'COMPARTIDA' && !formData['CALLE']) return toast.warning("Falta dirección manual");
    if (!formData['CELULAR_CLIENTE']) return toast.warning("Falta celular");
    if (!formData['CLIENTE']) return toast.warning("Falta nombre del cliente");

    setLoading(true);
    try {
      await fetch(API_URL, { 
        method: 'POST', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'addVisita', token, userEmail, ...formData }) 
      });
      toast.success("¡Visita registrada exitosamente!");
      setFormData({
        ...formData, 
        'CELULAR_CLIENTE': '', 'CLIENTE': '', 'PADRON_CATASTRAL': '', 'CALLE': '', 'NUMERO': '',
        'OFERTA': '', 'HUMEDAD': '', 'PINTURA': '', 'PISOS': '', 'REVOQUES': '', 
        'FACHADA': '', 'DISTRIBUCION': '', 'UBICACION': '', 'TIPO_DE_INMUEBLE': ''
      });
      setSearchTerm(''); 
    } catch { 
      toast.error("Error al guardar en el servidor"); 
    } finally { 
      setLoading(false); 
    }
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
              <p className="text-slate-500 text-sm font-medium tracking-wide">CAPTURA DE DATOS PARA CRM</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* SECCIÓN 1: RESPONSABLE */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <User size={16} /> Responsable
                </h3>
                <div className="relative flex items-center bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-slate-200">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-4 border border-amber-500/30">
                        <User size={20} className="text-amber-200" weight="fill" />
                    </div>
                    <div>
                        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block">Agente</span>
                        <span className="font-bold text-lg text-white tracking-wide">{user?.name || "Usuario"}</span>
                    </div>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS CLIENTE */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <IdentificationCard size={16} /> Datos del Cliente
                </h3>
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Nombre del Cliente</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors" size={20} />
                            <input type="text" name="CLIENTE" placeholder="Nombre y Apellido" value={formData['CLIENTE']} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:border-amber-200/50 focus:outline-none transition-all uppercase" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Celular Cliente</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors" size={20} />
                            <input type="number" name="CELULAR_CLIENTE" placeholder="Ej: 381..." value={formData['CELULAR_CLIENTE']} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:border-amber-200/50 focus:outline-none transition-all" />
                        </div>
                    </div>
                </div>
              </div>

              {/* SECCIÓN 3: DATOS PROPIEDAD */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <House size={16} /> Propiedad Visitada
                </h3>

                <div className="space-y-5">
                    <div className="relative" ref={dropdownRef}>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Buscar Propiedad</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-200">
                                {loadingProps ? <SpinnerGap className="animate-spin" size={20} /> : <MagnifyingGlass size={20} />}
                            </div>
                            <input 
                                type="text" placeholder="Buscar dirección..." value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setFormData({ ...formData, 'PADRON_CATASTRAL': '' }); setIsDropdownOpen(true); }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:border-amber-200/50 focus:outline-none transition-all uppercase"
                            />
                            {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); setFormData({...formData, 'PADRON_CATASTRAL':''}) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={16} /></button>}
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
                                <li onClick={() => { setFormData({...formData, 'PADRON_CATASTRAL':'COMPARTIDA'}); setSearchTerm('PROPIEDAD COMPARTIDA'); setIsDropdownOpen(false); }} className="px-5 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 cursor-pointer border-t border-white/10 flex items-center gap-3 font-bold sticky bottom-0 backdrop-blur-md">
                                    <Funnel size={16} weight="fill" /><span className="text-xs uppercase tracking-wider">Propiedad Compartida / Otra</span>
                                </li>
                            </motion.ul>
                            )}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {formData['PADRON_CATASTRAL'] === 'COMPARTIDA' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-amber-500 uppercase ml-1 mb-1 block tracking-wider">Dirección Manual</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={20} />
                                        <input type="text" name="CALLE" placeholder="Calle y Número..." value={formData['CALLE']} onChange={handleChange}
                                        className="w-full bg-amber-900/10 border border-amber-500/30 rounded-xl p-4 pl-12 text-amber-100 placeholder:text-amber-500/50 focus:border-amber-400/50 focus:outline-none transition-all uppercase" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-amber-500 uppercase ml-1 mb-1 block tracking-wider">Tipo de Inmueble</label>
                                    <select name="TIPO_DE_INMUEBLE" value={formData['TIPO_DE_INMUEBLE']} onChange={handleChange}
                                        className="w-full bg-amber-900/10 border border-amber-500/30 rounded-xl p-3.5 text-sm text-amber-100 focus:outline-none">
                                        <option value="" className="bg-slate-900">SELECCIONAR...</option>
                                        <option value="CASA" className="bg-slate-900">CASA</option>
                                        <option value="DEPARTAMENTO" className="bg-slate-900">DEPARTAMENTO</option>
                                        <option value="TERRENO" className="bg-slate-900">TERRENO</option>
                                        <option value="LOCAL" className="bg-slate-900">LOCAL</option>
                                        <option value="OFICINA" className="bg-slate-900">OFICINA</option>
                                    </select>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
              </div>

              {/* SECCIÓN 4: EVALUACIÓN */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                   Calificación del Inmueble (1-10)
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

              {/* SECCIÓN 5: CIERRE */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4">Oferta y Moneda</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Monto Oferta (Opcional)</label>
                        <div className="relative group">
                            <Money className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-green-400 transition-colors" size={20} />
                            <input type="number" name="OFERTA" placeholder="Monto..." value={formData['OFERTA']} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 focus:outline-none transition-all" />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Moneda</label>
                        <div className="flex bg-slate-950/80 rounded-xl border border-white/5 p-1 h-[58px]">
                            {['PESOS', 'DOLARES'].map(m => (
                                <button key={m} type="button" onClick={() => setFormData({...formData, 'MONEDA': m})}
                                    className={`flex-1 rounded-lg text-[10px] font-black tracking-widest transition-all duration-300 ${formData['MONEDA'] === m ? 'bg-slate-800 text-white shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-400'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
              </div>

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

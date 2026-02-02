import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LockKey, CaretRight, User, SpinnerGap, House, 
  MapPin, Money, CheckCircle, MagnifyingGlass, X
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

// --- 1. COMPONENTES EXTERNOS (ESTÁTICOS) ---
// Al estar afuera, NO se redibujan al escribir. ¡Esto soluciona el corte!

const SectionCard = ({ title, icon, children, className = "", zIndex = "z-0" }) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative ${zIndex} ${className}`}>
    <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, name, type="text", placeholder, value, onChange, className="", ...props }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
    <div className="relative group">
        {props.icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors">{props.icon}</div>}
        <input 
          type={type} 
          name={name} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange} 
          {...props}
          className={`w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 ${props.icon ? 'pl-12' : ''} text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all uppercase placeholder:normal-case placeholder:text-slate-600`} 
        />
    </div>
  </div>
);

// --- 2. LÓGICA PRINCIPAL ---

export default function Reservas() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const dropdownRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);
  
  // Lista de propiedades disponibles
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 
  
  const [formData, setFormData] = useState({
    padron: '', 
    direccion: '', 
    valor: '', 
    moneda: 'DOLARES',
    operacion: 'VENTA',
    agente: user?.name || ''
  });

  // Cargar propiedades CAPTADAS al iniciar
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        // 👈 CAMBIA "getInmuebles" por "getInmueblesReservas"
        const response = await fetch(`${API_URL}?action=getInmueblesReservas`, {
          method: 'GET',
          redirect: 'follow'
        }); 
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        setProperties(data);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar inmuebles para reservas");
      } finally {
        setLoadingProps(false);
      }
    };
    fetchProperties();
  }, []);


  // Filtrado local
  useEffect(() => {
    if (!searchTerm) {
        setFilteredProperties(properties);
    } else {
        const lower = searchTerm.toLowerCase();
        setFilteredProperties(properties.filter(p => 
            p.direccion.toLowerCase().includes(lower) || String(p.padron).includes(lower)
        ));
    }
  }, [searchTerm, properties]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleSelectProperty = (prop) => {
    setFormData({ ...formData, padron: prop.padron, direccion: prop.direccion });
    setSearchTerm(prop.direccion); 
    setIsDropdownOpen(false); 
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'text' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.padron) return toast.warning("Debes seleccionar una propiedad válida");
    if (!formData.valor) return toast.warning("Ingresa el valor de reserva");

    setLoading(true);
    try {
      const response = await fetch(API_URL, { 
          method: 'POST', 
          body: JSON.stringify({ action: 'addReserva', ...formData }) 
      });
      const result = await response.json();
      
      if (result.status === 'success') {
          toast.success(result.message);
          setTimeout(() => {
             // Volver al Dashboard forzando la vista FORMS
             navigate('/', { state: { view: 'FORMS' } });
          }, 1500);
      } else {
          toast.error("Error: " + result.message);
      }
    } catch { 
        toast.error("Error de conexión"); 
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
                  <LockKey size={40} weight="duotone" className="text-amber-200" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
                Reserva de Propiedad
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">BLOQUEO DE STOCK Y SEÑA</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* TARJETA 1: RESPONSABLE */}
              <SectionCard title="Responsable" icon={<User size={16}/>}>
                <div className="relative flex items-center bg-slate-950/50 border border-white/10 rounded-2xl p-4 text-slate-200">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mr-4 border border-amber-500/30">
                        <User size={20} className="text-amber-200" weight="fill" />
                    </div>
                    <div>
                        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block">Agente Actual</span>
                        <span className="font-bold text-lg text-white tracking-wide">{user?.name || "Usuario"}</span>
                    </div>
                </div>
              </SectionCard>

              {/* TARJETA 2: SELECCIONAR PROPIEDAD */}
              <SectionCard title="Inmueble a Reservar" icon={<House size={16}/>} zIndex="z-50">
                <div className="relative" ref={dropdownRef}>
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Buscar Dirección (Solo Captados)</label>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-amber-200">
                            {loadingProps ? <SpinnerGap className="animate-spin" size={20} /> : <MagnifyingGlass size={20} />}
                        </div>
                        <input 
                            type="text" placeholder="Escribe la dirección o padrón..." value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setFormData({ ...formData, padron: '' }); setIsDropdownOpen(true); }}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 pl-12 text-sm text-slate-200 placeholder:text-slate-600 focus:border-amber-200/50 focus:ring-1 focus:ring-amber-200/20 focus:outline-none transition-all uppercase"
                        />
                        {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); setFormData({...formData, padron:''}) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={16} /></button>}
                    </div>

                    <AnimatePresence>
                        {isDropdownOpen && !loadingProps && (
                        <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} 
                            className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-64 overflow-y-auto custom-scroll overflow-x-hidden ring-1 ring-white/10">
                            {filteredProperties.length > 0 ? (
                            filteredProperties.map((prop, idx) => (
                                <li key={idx} onClick={() => handleSelectProperty(prop)} className="px-5 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 transition-all group">
                                    <MapPin size={16} className="text-slate-500 group-hover:text-amber-200 transition-colors" />
                                    <div><span className="text-sm font-bold text-slate-300 block group-hover:text-white">{prop.direccion}</span><span className="text-[10px] text-slate-600 font-mono">ID: {prop.padron}</span></div>
                                </li>
                            ))
                            ) : <li className="px-4 py-6 text-slate-600 text-xs text-center uppercase tracking-widest">No se encontraron resultados</li>}
                        </motion.ul>
                        )}
                    </AnimatePresence>
                </div>
              </SectionCard>

              {/* TARJETA 3: DETALLES ECONÓMICOS */}
              <SectionCard title="Detalles de la Operación" icon={<Money size={16}/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    {/* Select Personalizado en línea */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Tipo Operación</label>
                        <div className="flex bg-slate-950/50 rounded-xl border border-white/10 p-1">
                            {['VENTA', 'ALQUILER'].map(m => (
                                <button key={m} type="button" onClick={() => setFormData(prev => ({...prev, operacion: m}))}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.operacion === m ? 'bg-amber-500 text-slate-900 shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Moneda</label>
                        <div className="flex bg-slate-950/50 rounded-xl border border-white/10 p-1">
                            {['DOLARES', 'PESOS'].map(m => (
                                <button key={m} type="button" onClick={() => setFormData(prev => ({...prev, moneda: m}))}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.moneda === m ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <Input 
                    label="Monto de Reserva" 
                    name="valor" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.valor} 
                    onChange={handleChange}
                    icon={<Money size={20} />} 
                />
              </SectionCard>

              {/* Botón Principal */}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-sm uppercase tracking-widest hover:brightness-110">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <> <CheckCircle size={24} weight="fill"/> CONFIRMAR RESERVA</>}
              </button>

            </form>
        </motion.div>
      </div>
    </div>
  );
}
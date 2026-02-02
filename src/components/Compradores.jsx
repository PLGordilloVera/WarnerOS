import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { 
  UserPlus, CaretRight, User, SpinnerGap, Buildings, 
  MapPin, Phone, Money, CheckCircle, Hash, Briefcase, PaperPlaneRight 
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

export default function Compradores() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    origen: '',
    nombre_cliente: '',
    telefono: '',
    email: '',
    operacion: 'COMPRA',
    tipo_inmueble: '',
    ambientes: '',
    cochera: '',
    piso: '',
    zona: '',
    moneda: 'DOLARES',
    presupuesto: '',
    credito: 'NO',
    observaciones: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.origen) return toast.warning("Selecciona el origen");
    if (!formData.nombre_cliente) return toast.warning("Falta nombre del cliente");
    if (!formData.telefono) return toast.warning("Falta teléfono");
    if (!formData.tipo_inmueble) return toast.warning("Selecciona tipo de inmueble");

    setLoading(true);

    const payload = {
      action: 'addComprador',
      agente: user?.name, // Auto-asignado
      ...formData
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      toast.success("¡Cliente registrado exitosamente!");
      
      setFormData({
        origen: '', nombre_cliente: '', telefono: '', email: '',
        operacion: 'COMPRA', tipo_inmueble: '', ambientes: '', cochera: '',
        piso: '', zona: '', moneda: 'DOLARES', presupuesto: '',
        credito: 'NO', observaciones: ''
      });
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans overflow-y-auto overflow-x-hidden custom-scroll relative selection:bg-amber-500/30 selection:text-amber-900">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Fondos Ambientales Warner */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Botón Volver */}
      <button onClick={() => navigate('/', { state: { view: 'FORMS' } })} className="fixed top-4 left-4 z-50 group flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full hover:border-amber-200/50 transition-all shadow-lg active:scale-95">
        <CaretRight size={14} weight="bold" className="rotate-180 text-slate-400 group-hover:text-amber-200 transition-colors" />
        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-200 uppercase tracking-widest transition-colors">Volver</span>
      </button>

      <div className="min-h-full flex justify-center p-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl relative z-10">
            
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-white/10 shadow-xl mb-4">
                  <UserPlus size={40} weight="duotone" className="text-amber-200" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
                Alta de Comprador
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">REGISTRO DE PROSPECTOS Y BÚSQUEDAS</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* SECCIÓN 1: GESTIÓN INTERNA */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <Briefcase size={16} /> Gestión Interna
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Agente Read-Only */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Agente Responsable</label>
                        <div className="relative flex items-center bg-slate-950/50 border border-amber-500/20 rounded-xl p-3.5 text-slate-200">
                            <User size={20} className="text-amber-200 mr-3" weight="fill" />
                            <span className="font-bold text-sm tracking-wide">{user?.name || "Usuario"}</span>
                        </div>
                    </div>

                    {/* Origen */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Origen Contacto</label>
                        <div className="relative">
                            <select name="origen" value={formData.origen} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 pl-10 text-sm text-slate-200 appearance-none focus:border-amber-200/50 focus:outline-none transition-all cursor-pointer">
                                <option value="">Seleccionar Origen...</option>
                                <option>INSTAGRAM AGENTE</option><option>FACEBOOK AGENTE</option><option>TIK TOK AGENTE</option>
                                <option>FACEBOOK ADS</option><option>INSTAGRAM WARNER</option><option>FACEBOOK WARNER</option><option>TIK TOK WARNER</option>
                                <option>CARTEL COLOCADO</option><option>REFERIDO</option><option>OTRO</option>
                            </select>
                            <PaperPlaneRight className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <CaretRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>
              </div>

              {/* SECCIÓN 2: DATOS CLIENTE */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <User size={16} /> Datos del Cliente
                </h3>
                
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Nombre Completo</label>
                        <input type="text" name="nombre_cliente" placeholder="Nombre y Apellido" value={formData.nombre_cliente} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all uppercase" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Teléfono</label>
                            <Phone className="absolute left-4 top-[38px] text-slate-500" size={18} />
                            <input type="tel" name="telefono" placeholder="Ej: 381..." value={formData.telefono} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 pl-11 text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Email (Opcional)</label>
                            <input type="email" name="email" placeholder="cliente@email.com" value={formData.email} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
                        </div>
                    </div>
                </div>
              </div>

              {/* SECCIÓN 3: PERFIL DE BÚSQUEDA */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <Buildings size={16} /> Perfil de Búsqueda
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Operación</label>
                        <div className="flex bg-slate-950/50 rounded-xl border border-white/10 p-1">
                            {['COMPRA', 'ALQUILER'].map(m => (
                                <button key={m} type="button" onClick={() => setFormData({...formData, operacion: m})}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.operacion === m ? 'bg-amber-500 text-slate-900 shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Tipo Inmueble</label>
                        <div className="relative">
                            <select name="tipo_inmueble" value={formData.tipo_inmueble} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-sm text-slate-200 appearance-none focus:border-amber-200/50 focus:outline-none">
                                <option value="">Seleccionar...</option>
                                <option>CASA</option><option>DEPARTAMENTO</option><option>TERRENO</option>
                                <option>DUPLEX</option><option>LOCAL COMERCIAL</option><option>OFICINA</option><option>GALPÓN</option>
                            </select>
                            <CaretRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Amb.</label>
                        <input type="number" name="ambientes" placeholder="#" value={formData.ambientes} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-center text-slate-200 focus:border-amber-200/50 focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Coch.</label>
                        <input type="number" name="cochera" placeholder="#" value={formData.cochera} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-center text-slate-200 focus:border-amber-200/50 focus:outline-none" />
                    </div>
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Piso Pref.</label>
                        <input type="text" name="piso" placeholder="Ej: PB" value={formData.piso} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-slate-200 focus:border-amber-200/50 focus:outline-none uppercase" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Zona de Preferencia</label>
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input type="text" name="zona" placeholder="Ej: BARRIO NORTE, YERBA BUENA..." value={formData.zona} onChange={handleChange}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 pl-11 text-slate-200 focus:border-amber-200/50 focus:outline-none uppercase" />
                    </div>
                </div>
              </div>

              {/* SECCIÓN 4: PRESUPUESTO */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <Money size={16} /> Inversión
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Moneda</label>
                        <div className="flex bg-slate-950/50 rounded-xl border border-white/10 p-1">
                            {['DOLARES', 'PESOS'].map(m => (
                                <button key={m} type="button" onClick={() => setFormData({...formData, moneda: m})}
                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.moneda === m ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Presupuesto Máx</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input type="number" name="presupuesto" placeholder="Monto..." value={formData.presupuesto} onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 pl-11 text-slate-200 focus:border-green-500/50 focus:outline-none" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">¿Accede a Crédito?</label>
                    <div className="flex bg-slate-950/50 rounded-xl border border-white/10 p-1 w-1/2">
                        {['NO', 'SI'].map(op => (
                            <button key={op} type="button" onClick={() => setFormData({...formData, credito: op})}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${formData.credito === op ? (op === 'SI' ? 'bg-green-600 text-white' : 'bg-slate-700 text-white') : 'text-slate-500 hover:text-slate-300'}`}>
                                {op}
                            </button>
                        ))}
                    </div>
                </div>
              </div>

              {/* OBS */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                 <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Observaciones</label>
                 <textarea name="observaciones" rows="3" placeholder="Detalles extra..." value={formData.observaciones} onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-200 focus:border-amber-200/50 focus:outline-none uppercase text-sm custom-scroll" />
              </div>

              {/* Botón Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-sm uppercase tracking-widest hover:brightness-110">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <> <UserPlus size={24} weight="fill"/> REGISTRAR CLIENTE</>}
              </button>

            </form>
        </motion.div>
      </div>
    </div>
  );
}
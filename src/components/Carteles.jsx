import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore'; 
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, FileText, UploadSimple, CheckCircle, 
  CaretRight, SpinnerGap, Signpost, User,
  MagnifyingGlass, House, X
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

export default function Carteles() {
  const navigate = useNavigate();
  const { user } = useAppStore(); 
  const dropdownRef = useRef(null);
  
  const fileInputFoto = useRef(null);
  const fileInputNota = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);
  const [properties, setProperties] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({ agente: user?.name || '', padron: '' });
  const [foto, setFoto] = useState(null);
  const [nota, setNota] = useState(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProps(true);
      try {
        const response = await fetch(`${API_URL}?action=getInmuebles&filtro_carteles=true`, {
          method: 'GET',
          mode: 'cors',      // Forzar modo CORS
          redirect: 'follow' // OBLIGATORIO: Google redirige a una URL temporal
        });

        if (!response.ok) throw new Error('Error en la red');
        
        const data = await response.json();
        if (Array.isArray(data)) setProperties(data);
      } catch (err) {
        console.error("Error cargando propiedades:", err);
        toast.error("Error de conexión con el servidor");
      } finally {
        setLoadingProps(false);
      }
    };

    fetchProperties();
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
    p.direccion.toLowerCase().includes(searchTerm.toLowerCase()) || String(p.padron).includes(searchTerm)
  );

  const handleSelectProperty = (prop) => {
    setFormData({ ...formData, padron: prop.padron });
    setSearchTerm(prop.direccion); 
    setIsDropdownOpen(false); 
  };

  const processFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve({ fileName: file.name, mimeType: file.type, data: reader.result.split(',')[1] });
      reader.onerror = reject;
    });
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Archivo muy pesado (Máx 5MB)");

    try {
      const processed = await processFile(file);
      if (type === 'foto') setFoto(processed);
      if (type === 'nota') setNota(processed);
      toast.success("Archivo adjuntado");
    } catch { toast.error("Error leyendo archivo"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agente) return toast.error("Error de sesión");
    if (!formData.padron) return toast.warning("Selecciona una propiedad");
    if (!foto) return toast.warning("Falta la foto");

    setLoading(true);
    try {
      const response = await fetch(API_URL, { 
        method: 'POST', 
        redirect: 'follow', // Crucial para la respuesta POST
        body: JSON.stringify({ 
          action: 'addCartel', 
          agente: formData.agente, 
          padron_catastral: formData.padron, 
          foto_cartel: foto, 
          nota_cartel: nota || null 
        }) 
      });
      
      const res = await response.json();

      if (res.status === 'success') {
        toast.success("¡Cartel registrado!");
        setFormData({ ...formData, padron: '' }); 
        setSearchTerm(''); 
        setFoto(null); 
        setNota(null);
        if(fileInputFoto.current) fileInputFoto.current.value = "";
        if(fileInputNota.current) fileInputNota.current.value = "";
      } else {
        toast.error("Error en el servidor: " + res.message);
      }
    } catch (err) { 
      toast.error("Error de conexión"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-white font-sans overflow-y-auto overflow-x-hidden custom-scroll relative selection:bg-amber-500/30 selection:text-amber-900">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Fondos Ambientales Warner */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      <button onClick={() => navigate('/', { state: { view: 'FORMS' } })} className="fixed top-4 left-4 z-50 group flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full hover:border-amber-200/50 transition-all shadow-lg active:scale-95">
        <CaretRight size={14} weight="bold" className="rotate-180 text-slate-400 group-hover:text-amber-200 transition-colors" />
        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-200 uppercase tracking-widest transition-colors">Volver</span>
      </button>

      <div className="min-h-full flex justify-center p-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg relative z-10">
            
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-white/10 shadow-xl mb-4">
                  <Signpost size={40} weight="duotone" className="text-amber-200" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
                Registro de Cartel
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">EVIDENCIA FOTOGRÁFICA</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* TARJETA 1: RESPONSABLE */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-0">
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

              {/* TARJETA 2: PROPIEDAD */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-50">
                 <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Propiedad (Pendiente de Cartel)</label>
                 
                 <div className="relative" ref={dropdownRef}>
                    <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors">
                            {loadingProps ? <SpinnerGap className="animate-spin" size={20} /> : <MagnifyingGlass size={20} />}
                        </div>
                        <input 
                            type="text" placeholder="Buscar dirección o padrón..." value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setFormData({ ...formData, padron: '' }); setIsDropdownOpen(true); }}
                            onFocus={() => setIsDropdownOpen(true)}
                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 pl-12 text-slate-200 placeholder:text-slate-600 focus:border-amber-200/50 focus:ring-1 focus:ring-amber-200/20 focus:outline-none transition-all"
                        />
                        {searchTerm && <button type="button" onClick={() => { setSearchTerm(''); setFormData({...formData, padron:''}) }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={16} /></button>}
                    </div>

                    <AnimatePresence>
                        {isDropdownOpen && !loadingProps && (
                        <motion.ul initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} 
                            className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scroll ring-1 ring-white/10">
                            {filteredProperties.length > 0 ? (
                            filteredProperties.map((prop, idx) => (
                                <li key={idx} onClick={() => handleSelectProperty(prop)} className="px-5 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-3 transition-all group">
                                    <House size={16} className="text-slate-500 group-hover:text-amber-200 transition-colors" />
                                    <div><span className="text-sm font-bold text-slate-300 block group-hover:text-white">{prop.direccion}</span><span className="text-[10px] text-slate-600 font-mono">Padrón: {prop.padron}</span></div>
                                </li>
                            ))
                            ) : <li className="px-4 py-6 text-slate-600 text-xs text-center uppercase tracking-widest">No hay pendientes</li>}
                        </motion.ul>
                        )}
                    </AnimatePresence>
                 </div>
              </div>

              {/* TARJETA 3: EVIDENCIA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-0">
                 <div onClick={() => fileInputFoto.current.click()} className={`bg-slate-900/60 backdrop-blur-xl border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group h-40 ${foto ? 'border-green-500/50 bg-green-500/10' : 'border-slate-700 hover:border-amber-200/50 hover:bg-slate-800'}`}>
                    {foto ? (
                        <> <CheckCircle size={32} weight="fill" className="text-green-400 mb-2" /> <span className="text-xs font-bold text-green-200 text-center truncate w-full">{foto.fileName}</span> </>
                    ) : (
                        <> <Camera size={32} className="text-slate-500 group-hover:text-amber-200 mb-2 transition-colors" /> <span className="text-[10px] font-bold text-slate-500 group-hover:text-amber-100 uppercase tracking-widest">SUBIR FOTO</span> </>
                    )}
                    <input type="file" ref={fileInputFoto} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'foto')} />
                 </div>

                 <div onClick={() => fileInputNota.current.click()} className={`bg-slate-900/60 backdrop-blur-xl border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group h-40 ${nota ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800'}`}>
                    {nota ? (
                        <> <FileText size={32} weight="fill" className="text-blue-400 mb-2" /> <span className="text-xs font-bold text-blue-200 text-center truncate w-full">{nota.fileName}</span> </>
                    ) : (
                        <> <UploadSimple size={32} className="text-slate-500 group-hover:text-slate-300 mb-2 transition-colors" /> <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-widest">NOTA (OPC)</span> </>
                    )}
                    <input type="file" ref={fileInputNota} className="hidden" accept=".pdf,.doc,.docx,image/*" onChange={(e) => handleFileChange(e, 'nota')} />
                 </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.2)] hover:shadow-[0_0_50px_rgba(251,191,36,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-sm uppercase tracking-widest hover:brightness-110">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : "CONFIRMAR INSTALACIÓN"}
              </button>

            </form>
        </motion.div>
      </div>
    </div>
  );
}
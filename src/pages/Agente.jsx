import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop'; 
import getCroppedImg from '../utils/canvasUtils'; 
import { 
  CaretRight, Camera, EnvelopeSimple, SpinnerGap, 
  Phone, Buildings, CalendarBlank, ShieldCheck, X, Check 
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

// TU URL DE APPS SCRIPT
const API_URL = import.meta.env.VITE_API_URL;
export default function Agente() {
  const { user, login } = useAppStore(); 
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(user?.avatar || null);

  // --- ESTADOS PARA EL RECORTADOR (CROPPER) ---
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  // 1. Cuando el usuario selecciona un archivo
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { toast.error("Imagen muy pesada (Máx 5MB)"); return; }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  // 2. Cuando el usuario mueve o zoomea
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 3. Guardar recorte
  const handleSaveCrop = async () => {
    try {
      setUploading(true);
      const croppedImageBase64 = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      setPreview(croppedImageBase64);
      setIsCropping(false); 

      const base64Data = croppedImageBase64.split(',')[1];
      
      const payload = { 
        email: user.email, 
        image: base64Data, 
        mimeType: 'image/jpeg' 
      };
      
      const response = await fetch(`${API_URL}?action=uploadAvatar`, { 
          method: 'POST', 
          mode: 'cors',
          redirect: 'follow',
          body: JSON.stringify(payload) 
      });
      
      const result = await response.json();

      if (result.success) {
          toast.success("Foto actualizada");
          login({ ...user, avatar: result.url }); 
      } else {
          throw new Error(result.error);
      }

    } catch (e) {
      console.error(e);
      toast.error("Error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const InfoItem = ({ icon, label, value }) => (
    <div className="p-3 md:p-4 bg-slate-950/50 rounded-2xl border border-white/5 flex items-center gap-3 md:gap-4 transition hover:bg-slate-900/80 hover:border-amber-200/20 group overflow-hidden">
      <div className="p-2 md:p-2.5 rounded-xl bg-white/5 text-slate-400 group-hover:text-amber-200 group-hover:bg-amber-500/10 transition-colors shrink-0">
        {icon}
      </div>
      <div className="overflow-hidden min-w-0 flex-1">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">{label}</p>
        <p className="text-sm text-slate-200 font-medium truncate" title={value}>{value || 'No especificado'}</p>
      </div>
    </div>
  );

  return (
    // min-h-[100dvh] evita problemas con barras de navegador móvil
    <div className="min-h-[100dvh] bg-slate-950 text-white p-4 md:p-6 font-sans relative overflow-x-hidden overflow-y-auto flex justify-center custom-scroll">
      <Toaster position="top-center" theme="dark" richColors />
      
      {/* Fondo Ambient */}
      <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-amber-500/10 blur-[120px] md:blur-[150px] rounded-full pointer-events-none fixed" />
      <div className="absolute bottom-0 left-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-indigo-500/10 blur-[120px] md:blur-[150px] rounded-full pointer-events-none fixed" />

      {/* Botón Volver Ajustado */}
      <button onClick={() => navigate('/')} className="absolute top-4 left-4 md:top-6 md:left-6 z-20 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-200 transition-colors uppercase tracking-widest bg-slate-900/50 p-2 rounded-full md:bg-transparent md:p-0">
        <CaretRight size={14} weight="bold" className="rotate-180" /> Volver
      </button>

      {/* --- MODAL DE RECORTE (MOBILE FRIENDLY) --- */}
      <AnimatePresence>
        {isCropping && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            {/* Contenedor de la imagen */}
            <div className="relative w-full max-w-md h-[300px] md:h-[400px] bg-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl mb-6">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                cropShape="round" 
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Controles */}
            <div className="w-full max-w-md bg-slate-900/80 p-5 md:p-6 rounded-3xl border border-white/10 backdrop-blur-xl">
               <div className="flex flex-col gap-2 mb-6">
                 <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <span>- Zoom</span>
                    <span>+ Zoom</span>
                 </div>
                 <input
                   type="range"
                   value={zoom}
                   min={1}
                   max={3}
                   step={0.1}
                   onChange={(e) => setZoom(e.target.value)}
                   // Slider más grueso para dedos
                   className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-200"
                 />
               </div>
               
               <div className="flex gap-3">
                 <button 
                   onClick={() => { setIsCropping(false); setImageSrc(null); fileInputRef.current.value = null; }}
                   className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
                 >
                    <X size={18} weight="bold"/> Cancelar
                 </button>
                 <button 
                   onClick={handleSaveCrop}
                   disabled={uploading}
                   className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-200 to-amber-400 text-slate-900 font-bold shadow-lg hover:shadow-amber-200/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                   {uploading ? <SpinnerGap className="animate-spin" size={20} /> : <><Check size={18} weight="bold"/> Guardar</>}
                 </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl mt-12 md:mt-10 mb-10 z-10"
      >
        {/* CABECERA DEL PERFIL */}
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 shadow-2xl mb-4 md:mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"></div>

            {/* AVATAR */}
            <div className="relative group cursor-pointer inline-block mx-auto mb-4 md:mb-6" onClick={() => !uploading && fileInputRef.current.click()}>
                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-amber-200 to-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.2)] ${uploading ? 'animate-pulse' : ''}`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-slate-800 flex items-center justify-center relative">
                        {preview ? (
                            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl md:text-4xl font-black text-amber-100">{user?.name?.charAt(0) || 'W'}</span>
                        )}
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                            <Camera size={24} md:size={28} className="text-white mb-1" />
                            <span className="text-[9px] font-bold uppercase text-white/80">Editar</span>
                        </div>
                    </div>
                </div>
                {/* Botón flotante solo visible en móvil para indicar que se puede tocar */}
                <div className="md:hidden absolute bottom-0 right-0 bg-slate-900 border border-white/20 p-1.5 rounded-full text-amber-200 shadow-md">
                     <Camera size={14} weight="fill" />
                </div>
            </div>
            
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">{user?.name || 'Agente Warner'}</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} weight="fill" />
                {user?.cargo || 'Staff'}
            </div>
        </div>

        {/* GRILLA DE DATOS */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 shadow-xl">
            <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 md:mb-6 pl-2 border-l-2 border-amber-200">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <InfoItem icon={<EnvelopeSimple size={20} weight="duotone" />} label="Correo Electrónico" value={user?.email} />
                <InfoItem icon={<Phone size={20} weight="duotone" />} label="Teléfono Móvil" value={user?.telefono} />
                <InfoItem icon={<Buildings size={20} weight="duotone" />} label="Departamento / Área" value={user?.departamento} />
                <InfoItem icon={<CalendarBlank size={20} weight="duotone" />} label="Fecha de Ingreso" value={user?.fechaIngreso} />
            </div>

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-[10px] md:text-xs gap-2 md:gap-0">
                <span>Warner Bros. Estate Tech</span>
                <span>ID: <span className="font-mono text-slate-400">WRN-{user?.name?.length || 0}99</span></span>
            </div>
        </div>
      </motion.div>
    </div>
  );
}
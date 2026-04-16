import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CaretRight, House, CalendarCheck, LockKey, ClipboardText, 
  ArrowUpRight, FilePdf, PlayCircle, X, DownloadSimple, CornersOut, User
} from 'phosphor-react';

export default function Procedimientos({ setActiveView }) {
  const [selectedSubSection, setSelectedSubSection] = useState(null);

  const ActionCard = ({ link, onClick }) => {
    const cardClasses = "group relative flex flex-col justify-between min-h-[140px] md:min-h-[160px] p-5 md:p-6 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-amber-200/40 transition-all duration-300 cursor-pointer";

    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cardClasses}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="flex justify-between items-start z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-amber-200 shadow-inner group-hover:bg-amber-900/20 transition-all duration-300">
            {link.icon}
          </div>
          <div className="p-1.5 md:p-2 rounded-full bg-white/5 group-hover:bg-amber-200 text-slate-500 group-hover:text-slate-900 transition-colors">
            <ArrowUpRight size={14} weight="bold" /> 
          </div>
        </div>
        <div className="z-10 flex flex-col gap-1 mt-4">
          <span className="font-bold text-slate-200 text-xs md:text-sm tracking-wide group-hover:text-amber-100 transition-colors line-clamp-1">
            {link.label}
          </span>
          {link.description && (
            <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight group-hover:text-slate-400 transition-colors">
              {link.description}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  const CaptacionDetail = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-6xl space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase">Protocolo de <span className="text-amber-200">Captación</span></h2>
            <p className="text-slate-400 text-sm">POE, Vídeo de entrenamiento y material de soporte.</p>
          </div>
          <button 
            onClick={() => setSelectedSubSection(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/60 border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <X size={16} weight="bold" /> Cerrar Detalle
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl group">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><FilePdf size={20} weight="fill" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Documento POE</span>
                </div>
                <a 
                  href="/procedimientos/captacion/POE_Captacion.pdf" 
                  download 
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                  title="Descargar PDF"
                >
                  <DownloadSimple size={20} />
                </a>
             </div>
             <div className="flex-1 bg-slate-950/50 relative">
                <iframe 
                  src="/procedimientos/captacion/POE_Captacion.pdf#toolbar=0" 
                  className="w-full h-full border-0"
                  title="PDF POE Captación"
                ></iframe>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href="/procedimientos/captacion/POE_Captacion.pdf" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-amber-400 text-slate-900 rounded-lg font-bold text-[10px] shadow-xl"
                  >
                    <CornersOut size={14} weight="bold" /> VER PANTALLA COMPLETA
                  </a>
                </div>
             </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl group">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><PlayCircle size={20} weight="fill" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Entrenamiento Vídeo</span>
                </div>
             </div>
             <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
                <video 
                  src="/procedimientos/captacion/POE_Captacion.mp4" 
                  controls 
                  className="max-w-full max-h-full"
                ></video>
             </div>
             <div className="p-6 bg-slate-900/40 border-t border-white/5">
                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Puntos Clave del Vídeo</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> Abordaje psicológico y neuroventas.
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> Relevamiento técnico del activo.
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> Presentación de valor y cierre de exclusiva.
                  </li>
                </ul>
             </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const VisitaDetail = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-6xl space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase">Protocolo de <span className="text-amber-200">Visitas</span></h2>
            <p className="text-slate-400 text-sm">POE Visitas y El Espectáculo Inmobiliario.</p>
          </div>
          <button 
            onClick={() => setSelectedSubSection(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/60 border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <X size={16} weight="bold" /> Cerrar Detalle
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl group">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><FilePdf size={20} weight="fill" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Documento POE Visitas</span>
                </div>
                <a 
                  href="/procedimientos/visitas/POE_Visitas.pdf" 
                  download 
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                  title="Descargar PDF"
                >
                  <DownloadSimple size={20} />
                </a>
             </div>
             <div className="flex-1 bg-slate-950/50 relative">
                <iframe 
                  src="/procedimientos/visitas/POE_Visitas.pdf#toolbar=0" 
                  className="w-full h-full border-0"
                  title="PDF POE Visitas"
                ></iframe>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href="/procedimientos/visitas/POE_Visitas.pdf" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-amber-400 text-slate-900 rounded-lg font-bold text-[10px] shadow-xl"
                  >
                    <CornersOut size={14} weight="bold" /> VER PANTALLA COMPLETA
                  </a>
                </div>
             </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl group">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><PlayCircle size={20} weight="fill" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">El Espectáculo Inmobiliario</span>
                </div>
             </div>
             <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
                <video 
                  src="/procedimientos/visitas/POE_Visitas.mp4" 
                  controls 
                  className="max-w-full max-h-full"
                ></video>
             </div>
             <div className="p-6 bg-slate-900/40 border-t border-white/5">
                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Puntos Clave del Vídeo</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> Preparación del escenario (Home Staging Express).
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> Manejo de la primera impresión del cliente.
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> El cierre de la visita y compromiso.
                  </li>
                </ul>
             </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const ReservaDetail = () => {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-6xl space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2 uppercase">Protocolo de <span className="text-amber-200">Reserva y Negociación</span></h2>
            <p className="text-slate-400 text-sm">POE Gestión de Ofertas y Negociación Estratégica.</p>
          </div>
          <button 
            onClick={() => setSelectedSubSection(null)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800/60 border border-white/10 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-95"
          >
            <X size={16} weight="bold" /> Cerrar Detalle
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl group">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg text-red-400"><FilePdf size={20} weight="fill" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Documento POE Reservas</span>
                </div>
                <a 
                  href="/procedimientos/reservas/POE_Reservas.pdf" 
                  download 
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                  title="Descargar PDF"
                >
                  <DownloadSimple size={20} />
                </a>
             </div>
             <div className="flex-1 bg-slate-950/50 relative">
                <iframe 
                  src="/procedimientos/reservas/POE_Reservas.pdf#toolbar=0" 
                  className="w-full h-full border-0"
                  title="PDF POE Reservas"
                ></iframe>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href="/procedimientos/reservas/POE_Reservas.pdf" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-amber-400 text-slate-900 rounded-lg font-bold text-[10px] shadow-xl"
                  >
                    <CornersOut size={14} weight="bold" /> VER PANTALLA COMPLETA
                  </a>
                </div>
             </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl group">
             <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><PlayCircle size={20} weight="fill" /></div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">Gestión de Ofertas</span>
                </div>
             </div>
             <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
                <video 
                  src="/procedimientos/reservas/POE_Reservas.mp4" 
                  controls 
                  className="max-w-full max-h-full"
                ></video>
             </div>
             <div className="p-6 bg-slate-900/40 border-t border-white/5">
                <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Puntos Clave del Vídeo</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> Toma de reserva y documentación legal.
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> Estrategias de negociación con propietarios.
                  </li>
                  <li className="flex items-center gap-2 text-[11px] text-slate-400">
                    <div className="w-1 h-1 rounded-full bg-amber-400" /> El cierre de la oferta y compromiso de venta.
                  </li>
                </ul>
             </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full w-full mx-auto flex flex-col items-center pb-10 relative px-4 overflow-y-auto custom-scroll">
      <AnimatePresence mode="wait">
        {!selectedSubSection ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full flex flex-col items-center justify-center pt-8"
          >
            <button 
              onClick={() => setActiveView("HUB")} 
              className="absolute top-0 left-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-amber-200 mb-2 transition-colors flex items-center gap-2"
            >
              <CaretRight size={12} weight="bold" className="rotate-180" /> Volver
            </button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-6xl mt-8">
              <ActionCard 
                onClick={() => setSelectedSubSection('captacion')}
                link={{ 
                  label: "Captación", 
                  description: "Procedimientos para el ingreso y tasación de propiedades.", 
                  icon: <House size={20} />
                }} 
              />
              <ActionCard 
                onClick={() => setSelectedSubSection('visita')}
                link={{ 
                  label: "Visita", 
                  description: "Protocolo de muestra de inmuebles a clientes.", 
                  icon: <CalendarCheck size={20} />
                }} 
              />
              <ActionCard 
                onClick={() => setSelectedSubSection('reserva')}
                link={{ 
                  label: "Reserva y Negociación", 
                  description: "Pasos para tomar reservas y negociar condiciones.", 
                  icon: <LockKey size={20} />
                }} 
              />
              <ActionCard 
                onClick={() => setSelectedSubSection('cierre')}
                link={{ 
                  label: "Cierre de Operación", 
                  description: "Documentación final y firma de contratos.", 
                  icon: <ClipboardText size={20} />
                }} 
              />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="w-full pt-4"
          >
            {selectedSubSection === 'captacion' && <CaptacionDetail />}
            {selectedSubSection === 'visita' && <VisitaDetail />}
            {selectedSubSection === 'reserva' && <ReservaDetail />}
            {['cierre'].includes(selectedSubSection) && (
               <div className="flex flex-col items-center justify-center h-64 text-slate-500 uppercase tracking-[0.3em] font-black text-xs">
                  <span>En Desarrollo</span>
                  <button onClick={() => setSelectedSubSection(null)} className="mt-4 text-amber-200 hover:text-white transition-colors">Volver</button>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

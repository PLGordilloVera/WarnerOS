import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importamos useLocation
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SignOut, Kanban, ClipboardText, BookOpen, Database, ChartLineUp, MapTrifold, 
  House, Signpost, UserPlus, UserMinus, HouseLine, // Iconos necesarios
  IdentificationCard, Megaphone, LockKey, Star, Calculator, CalendarCheck, 
  Users, Presentation, CaretRight, Sparkle, SunHorizon, Moon, CloudSun, ArrowUpRight, Buildings
} from 'phosphor-react';
import CRM from '../components/CRM';
import Rendimiento from '../components/Rendimiento';

// --- DATOS Y LISTAS ---
const TOOLS = [
  { id: 'FORMS', label: 'Formularios Maestros', desc: 'Cargar datos de acciones.', icon: <ClipboardText size={22} weight="duotone" /> },
  { id: 'BBDD', label: 'Bases de Datos', desc: 'Matrices de solo lectura.', icon: <Database size={22} weight="duotone" /> },
  { id: 'PROCEDIMIENTOS', label: 'Guias de accion', desc: 'Manuales y Flujos.', icon: <BookOpen size={22} weight="duotone" /> },
  { id: 'MAPA', label: 'Mapa de inmuebles', desc: 'Geolocalización real.', icon: <MapTrifold size={22} weight="duotone" /> },
];

const LINKS_FORMULARIOS = [
  // 👇 CAMBIO CLAVE: Ruta interna para Cartera Inmuebles
  { label: 'Cartera Inmuebles', icon: <House size={20} />, url: '/cartera' }, 
  { label: 'Carteles', icon: <Signpost size={20} />, url: '/carteles' },
  { label: 'Comprador', icon: <UserPlus size={20} />, url: '/compradores' },
  { label: 'Vendedor', icon: <HouseLine size={20} />, url: '/vendedores' }, 
  { label: 'Personal', icon: <IdentificationCard size={20} />, url: import.meta.env.VITE_LINK_FORM_PERSONAL },
  { label: 'Publicidad', icon: <Megaphone size={20} />, url: import.meta.env.VITE_LINK_FORM_PUBLICIDAD },
  { label: 'Reservas', icon: <LockKey size={20} />, url: '/reservas' },
  { label: 'Reseñas', icon: <Star size={20} />, url: '/resenas' },
  { label: 'Valuación', icon: <Calculator size={20} />, url: '/valuacion' },
  { label: 'Visita', icon: <CalendarCheck size={20} />, url: '/visitas' }
];

const LINKS_BBDD = [
  { label: 'Cartera Inmuebles', icon: <House size={20} />, url: import.meta.env.VITE_LINK_BBDD_CARTERA },
  { label: 'Clientes', icon: <Users size={20} />, url: import.meta.env.VITE_LINK_BBDD_CLIENTES },
  { label: 'Valuación', icon: <Calculator size={20} />, url: import.meta.env.VITE_LINK_BBDD_VALUACION },
  { label: 'Visitas', icon: <CalendarCheck size={20} />, url: import.meta.env.VITE_LINK_BBDD_VISITAS },
  { label: 'Publicidad', icon: <Megaphone size={20} />, url: import.meta.env.VITE_LINK_BBDD_PUBLICIDAD },
  { label: 'Carteles', icon: <Signpost size={20} />, url: import.meta.env.VITE_LINK_BBDD_CARTELES },
  { label: 'Reseñas', icon: <Star size={20} />, url: import.meta.env.VITE_LINK_BBDD_RESENAS }
];

const WarnerLogoSmall = () => {
  const [imgError, setImgError] = useState(false);
  if (imgError) return <Buildings weight="fill" className="text-amber-200 w-8 h-8 md:w-10 md:h-10" />;
  return <img src="/logo.png" alt="Warner" className="w-10 h-10 md:w-12 md:h-12 object-contain" onError={() => setImgError(true)} />;
};

export default function Dashboard() {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para leer el estado de la navegación

  // Inicializar activeView con el estado pasado por navegación o 'CRM' por defecto
  const [activeView, setActiveView] = useState(location.state?.view || 'CRM');
  
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Buenos días');
      setGreetingIcon(<CloudSun size={24} weight="fill" className="text-amber-200" />);
    } else if (hour < 19) {
      setGreeting('Buenas tardes');
      setGreetingIcon(<SunHorizon size={24} weight="fill" className="text-amber-300" />);
    } else {
      setGreeting('Buenas noches');
      setGreetingIcon(<Moon size={24} weight="fill" className="text-indigo-200" />);
    }
  }, []);

  // Efecto para actualizar la vista si cambia el estado de navegación (ej. al volver de un formulario)
  useEffect(() => {
    if (location.state?.view) {
      setActiveView(location.state.view);
      // Opcional: Limpiar el estado para evitar que al recargar se quede pegado, 
      // aunque en este caso es útil que persista si recarga.
      // window.history.replaceState({}, document.title); 
    }
  }, [location.state]);


  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const NavItem = ({ view, icon, label, mobile = false }) => {
    const isActive = activeView === view;
    const baseClasses = mobile 
      ? "relative flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-full"
      : "relative flex items-center gap-3 px-6 py-3 rounded-full text-base font-bold transition-all duration-300 whitespace-nowrap";
    
    const activeText = isActive ? 'text-slate-900' : 'text-slate-400 hover:text-amber-200';
    const mobileActiveText = isActive ? 'text-amber-200' : 'text-slate-500';

    return (
      <button 
        onClick={() => setActiveView(view)} 
        className={`${baseClasses} ${mobile ? mobileActiveText : activeText}`}
      >
        {isActive && !mobile && (
          <motion.div layoutId="capsule" className="absolute inset-0 bg-gradient-to-r from-amber-200 to-amber-100 rounded-full shadow-[0_0_20px_rgba(253,230,138,0.4)]" />
        )}
        {isActive && mobile && (
           <motion.div layoutId="mobile-glow" className="absolute -top-1 w-8 h-1 bg-amber-200 rounded-full shadow-[0_0_10px_rgba(253,230,138,0.8)]" />
        )}
        <span className="relative z-10">{icon}</span>
        <span className={`relative z-10 ${mobile ? 'text-[10px] mt-1 font-medium' : ''}`}>{label}</span>
      </button>
    );
  };

  const ActionCard = ({ link }) => {
    const isExternal = link.url.startsWith('http');
    const cardClasses = "group relative flex flex-col justify-between h-32 md:h-36 p-5 md:p-6 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-amber-200/40 transition-all duration-300 cursor-pointer";

    const CardContent = () => (
      <>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-200/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="flex justify-between items-start z-10">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-amber-200 shadow-inner group-hover:bg-amber-900/20 transition-all duration-300">
            {link.icon}
          </div>
          <div className="p-1.5 md:p-2 rounded-full bg-white/5 group-hover:bg-amber-200 text-slate-500 group-hover:text-slate-900 transition-colors">
            <ArrowUpRight size={14} weight="bold" className={isExternal ? "" : "rotate-45"} /> 
          </div>
        </div>
        <span className="font-bold text-slate-200 text-xs md:text-sm tracking-wide z-10 group-hover:text-amber-100 transition-colors line-clamp-2">
          {link.label}
        </span>
      </>
    );

    return isExternal ? (
      <motion.a 
        href={link.url} target="_blank" rel="noreferrer"
        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
        className={cardClasses}
      >
        <CardContent />
      </motion.a>
    ) : (
      <motion.div 
        onClick={() => navigate(link.url)}
        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
        className={cardClasses}
      >
        <CardContent />
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950 text-slate-100 overflow-hidden font-sans selection:bg-amber-200 selection:text-slate-900 relative">
      
      {/* FONDO */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
         <img src="/logo.png" alt="" className="w-[800px] opacity-[0.03] grayscale blur-sm" />
      </div>

      {/* --- HEADER ESCRITORIO --- */}
      <header className="hidden md:flex absolute top-8 left-1/2 -translate-x-1/2 z-50 items-center p-2 bg-slate-900/70 backdrop-blur-2xl border border-white/10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/5 w-auto max-w-[98vw]">
        <div className="flex items-center gap-6 pl-8 pr-6 border-r border-white/10 shrink-0">
           <WarnerLogoSmall />
           <span className="font-black tracking-[0.2em] text-sm text-white hidden xl:block uppercase">WARNER OS</span>
        </div>

        <nav className="flex items-center px-6 gap-4 shrink-0">
          <NavItem view="CRM" icon={<Kanban size={24} weight="duotone" />} label="Pipeline" />
          <NavItem view="RENDIMIENTO" icon={<ChartLineUp size={24} weight="duotone" />} label="Data" />
          <NavItem view="HUB" icon={<Sparkle size={24} weight="duotone" />} label="Hub" />
        </nav>

        <div className="flex items-center gap-4 pl-6 pr-4 border-l border-white/10 shrink-0">
          <button 
            onClick={() => navigate('/agente')} 
            className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-800/60 border border-white/10 shadow-inner hover:bg-slate-800 transition-colors group whitespace-nowrap"
          >
            {user?.avatar && user.avatar.includes('http') ? (
                <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-amber-200/50" />
            ) : ( greetingIcon )}
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wider group-hover:text-amber-200 transition-colors hidden sm:block">
              {user?.name?.split(' ')[0]}
            </span>
          </button>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="p-3 text-slate-400 hover:text-red-400 transition-colors bg-white/5 rounded-full hover:bg-white/10 border border-transparent hover:border-red-500/30">
                <SignOut size={20} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      {/* --- HEADER MÓVIL --- */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <WarnerLogoSmall />
          <span className="font-bold text-white tracking-widest text-xs uppercase">Warner OS</span>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/agente')} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
              {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : greetingIcon}
           </button>
           <button onClick={handleLogout} className="text-slate-400">
             <SignOut size={20} />
           </button>
        </div>
      </header>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="flex-1 w-full h-full pt-4 md:pt-36 px-4 md:px-8 pb-24 md:pb-6 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          
          {activeView === 'CRM' && (
            <motion.div key="CRM" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="h-full w-full">
              <CRM />
            </motion.div>
          )}

          {activeView === 'RENDIMIENTO' && (
            <motion.div 
                key="RENDIMIENTO" 
                initial={{opacity:0}} 
                animate={{opacity:1}} 
                exit={{opacity:0}} 
                className="h-full w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative bg-slate-950/50 backdrop-blur-sm"
            >
                <Rendimiento />
            </motion.div>
          )}

          {activeView === 'HUB' && (
            <motion.div key="HUB" initial={{opacity:0, scale:0.98}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} 
              className="h-full w-full max-w-[98%] md:max-w-[95%] mx-auto flex flex-col lg:flex-row gap-4 lg:gap-6"
            >
                <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0 flex-1 lg:flex-none h-full overflow-hidden">
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl h-full overflow-y-auto custom-scroll">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-1">Central Hub</h3>
                    <p className="text-slate-400 text-xs md:text-sm mb-6 md:mb-8">Acceso rápido a utilidades.</p>
                    <div className="grid grid-cols-1 gap-3">
                      {TOOLS.map(tool => (
                        <button key={tool.id} onClick={() => setActiveView(tool.id)} className="group flex items-center gap-4 p-4 rounded-2xl transition-all bg-white/5 hover:bg-slate-800 border border-white/5 hover:border-amber-200/30 hover:shadow-lg active:scale-95">
                          <div className="text-slate-400 group-hover:text-amber-200 transition-colors">{tool.icon}</div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">{tool.label}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{tool.desc}</span>
                          </div>
                          <CaretRight size={14} className="ml-auto text-slate-600 group-hover:text-amber-200 opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex flex-1 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 items-center justify-center text-slate-500 shadow-inner">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-[0_0_30px_rgba(253,230,138,0.1)]">
                            <Sparkle size={40} weight="fill" className="text-amber-200" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-2">Warner OS Workspace</h4>
                        <p className="text-slate-400 leading-relaxed">Selecciona un módulo del menú.</p>
                    </div>
                </div>
            </motion.div>
          )}

          {activeView === 'FORMS' && (
             <motion.div key="FORMS" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="h-full w-full mx-auto overflow-y-auto custom-scroll pb-20 px-1 md:px-4">
                <header className="mb-6 md:mb-8 mt-2 md:mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <button onClick={() => setActiveView('HUB')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-amber-200 mb-2 md:mb-4 transition-colors flex items-center gap-2">
                            <CaretRight size={12} weight="bold" className="rotate-180" /> Volver
                        </button>
                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">Formularios <span className="text-amber-200">Maestros</span></h2>
                    </div>
                </header>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-5">
                    {LINKS_FORMULARIOS.map((link, idx) => <ActionCard key={idx} link={link} />)}
                </div>
             </motion.div>
          )}

          {activeView === 'BBDD' && (
             <motion.div key="BBDD" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} className="h-full w-full mx-auto overflow-y-auto custom-scroll pb-20 px-1 md:px-4">
                <header className="mb-6 md:mb-8 mt-2 md:mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <button onClick={() => setActiveView('HUB')} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-amber-200 mb-2 md:mb-4 transition-colors flex items-center gap-2">
                            <CaretRight size={12} weight="bold" className="rotate-180" /> Volver
                        </button>
                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">Bases de <span className="text-amber-200">Datos</span></h2>
                    </div>
                </header>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-5">
                    {LINKS_BBDD.map((link, idx) => <ActionCard key={idx} link={link} />)}
                </div>
             </motion.div>
          )}

          {activeView === 'MAPA' && (
             <motion.div key="MAPA" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full w-full bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
                <button onClick={() => setActiveView('HUB')} className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white flex items-center gap-2 hover:border-amber-200 transition-colors shadow-lg">
                    <CaretRight size={12} weight="bold" className="rotate-180" /> Volver
                </button>
                <iframe src="https://mapawarnerdash.onrender.com/" className="w-full h-full border-0 bg-slate-900"></iframe>
             </motion.div>
          )}

          {activeView === 'PROCEDIMIENTOS' && (
             <motion.div key="PROCEDIMIENTOS" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.9}} className="h-full w-full mx-auto flex flex-col items-center justify-center pb-10 relative px-4">
                 <button onClick={() => setActiveView('HUB')} className="absolute top-0 left-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-amber-200 mb-2 transition-colors flex items-center gap-2">
                    <CaretRight size={12} weight="bold" className="rotate-180" /> Volver
                </button>
                <motion.a 
                  href="https://prezi.com/view/FIdlkdnOFVq5kLpcubLt/?referral_token=1NtU1RlnB3FN" target="_blank" rel="noreferrer" 
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group flex flex-col md:flex-row items-center p-6 md:p-10 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] hover:border-amber-200/50 transition-all duration-300 shadow-2xl max-w-2xl w-full text-center md:text-left"
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white md:mr-8 mb-4 md:mb-0 shadow-[0_10px_30px_rgba(220,38,38,0.4)] group-hover:scale-110 transition-transform">
                    <Presentation size={32} md:size={48} weight="fill" />
                  </div>
                  <div>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-2 block">Presentación Interactiva</span>
                    <h3 className="font-black text-white text-2xl md:text-3xl mb-2 group-hover:text-amber-200 transition-colors">Valuación y Captación</h3>
                    <p className="text-sm md:text-base text-slate-400 font-light">Guion comercial y flujo de trabajo certificado.</p>
                  </div>
                </motion.a>
             </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* --- BARRA DE NAVEGACIÓN INFERIOR (Solo Móvil) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 z-50 px-6 py-2 flex justify-between items-center pb-safe-area">
          <NavItem view="CRM" mobile icon={<Kanban size={24} weight="duotone" />} label="Pipeline" />
          <NavItem view="RENDIMIENTO" mobile icon={<ChartLineUp size={24} weight="duotone" />} label="Data" />
          <NavItem view="HUB" mobile icon={<Sparkle size={24} weight="fill" />} label="Hub" />
      </nav>

    </div>
  );
}
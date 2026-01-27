import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Kanban, SpinnerGap, UserCircle, MapPin, MagnifyingGlass, CalendarBlank, WarningCircle, Clock, CalendarCheck, X, WhatsappLogo, EnvelopeSimple, FloppyDisk, CaretLeft, CaretRight } from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

const STAGES = [
  { id: 'INGRESO', label: 'NUEVO INGRESO', color: '#94a3b8' },
  { id: 'CONTACTADO', label: 'CONTACTADO', color: '#60a5fa' },
  { id: 'GESTION', label: 'EN GESTIÓN', color: '#fbbf24' },
  { id: 'RESERVA', label: 'RESERVA / SEÑA', color: '#c084fc' },
  { id: 'CERRADO', label: 'CERRADO', color: '#4ade80' }
];

export default function CRM() {
  const { clients, setClients } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [currentCat, setCurrentCat] = useState('COMPRADOR');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [viewMode, setViewMode] = useState('KANBAN');
  
  // --- ESTADO PARA MÓVIL: ETAPA ACTIVA ---
  const [activeMobileStage, setActiveMobileStage] = useState('INGRESO');

  // --- ESTADOS DEL MODAL ---
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalMode, setModalMode] = useState('VIEW'); // 'VIEW' | 'FORCED'
  const [tempNote, setTempNote] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch(`${API_URL}?action=getData`);
        const data = await response.json();
        setClients(data);
      } catch (error) {
        toast.error('Error sincronizando con Google Sheets');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [setClients]);

  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const clientToMove = clients.find(c => c.id === draggedItemId);
    if (clientToMove.etapa === newStage) return;

    // Actualización optimista
    const updatedClients = clients.map(c => 
      c.id === draggedItemId ? { ...c, etapa: newStage } : c
    );
    setClients(updatedClients);

    // Modal Forzado
    const updatedClient = { ...clientToMove, etapa: newStage };
    setSelectedClient(updatedClient);
    setModalMode('FORCED');
    setTempDate(updatedClient.agenda ? updatedClient.agenda.split('T')[0] : '');
    setTempNote('');
    
    toast.info('¡Movimiento registrado! Define el próximo paso.');
  };

  const handleSaveModal = async () => {
    if (modalMode === 'FORCED' && !tempDate) {
      toast.error('La Próxima Acción es obligatoria para este cambio.');
      return;
    }

    setSaving(true);
    
    let updatedNotes = selectedClient.notas || '';
    if (tempNote.trim()) {
      updatedNotes = `[${new Date().toLocaleDateString('es-AR')}] ${tempNote}\n${updatedNotes}`;
    }

    const finalClient = { 
      ...selectedClient, 
      agenda: tempDate || null, 
      notas: updatedNotes 
    };

    setClients(clients.map(c => c.id === finalClient.id ? finalClient : c));

    try {
      const payload = { 
        id: finalClient.id, 
        etapa: finalClient.etapa, 
        agenda: tempDate, 
        nota: tempNote 
      };
      await fetch(`${API_URL}?action=updateClient&data=${encodeURIComponent(JSON.stringify(payload))}`);
      toast.success('Guardado exitosamente');
      setSelectedClient(null);
    } catch (error) {
      toast.error('Error al guardar en la nube');
    } finally {
      setSaving(false);
    }
  };

  const getHealthStatus = (client) => {
    if (!client.agenda) return { status: 'danger', msg: 'Sin próxima acción' };
    const actionDate = new Date(client.agenda);
    actionDate.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);

    if (actionDate < today) return { status: 'danger', msg: 'Vencido' };
    if (actionDate.getTime() === today.getTime()) return { status: 'warning', msg: 'Hoy' };
    return { status: 'safe', msg: 'Agendado' };
  };

  const filteredClients = clients.filter(c => {
    const matchesCat = c.cat === currentCat;
    const matchesSearch = c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.prop?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // --- LOGICA FECHAS ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const clientsWithAgenda = filteredClients.filter(c => c.agenda);

  const agendaVencida = clientsWithAgenda.filter(c => {
    const dateStr = c.agenda.includes('T') ? c.agenda : `${c.agenda}T12:00:00`;
    const actionDate = new Date(dateStr);
    actionDate.setHours(0, 0, 0, 0);
    return actionDate < today;
  });

  const agendaHoy = clientsWithAgenda.filter(c => {
    const dateStr = c.agenda.includes('T') ? c.agenda : `${c.agenda}T12:00:00`;
    const actionDate = new Date(dateStr);
    actionDate.setHours(0, 0, 0, 0);
    return actionDate.getTime() === today.getTime();
  });

  const agendaFuturo = clientsWithAgenda.filter(c => {
    const dateStr = c.agenda.includes('T') ? c.agenda : `${c.agenda}T12:00:00`;
    const actionDate = new Date(dateStr);
    actionDate.setHours(0, 0, 0, 0);
    return actionDate > today;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <SpinnerGap size={40} className="animate-spin text-amber-200 mb-4" />
        <span className="font-bold tracking-widest text-sm text-slate-400">SINCRONIZANDO WARNER...</span>
      </div>
    );
  }

  const AgendaCard = ({ client }) => (
    <div 
      onClick={() => { setSelectedClient(client); setModalMode('VIEW'); setTempDate(client.agenda ? client.agenda.split('T')[0] : ''); setTempNote(''); }}
      className="bg-slate-900/60 border border-white/5 p-4 rounded-xl shadow-md hover:border-amber-200/30 hover:bg-slate-800/80 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start">
         <h4 className="font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">{client.nom}</h4>
         <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${client.etapa === 'CERRADO' ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}`}>{client.etapa}</span>
      </div>
      {client.prop && <p className="text-xs text-slate-400 mb-2 truncate">{client.prop}</p>}
      <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-white/5">
        <span className="bg-slate-950 px-2 py-1 rounded text-slate-300 font-mono border border-white/5">
          {client.agenda ? new Date(client.agenda.includes('T') ? client.agenda : `${client.agenda}T12:00:00`).toLocaleDateString('es-AR') : 'Sin fecha'}
        </span>
        <span className="text-amber-200 text-[10px] font-bold uppercase tracking-wider">Ver Ficha</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />

      {/* --- CABECERA SUPERIOR --- */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-4 md:mb-6 gap-3 md:gap-4 shrink-0">
        
        {/* Selector de Vistas y Buscador (Fila 1 en móvil) */}
        <div className="flex flex-col md:flex-row gap-3">
             {/* Switch Vistas */}
            <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5 shadow-lg shrink-0">
                <button onClick={() => setViewMode('KANBAN')} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-amber-200 text-slate-900' : 'text-slate-500 hover:text-white'}`}>
                    <Kanban size={16} weight="fill" /> PIPELINE
                </button>
                <button onClick={() => setViewMode('AGENDA')} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${viewMode === 'AGENDA' ? 'bg-amber-200 text-slate-900' : 'text-slate-500 hover:text-white'}`}>
                    <CalendarBlank size={16} weight="fill" /> AGENDA
                    {(agendaVencida.length + agendaHoy.length) > 0 && (
                    <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] animate-pulse">
                        {agendaVencida.length + agendaHoy.length}
                    </span>
                    )}
                </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:w-64 group">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors" />
                <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-full bg-slate-950/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-200/50 focus:bg-slate-900 transition-all placeholder:text-slate-600" />
            </div>
        </div>

        {/* Filtros de Categoría (Scrollable en móvil) */}
        <div className="flex overflow-x-auto custom-scroll pb-1 md:pb-0 gap-1 md:gap-0 p-1 bg-slate-950/50 rounded-xl border border-white/5 shrink-0">
          {['COMPRADOR', 'INQUILINO', 'VENDEDOR', 'PROPIETARIO'].map(cat => (
            <button key={cat} onClick={() => setCurrentCat(cat)} className={`px-4 py-2 md:py-1.5 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${currentCat === cat ? 'bg-amber-200 text-slate-900 shadow-[0_0_15px_rgba(253,230,138,0.2)]' : 'text-slate-400 hover:text-white'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* --- TABLERO KANBAN --- */}
      {viewMode === 'KANBAN' && (
        <div className="flex flex-col h-full overflow-hidden">
            
            {/* NAVEGACIÓN DE ETAPAS (SOLO MÓVIL) */}
            <div className="lg:hidden flex items-center justify-between bg-slate-950/50 rounded-xl p-1 mb-3 border border-white/5 shrink-0">
                <button 
                  onClick={() => {
                     const idx = STAGES.findIndex(s => s.id === activeMobileStage);
                     if (idx > 0) setActiveMobileStage(STAGES[idx-1].id);
                  }}
                  disabled={activeMobileStage === STAGES[0].id}
                  className="p-2 text-slate-400 disabled:opacity-30"
                >
                    <CaretLeft weight="bold" />
                </button>
                
                <div className="flex gap-1 overflow-hidden px-2">
                    {STAGES.map(s => (
                        <div key={s.id} 
                             className={`w-2 h-2 rounded-full transition-all ${activeMobileStage === s.id ? 'bg-amber-200 scale-125' : 'bg-slate-700'}`} 
                        />
                    ))}
                    <span className="ml-2 text-xs font-bold text-amber-200 uppercase tracking-widest">
                        {STAGES.find(s => s.id === activeMobileStage)?.label}
                    </span>
                </div>

                <button 
                   onClick={() => {
                     const idx = STAGES.findIndex(s => s.id === activeMobileStage);
                     if (idx < STAGES.length - 1) setActiveMobileStage(STAGES[idx+1].id);
                  }}
                  disabled={activeMobileStage === STAGES[STAGES.length-1].id}
                  className="p-2 text-slate-400 disabled:opacity-30"
                >
                    <CaretRight weight="bold" />
                </button>
            </div>

            {/* CONTENEDOR DE COLUMNAS */}
            <div className="flex flex-1 gap-5 overflow-x-auto overflow-y-hidden custom-scroll px-1 pb-2">
            {STAGES.map(stage => {
                const columnClients = filteredClients.filter(c => (c.etapa || 'INGRESO') === stage.id);
                
                // EN MÓVIL: OCULTAR COLUMNAS QUE NO SON LA ACTIVA
                // Usamos clases CSS para ocultar/mostrar en lugar de desmontar componentes para mejor performance
                const mobileHiddenClass = (activeMobileStage !== stage.id) ? 'hidden lg:flex' : 'flex';

                return (
                <div key={stage.id} 
                     className={`${mobileHiddenClass} min-w-full lg:min-w-[320px] lg:w-[320px] w-full bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 flex-col h-full shadow-lg`} 
                     onDragOver={(e) => e.preventDefault()} 
                     onDrop={(e) => handleDrop(e, stage.id)}
                >
                    <div className="p-4 border-b border-white/5 bg-slate-900/60 rounded-t-3xl flex justify-between items-center sticky top-0 z-10 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: stage.color }}></div>
                        <span className="font-black text-xs text-slate-300 tracking-[0.15em]">{stage.label}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-2.5 py-1 rounded-full border border-white/5">{columnClients.length}</span>
                    </div>

                    <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scroll">
                    <AnimatePresence>
                        {columnClients.map(client => {
                        const health = getHealthStatus(client);
                        return (
                            <motion.div 
                            key={client.id} layoutId={client.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            draggable="true" onDragStart={(e) => handleDragStart(e, client.id)}
                            onClick={() => { setSelectedClient(client); setModalMode('VIEW'); setTempDate(client.agenda ? client.agenda.split('T')[0] : ''); setTempNote(''); }}
                            className={`group relative bg-slate-800/60 p-4 md:p-5 rounded-2xl border transition-all cursor-pointer shadow-md hover:shadow-2xl hover:scale-[1.01] active:scale-95 ${health.status === 'danger' ? 'border-red-500/30 bg-red-900/10' : (health.status === 'warning' ? 'border-amber-500/30 bg-amber-900/10' : 'border-white/5 hover:border-amber-200/30')}`}
                            >
                            {health.status === 'danger' && <WarningCircle size={20} className="absolute -top-2 -right-2 text-red-500 bg-slate-950 rounded-full shadow-lg" weight="fill" />}
                            {health.status === 'warning' && <Clock size={20} className="absolute -top-2 -right-2 text-amber-400 bg-slate-950 rounded-full shadow-lg" weight="fill" />}
                            
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${health.status === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
                                    {client.nom.charAt(0)}
                                </div>
                                <h4 className="text-sm font-bold text-white truncate flex-1">{client.nom}</h4>
                            </div>
                            
                            {client.prop && (
                                <div className="flex items-center text-xs text-slate-500 mb-3 bg-slate-950/30 p-2 rounded-lg border border-white/5">
                                    <MapPin size={14} className="mr-1 text-amber-200/60 shrink-0" />
                                    <span className="truncate">{client.prop}</span>
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-white/5 text-slate-500">
                                <span className={health.status === 'danger' ? 'text-red-400 font-bold' : (health.status === 'warning' ? 'text-amber-400 font-bold' : '')}>{health.msg}</span>
                                <span className="uppercase font-bold tracking-wider bg-white/5 px-1.5 py-0.5 rounded">{client.cat}</span>
                            </div>
                            </motion.div>
                        );
                        })}
                    </AnimatePresence>
                    </div>
                </div>
                );
            })}
            </div>
        </div>
      )}

      {/* --- MODO: AGENDA DE HOY (MODO ENFOQUE) --- */}
      {viewMode === 'AGENDA' && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 overflow-y-auto custom-scroll pr-1 md:pr-4 pb-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-4">
            
            {/* VENCIDOS */}
            {(agendaVencida.length > 0 || window.innerWidth > 768) && (
                <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-red-500/30 text-red-400 sticky top-0 bg-slate-900/90 backdrop-blur z-10 p-2 md:p-0">
                    <span className="font-bold flex items-center gap-2 text-xs tracking-widest"><WarningCircle size={20} weight="fill" /> VENCIDOS</span>
                    <span className="bg-red-500/20 px-2 py-0.5 rounded-full text-xs font-mono">{agendaVencida.length}</span>
                </div>
                <div className="space-y-3">
                    {agendaVencida.map(c => <AgendaCard key={c.id} client={c} />)}
                    {agendaVencida.length === 0 && <p className="text-xs text-slate-600 italic text-center py-4">Estás al día.</p>}
                </div>
                </div>
            )}

            {/* PARA HOY */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-amber-500/30 text-amber-400 sticky top-0 bg-slate-900/90 backdrop-blur z-10 p-2 md:p-0">
                <span className="font-bold flex items-center gap-2 text-xs tracking-widest"><CalendarCheck size={20} weight="fill" /> PARA HOY</span>
                <span className="bg-amber-500/20 px-2 py-0.5 rounded-full text-xs font-mono">{agendaHoy.length}</span>
              </div>
              <div className="space-y-3">
                 {agendaHoy.map(c => <AgendaCard key={c.id} client={c} />)}
                 {agendaHoy.length === 0 && <p className="text-xs text-slate-600 italic text-center py-4">Nada para hoy.</p>}
              </div>
            </div>

            {/* FUTURO */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-blue-500/30 text-blue-400 sticky top-0 bg-slate-900/90 backdrop-blur z-10 p-2 md:p-0">
                <span className="font-bold flex items-center gap-2 text-xs tracking-widest"><CalendarBlank size={20} weight="fill" /> FUTURO</span>
                <span className="bg-blue-500/20 px-2 py-0.5 rounded-full text-xs font-mono">{agendaFuturo.length}</span>
              </div>
              <div className="space-y-3">
                  {agendaFuturo.map(c => <AgendaCard key={c.id} client={c} />)}
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* --- MODAL INTELIGENTE (RESPONSIVE) --- */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-md md:p-4"
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-slate-900 border ${modalMode === 'FORCED' ? 'border-amber-200 shadow-[0_0_40px_rgba(253,230,138,0.15)]' : 'border-slate-700 shadow-2xl'} w-full md:max-w-2xl h-[90vh] md:h-auto md:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden`}
            >
              
              {/* Cabecera del Modal */}
              <div className="bg-slate-950/80 px-4 md:px-8 py-4 md:py-6 border-b border-white/5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-600 flex items-center justify-center text-lg md:text-xl font-black text-slate-900 shadow-lg">
                    {selectedClient.nom.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white line-clamp-1">{selectedClient.nom}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span className="bg-white/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">{selectedClient.cat}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="truncate max-w-[150px]">{selectedClient.prop || 'General'}</span>
                    </div>
                  </div>
                </div>
                {modalMode === 'VIEW' && (
                  <button onClick={() => setSelectedClient(null)} className="text-slate-500 hover:text-white transition p-2 hover:bg-white/10 rounded-full">
                    <X size={24} />
                  </button>
                )}
              </div>

              {/* Cuerpo: Acciones y Notas (Scrollable) */}
              <div className="p-4 md:p-8 bg-slate-900 space-y-6 overflow-y-auto custom-scroll flex-1">
                
                {modalMode === 'FORCED' && (
                  <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3 text-amber-200">
                    <CalendarCheck size={28} weight="fill" className="shrink-0" />
                    <p className="text-xs md:text-sm font-medium">¡Cambio de etapa exitoso! Define la fecha del próximo contacto.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="text-[10px] font-black text-amber-200/80 mb-2 block uppercase tracking-widest">Próxima Acción</label>
                    <input 
                      type="date" 
                      value={tempDate} 
                      onChange={(e) => setTempDate(e.target.value)}
                      className={`w-full bg-slate-950 border ${modalMode === 'FORCED' && !tempDate ? 'border-red-500 animate-pulse' : 'border-white/10'} rounded-xl p-4 text-sm text-white focus:border-amber-200/50 focus:outline-none transition`}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 mb-2 block uppercase tracking-widest">Acciones Rápidas</label>
                    <div className="flex gap-3">
                      <a href={`https://wa.me/${selectedClient.tel?.replace(/[^0-9]/g,'')}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 hover:text-green-300 p-3 rounded-xl flex items-center justify-center gap-2 transition font-bold text-sm">
                        <WhatsappLogo size={20} weight="fill" />
                        <span className="md:hidden">WhatsApp</span>
                      </a>
                      <a href={`mailto:${selectedClient.mail}`} className="flex-1 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 p-3 rounded-xl flex items-center justify-center gap-2 transition font-bold text-sm">
                        <EnvelopeSimple size={20} weight="fill" />
                        <span className="md:hidden">Email</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 mb-2 block uppercase tracking-widest">Bitácora de Gestión</label>
                  <textarea 
                    value={tempNote}
                    onChange={(e) => setTempNote(e.target.value)}
                    placeholder="¿De qué hablaron? ¿Qué acordaron?..." 
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-amber-200/50 focus:outline-none min-h-[150px] resize-none"
                  ></textarea>
                </div>
                
                {/* Historial rápido (Visualización simple de notas anteriores) */}
                {selectedClient.notas && (
                    <div className="mt-4 pt-4 border-t border-white/5 opacity-50 hover:opacity-100 transition-opacity">
                        <label className="text-[9px] font-bold text-slate-600 mb-2 block uppercase">Historial Reciente</label>
                        <p className="text-xs text-slate-400 whitespace-pre-wrap max-h-20 overflow-hidden text-ellipsis">{selectedClient.notas.substring(0, 150)}...</p>
                    </div>
                )}

              </div>

              {/* Pie: Botones de Guardado */}
              <div className="bg-slate-950 px-4 md:px-8 py-4 md:py-5 border-t border-white/5 flex justify-end gap-3 md:gap-4 shrink-0 pb-safe-area">
                {modalMode === 'VIEW' && (
                  <button onClick={() => setSelectedClient(null)} className="px-4 py-3 font-bold text-xs text-slate-500 hover:text-white transition uppercase tracking-widest">Cancelar</button>
                )}
                <button 
                  onClick={handleSaveModal} 
                  disabled={saving || (modalMode === 'FORCED' && !tempDate)}
                  className={`flex-1 md:flex-none justify-center px-6 md:px-8 py-3 rounded-xl font-black text-xs flex items-center gap-2 transition uppercase tracking-widest ${saving || (modalMode === 'FORCED' && !tempDate) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-amber-200 to-amber-100 text-slate-900 shadow-[0_0_20px_rgba(253,230,138,0.2)] hover:shadow-[0_0_30px_rgba(253,230,138,0.4)] transform hover:-translate-y-0.5'}`}
                >
                  {saving ? <SpinnerGap size={18} className="animate-spin" /> : <FloppyDisk size={18} weight="fill" />}
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
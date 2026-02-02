import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Kanban, SpinnerGap, MagnifyingGlass, CalendarBlank, 
  WarningCircle, CalendarCheck, X, WhatsappLogo, 
  FloppyDisk, Plus, ArrowsClockwise, CaretRight,
  UserPlus, Buildings, MagnifyingGlass as SearchIcon
} from 'phosphor-react';
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
  const navigate = useNavigate();
  const { clients, setClients, user } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentCat, setCurrentCat] = useState('COMPRADOR');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [viewMode, setViewMode] = useState('KANBAN');
  const [showNewMenu, setShowNewMenu] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [tempNote, setTempNote] = useState('');
  const [tempDate, setTempDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Función de carga con ruteo por usuarioRequested
  const fetchClients = useCallback(async (isManual = false) => {
    if (!user?.name) return;

    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const userParam = encodeURIComponent(user.name);
      const url = `${API_URL}?action=getData&userRequested=${userParam}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      setClients(data);
      if (isManual) toast.success('Base de datos sincronizada');
    } catch (error) {
      console.error("CRM ERROR:", error);
      toast.error('Error al sincronizar datos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.name, setClients]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleNewContact = (type) => {
    setShowNewMenu(false);
    if (type === 'COMPRADOR') navigate('/compradores');
    else navigate('/vendedores');
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const clientToMove = clients.find(c => c.id === draggedItemId);
    if (!clientToMove || clientToMove.etapa === newStage) return;

    const updatedClients = clients.map(c => 
      c.id === draggedItemId ? { ...c, etapa: newStage } : c
    );
    setClients(updatedClients);

    const updatedClient = { ...clientToMove, etapa: newStage };
    setSelectedClient(updatedClient);
    setTempDate(updatedClient.agenda ? updatedClient.agenda.split('T')[0] : '');
    setTempNote('');
    
    toast.info('¡Movimiento registrado! Define el próximo paso.');
  };

  const handleSaveModal = async () => {
    if (!tempDate) {
      toast.error('La Próxima Acción es obligatoria.');
      return;
    }

    setSaving(true);
    let updatedNotes = selectedClient.notas || '';
    if (tempNote.trim()) {
      updatedNotes = `[${new Date().toLocaleDateString('es-AR')}] ${tempNote}\n${updatedNotes}`;
    }

    const finalClient = { ...selectedClient, agenda: tempDate, notas: updatedNotes };

    try {
      await fetch(`${API_URL}?action=updateClient`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          id: finalClient.id,
          etapa: finalClient.etapa,
          agenda: tempDate,
          nota: tempNote
        })
      });
      
      setClients(clients.map(c => c.id === finalClient.id ? finalClient : c));
      toast.success('Gestión actualizada');
      setSelectedClient(null);
    } catch (error) {
      toast.error('Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  const getHealthStatus = (client) => {
    if (!client.agenda) return { status: 'danger', msg: 'Sin acción' };
    const actionDate = new Date(client.agenda.includes('T') ? client.agenda : `${client.agenda}T12:00:00`);
    const today = new Date(); today.setHours(0,0,0,0);
    actionDate.setHours(0,0,0,0);

    if (actionDate < today) return { status: 'danger', msg: 'Vencido' };
    if (actionDate.getTime() === today.getTime()) return { status: 'warning', msg: 'Hoy' };
    return { status: 'safe', msg: 'Al día' };
  };

  const filteredClients = clients.filter(c => {
    const matchesCat = c.cat === currentCat;
    const matchesSearch = c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.prop?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <SpinnerGap size={40} className="animate-spin text-amber-200 mb-4" />
        <span className="font-bold tracking-widest text-sm text-slate-400 uppercase">Sincronizando Cartera...</span>
      </div>
    );
  }

  const AgendaCard = ({ client }) => (
    <div 
      onClick={() => { setSelectedClient(client); setTempDate(client.agenda ? client.agenda.split('T')[0] : ''); setTempNote(''); }}
      className="bg-slate-900/60 border border-white/5 p-4 rounded-xl hover:border-amber-200/30 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start">
         <h4 className="font-bold text-white group-hover:text-amber-200 transition-colors">{client.nom}</h4>
         <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded uppercase">{client.etapa}</span>
      </div>
      <div className="flex justify-between items-center text-[10px] mt-3 pt-3 border-t border-white/5">
        <span className="text-slate-400 font-mono">
          {client.agenda ? new Date(client.agenda.includes('T') ? client.agenda : `${client.agenda}T12:00:00`).toLocaleDateString('es-AR') : 'Sin fecha'}
        </span>
        <span className="text-amber-200 font-bold uppercase">Ver Ficha</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-900/40 backdrop-blur-xl p-3 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />

      {/* CABECERA */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 gap-4 shrink-0">
        <div className="flex flex-col md:flex-row gap-3">
            <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5">
                <button onClick={() => setViewMode('KANBAN')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'KANBAN' ? 'bg-amber-200 text-slate-900' : 'text-slate-500 hover:text-white'}`}>
                    <Kanban size={16} weight="fill" /> PIPELINE
                </button>
                <button onClick={() => setViewMode('AGENDA')} className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${viewMode === 'AGENDA' ? 'bg-amber-200 text-slate-900' : 'text-slate-500 hover:text-white'}`}>
                    <CalendarBlank size={16} weight="fill" /> AGENDA
                </button>
            </div>
            
            <div className="flex gap-2">
                <button onClick={() => fetchClients(true)} disabled={refreshing} className="p-2.5 bg-slate-950/50 border border-white/10 rounded-xl text-slate-400 hover:text-amber-200 transition-all active:scale-90 disabled:opacity-50" title="Sincronizar">
                  <ArrowsClockwise size={20} className={refreshing ? "animate-spin" : ""} />
                </button>
                <button onClick={() => setShowNewMenu(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-200 text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-300 transition-all shadow-lg active:scale-95">
                  <Plus size={16} weight="bold" /> NUEVO
                </button>
            </div>

            <div className="relative w-full md:w-64">
                <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-200/50" />
            </div>
        </div>

        <div className="flex overflow-x-auto gap-1 p-1 bg-slate-950/50 rounded-xl border border-white/5 no-scrollbar">
          {['COMPRADOR', 'INQUILINO', 'VENDEDOR', 'PROPIETARIO'].map(cat => (
            <button key={cat} onClick={() => setCurrentCat(cat)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all whitespace-nowrap ${currentCat === cat ? 'bg-amber-200 text-slate-900' : 'text-slate-400 hover:text-white'}`}>{cat}</button>
          ))}
        </div>
      </div>

      {/* VISTAS */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'KANBAN' ? (
          <div className="flex h-full gap-5 overflow-x-auto custom-scroll pb-4">
            {STAGES.map(stage => {
              const columnClients = filteredClients.filter(c => (c.etapa || 'INGRESO') === stage.id);
              return (
                <div key={stage.id} 
                     className="min-w-[280px] w-[280px] bg-slate-900/40 rounded-3xl border border-white/5 flex flex-col h-full"
                     onDragOver={(e) => e.preventDefault()} 
                     onDrop={(e) => handleDrop(e, stage.id)}>
                  <div className="p-4 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: stage.color, color: stage.color }}></div>
                      <span className="font-black text-[10px] text-slate-300 tracking-[0.2em]">{stage.label}</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/5 text-slate-500 px-2 py-0.5 rounded-full">{columnClients.length}</span>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scroll">
                    {columnClients.map(client => (
                      <motion.div 
                        key={client.id} layoutId={client.id}
                        draggable onDragStart={(e) => setDraggedItemId(client.id)}
                        onClick={() => { setSelectedClient(client); setTempDate(client.agenda ? client.agenda.split('T')[0] : ''); setTempNote(''); }}
                        className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 cursor-pointer hover:border-amber-200/30 transition-all shadow-lg active:scale-95"
                      >
                        <h4 className="text-sm font-bold text-white mb-2 leading-tight">{client.nom}</h4>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-white/5 pt-2">
                          <span className={`${getHealthStatus(client).status === 'danger' ? 'text-red-400' : 'text-slate-500'}`}>{getHealthStatus(client).msg}</span>
                          <span className="opacity-50">{client.cat}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 custom-scroll">
              <div className="space-y-4">
                <h5 className="text-red-400 font-black text-[10px] tracking-widest px-2 uppercase flex items-center gap-2"><WarningCircle weight="fill"/> Vencidos</h5>
                {filteredClients.filter(c => c.agenda && getHealthStatus(c).status === 'danger').map(c => <AgendaCard key={c.id} client={c} />)}
              </div>
              <div className="space-y-4">
                <h5 className="text-amber-400 font-black text-[10px] tracking-widest px-2 uppercase flex items-center gap-2"><CalendarCheck weight="fill"/> Hoy</h5>
                {filteredClients.filter(c => c.agenda && getHealthStatus(c).status === 'warning').map(c => <AgendaCard key={c.id} client={c} />)}
              </div>
              <div className="space-y-4">
                <h5 className="text-blue-400 font-black text-[10px] tracking-widest px-2 uppercase flex items-center gap-2"><CalendarBlank weight="fill"/> Próximos</h5>
                {filteredClients.filter(c => c.agenda && getHealthStatus(c).status === 'safe').map(c => <AgendaCard key={c.id} client={c} />)}
              </div>
          </div>
        )}
      </div>

      {/* MODAL GESTION */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/50">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedClient.nom}</h3>
                  <p className="text-[10px] text-amber-200 font-black tracking-widest uppercase">{selectedClient.etapa} • {selectedClient.cat}</p>
                </div>
                <button onClick={() => setSelectedClient(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24} className="text-slate-500" /></button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-widest">Próxima Acción</label>
                    <input type="date" value={tempDate} onChange={(e) => setTempDate(e.target.value)} className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-amber-200/50 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-widest">WhatsApp</label>
                    <a href={`https://wa.me/${selectedClient.tel?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-green-500/10 text-green-400 p-3 rounded-xl border border-green-500/20 font-bold text-xs hover:bg-green-500/20 transition-all"><WhatsappLogo size={20} weight="fill"/> ENVIAR MENSAJE</a>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-2 uppercase tracking-widest">Añadir Comentario</label>
                  <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)} placeholder="¿Qué se habló?" className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-white h-32 resize-none focus:outline-none focus:border-amber-200/50 transition-all" />
                </div>
                {selectedClient.notas && (
                    <div className="bg-slate-950/30 rounded-xl p-4 border border-white/5">
                        <label className="text-[9px] font-bold text-slate-600 block mb-2 uppercase tracking-widest">Historial</label>
                        <div className="text-[11px] text-slate-400 whitespace-pre-wrap max-h-32 overflow-y-auto custom-scroll leading-relaxed">{selectedClient.notas}</div>
                    </div>
                )}
                <button onClick={handleSaveModal} disabled={saving} className="w-full bg-amber-200 text-slate-900 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-300 transition-all shadow-xl shadow-amber-200/10 disabled:opacity-50">
                  {saving ? <SpinnerGap size={20} className="animate-spin" /> : <FloppyDisk size={20} weight="bold" />} ACTUALIZAR GESTIÓN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL SELECCIÓN NUEVO REGISTRO */}
      <AnimatePresence>
        {showNewMenu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6" onClick={() => setShowNewMenu(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="w-16 h-16 bg-amber-200/10 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-200">
                <UserPlus size={32} weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Nuevo Registro</h3>
              <p className="text-slate-400 text-xs mb-8">Selecciona el tipo de cliente</p>
              <div className="space-y-3">
                <button onClick={() => handleNewContact('COMPRADOR')} className="w-full group flex items-center justify-between p-4 bg-slate-950 border border-white/5 rounded-2xl hover:border-amber-200/50 transition-all">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><SearchIcon weight="bold"/></div>
                    <div>
                      <span className="block text-sm font-bold text-white uppercase">Busca Propiedad</span>
                      <span className="block text-[10px] text-slate-500">Comprador o Inquilino</span>
                    </div>
                  </div>
                  <CaretRight size={16} className="text-slate-700 group-hover:text-amber-200" />
                </button>
                <button onClick={() => handleNewContact('VENDEDOR')} className="w-full group flex items-center justify-between p-4 bg-slate-950 border border-white/5 rounded-2xl hover:border-amber-200/50 transition-all">
                  <div className="flex items-center gap-4 text-left">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Buildings weight="bold"/></div>
                    <div>
                      <span className="block text-sm font-bold text-white uppercase">Ofrece Propiedad</span>
                      <span className="block text-[10px] text-slate-500">Vendedor o Propietario</span>
                    </div>
                  </div>
                  <CaretRight size={16} className="text-slate-700 group-hover:text-amber-200" />
                </button>
              </div>
              <button onClick={() => setShowNewMenu(false)} className="mt-8 text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Cancelar</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
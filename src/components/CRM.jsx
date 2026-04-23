import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  Kanban, SpinnerGap, MagnifyingGlass, CalendarBlank,
  WarningCircle, CalendarCheck, X, WhatsappLogo,
  FloppyDisk, Plus, ArrowsClockwise, CaretRight,
  UserPlus, Buildings, Phone, EnvelopeSimple,
  MapPin, CurrencyDollar, House, Timer, Circle, CheckCircle,
  FileArrowUp, Notebook, ChatCircleText, ArrowRight
} from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import BulkImport from './BulkImport';

const API_URL = import.meta.env.VITE_API_URL;

// ─── PIPELINE: 5 etapas del embudo inmobiliario ───────────────────────────────
const STAGES = [
  { id: 'INGRESO',    label: 'NUEVO',      short: 'NUEVO',   color: '#64748b', glow: 'rgba(100,116,139,0.3)',  icon: '●' },
  { id: 'CONTACTADO', label: 'CONTACTADO', short: 'CONT.',   color: '#38bdf8', glow: 'rgba(56,189,248,0.3)',   icon: '◎' },
  { id: 'GESTION',    label: 'EN GESTIÓN', short: 'GEST.',   color: '#fbbf24', glow: 'rgba(251,191,36,0.3)',   icon: '◈' },
  { id: 'RESERVA',    label: 'RESERVA',    short: 'RES.',    color: '#a78bfa', glow: 'rgba(167,139,250,0.3)',  icon: '◆' },
  { id: 'CERRADO',    label: 'CERRADO',    short: 'CERR.',   color: '#4ade80', glow: 'rgba(74,222,128,0.3)',   icon: '✓' },
];

const FUNNELS = {
  COMPRADORES: { label: 'Compradores e Inquilinos', categories: ['COMPRADOR', 'INQUILINO'], color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
  VENDEDORES: { label: 'Vendedores y Propietarios', categories: ['VENDEDOR', 'PROPIETARIO'], color: '#fb923c', bg: 'rgba(251,146,60,0.1)' }
};

// ─── HEALTH STATUS ────────────────────────────────────────────────────────────
const getHealthStatus = (client) => {
  if (!client.agenda) return { status: 'sin-accion', label: 'Sin acción', color: '#ef4444', urgency: 0 };
  const d = new Date(client.agenda.includes('T') ? client.agenda : `${client.agenda}T12:00:00`);
  const today = new Date(); today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0)  return { status: 'vencido',    label: `Vence hace ${Math.abs(diff)}d`, color: '#ef4444', urgency: 0 };
  if (diff === 0) return { status: 'hoy',        label: 'HOY',                           color: '#fbbf24', urgency: 1 };
  if (diff <= 3)  return { status: 'proximo',    label: `En ${diff}d`,                   color: '#fb923c', urgency: 2 };
  return            { status: 'ok',          label: `En ${diff}d`,                   color: '#4ade80', urgency: 3 };
};

// ─── FORMATEADORES ────────────────────────────────────────────────────────────
const fmtTel = (t) => String(t || '').replace(/\D/g, '');
const fmtDate = (d) => d ? new Date(d.includes('T') ? d : `${d}T12:00:00`).toLocaleDateString('es-AR', { day:'2-digit', month:'short' }) : '—';
const fmtMoney = (v) => v ? `$${Number(v).toLocaleString('es-AR')}` : null;

// ─── TARJETA KANBAN MEJORADA ──────────────────────────────────────────────────
const KanbanCard = ({ client, funnelKey, onSelect, onDragStart }) => {
  const health = getHealthStatus(client);
  const funnel = FUNNELS[funnelKey];
  const tel = fmtTel(client.tel);
  const lastNote = client.notas ? client.notas.split('\n')[0] : null;

  return (
    <motion.div
      layoutId={client.id}
      draggable
      onDragStart={() => onDragStart(client.id)}
      onClick={() => onSelect(client)}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      style={{ '--cat-color': funnel.color }}
      className="group relative bg-[#0f172a] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer
                 hover:border-[var(--cat-color)]/40 transition-all duration-200 shadow-lg"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
           style={{ backgroundColor: funnel.color, boxShadow: `0 0 8px ${funnel.color}` }} />

      <div className="pl-4 pr-3 pt-3 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-[13px] font-bold text-white leading-tight truncate flex-1">{client.nom}</h4>
          <span className="shrink-0 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: funnel.bg, color: funnel.color }}>
            {client.cat}
          </span>
        </div>

        {/* Datos clave según el tipo de funnel */}
        {funnelKey === 'COMPRADORES' ? (
          <div className="flex flex-col gap-1 mb-2 text-[10px] text-slate-500 truncate">
            {client.zona && (
              <div className="flex items-center gap-1">
                <MapPin size={10} weight="fill" className="text-slate-600 shrink-0" />
                <span className="truncate">{client.zona}</span>
              </div>
            )}
            {client.pre && (
              <div className="flex items-center gap-1 text-amber-300/70">
                <CurrencyDollar size={10} weight="bold" className="shrink-0" />
                <span className="truncate">{client.pre}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1 mb-2 text-[10px] text-slate-500 truncate">
            {client.prop && (
              <div className="flex items-center gap-1">
                <House size={10} weight="fill" className="text-slate-600 shrink-0" />
                <span className="truncate">{client.prop}</span>
              </div>
            )}
          </div>
        )}

        {lastNote && (
          <p className="text-[9px] text-slate-600 italic truncate mb-2 border-l border-slate-700 pl-2">
            {lastNote.replace(/^\[.*?\]\s*/, '')}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] mt-1">
          <span className="text-[9px] font-bold flex items-center gap-1" style={{ color: health.color }}>
            <span style={{ fontSize: 6 }}>●</span> {health.label}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {tel && (
              <a href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer"
                 onClick={(e) => e.stopPropagation()}
                 className="p-1 bg-green-500/10 rounded-lg text-green-400 hover:bg-green-500/20 transition-all">
                <WhatsappLogo size={12} weight="fill" />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── PANEL LATERAL (SLIDE-OVER) ───────────────────────────────────────────────
const SidePanel = ({ client, onClose, onSave, saving }) => {
  const [tempNote, setTempNote] = useState('');
  const [tempDate, setTempDate] = useState(client.agenda ? client.agenda.split('T')[0] : '');
  const [tempEtapa, setTempEtapa] = useState(client.etapa || 'INGRESO');
  const funnel = FUNNELS[client.cat === 'COMPRADOR' || client.cat === 'INQUILINO' ? 'COMPRADORES' : 'VENDEDORES'];
  const tel = fmtTel(client.tel);
  const health = getHealthStatus(client);

  const notasHistory = useMemo(() => {
    if (!client.notas) return [];
    return client.notas.split('\n').filter(Boolean).map(line => {
      const match = line.match(/^\[(.+?)\]\s*(.*)/);
      return match ? { fecha: match[1], texto: match[2] } : { fecha: '—', texto: line };
    });
  }, [client.notas]);

  const handleSave = () => onSave({ tempDate, tempNote, tempEtapa });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 bottom-0 z-40 w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-[#080e1a] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/[0.06] shrink-0"
             style={{ background: `linear-gradient(135deg, ${funnel.bg}, transparent)` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl font-black text-white leading-tight truncate">{client.nom}</h3>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest"
                      style={{ backgroundColor: funnel.bg, color: funnel.color }}>{client.cat}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: health.color }}>
                  {health.label}
                </span>
                {client.agenda && (
                  <span className="text-[10px] text-slate-400">· Agenda: {fmtDate(client.agenda)}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-slate-900/50 hover:bg-white/10 rounded-full transition-colors shrink-0 border border-white/5">
              <X size={20} className="text-slate-300" />
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mt-5">
            {tel && (
              <a href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-green-400 transition-colors">
                <WhatsappLogo size={14} weight="fill" className="text-green-500" /> {client.tel}
              </a>
            )}
            {client.mail && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300">
                <EnvelopeSimple size={14} weight="fill" className="text-slate-500" /> {client.mail}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scroll">
          
          {/* Detalles Generales */}
          <div className="grid grid-cols-2 gap-4">
            {(client.zona || client.prop) && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Interés / Propiedad</span>
                <span className="text-sm text-slate-200 font-medium">{client.zona || client.prop}</span>
              </div>
            )}
            {client.pre && (
              <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block mb-1">Presupuesto</span>
                <span className="text-sm text-amber-300 font-medium">{client.pre}</span>
              </div>
            )}
          </div>

          {/* Contexto Inicial (Observaciones) */}
          {client.notas?.includes('OBSERVACIONES:') === false && client.observaciones && (
             <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
               <h4 className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                 <Notebook size={16} weight="duotone" /> Contexto Inicial (Origen)
               </h4>
               <p className="text-sm text-blue-100/80 leading-relaxed font-light">{client.observaciones}</p>
             </div>
          )}

          {/* Gestión Actual */}
          <div className="bg-slate-900/80 rounded-2xl border border-white/5 p-5">
             <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Actualizar Gestión</h4>
             
             <div className="mb-5">
                <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Etapa del Pipeline</label>
                <div className="flex gap-2 flex-wrap">
                  {STAGES.map(s => (
                    <button key={s.id} onClick={() => setTempEtapa(s.id)}
                            className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border"
                            style={tempEtapa === s.id
                              ? { backgroundColor: s.color + '15', color: s.color, borderColor: s.color + '50', boxShadow: `0 0 10px ${s.glow}` }
                              : { backgroundColor: 'transparent', color: '#64748b', borderColor: 'rgba(255,255,255,0.05)' }}>
                      {s.label}
                    </button>
                  ))}
                </div>
             </div>

             <div className="mb-5">
                <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Próxima Acción (Agenda)</label>
                <input type="date" value={tempDate} onChange={(e) => setTempDate(e.target.value)}
                       className="w-full max-w-[200px] bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 text-sm focus:border-amber-400/50 outline-none transition-all" />
             </div>

             <div>
                <label className="text-[10px] font-black text-slate-400 block mb-2 uppercase tracking-widest">Nueva Nota</label>
                <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)}
                          placeholder="Escribe aquí el resumen de la llamada o acción a tomar..."
                          className="w-full bg-slate-950 border border-white/10 rounded-xl p-4 text-sm text-slate-200 h-24 resize-none focus:outline-none focus:border-amber-400/50 transition-all placeholder:text-slate-700" />
             </div>
          </div>

          {/* Timeline de Historial */}
          {(notasHistory.length > 0 || client.observaciones) && (
            <div>
              <h4 className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-widest mb-6 px-1">
                 <ChatCircleText size={16} weight="duotone" /> Timeline de Interacciones
              </h4>
              <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-800 before:to-transparent">
                
                {notasHistory.map((n, i) => (
                  <div key={i} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-[3px] border-[#080e1a] bg-amber-400 text-slate-900 absolute left-[-11px] shrink-0">
                       <span className="w-1.5 h-1.5 bg-[#080e1a] rounded-full"></span>
                    </div>
                    <div className="w-[calc(100%-2rem)] bg-slate-900/50 border border-white/5 rounded-2xl p-4 shadow-sm">
                       <div className="text-[10px] font-black text-amber-500 mb-1">{n.fecha}</div>
                       <div className="text-sm text-slate-300 leading-relaxed font-light">{n.texto}</div>
                    </div>
                  </div>
                ))}

                {/* Hito Carga Inicial (Observaciones) */}
                {client.observaciones && (
                  <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-[3px] border-[#080e1a] bg-blue-500 text-slate-900 absolute left-[-11px] shrink-0">
                       <span className="w-1.5 h-1.5 bg-[#080e1a] rounded-full"></span>
                    </div>
                    <div className="w-[calc(100%-2rem)] bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 shadow-sm">
                       <div className="text-[10px] font-black text-blue-400 mb-1">CARGA INICIAL (OBSERVACIONES)</div>
                       <div className="text-sm text-blue-100/70 leading-relaxed font-light">{client.observaciones}</div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-slate-950/50 shrink-0">
          <button onClick={handleSave} disabled={saving || !tempDate}
                  className="w-full bg-emerald-500 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-sm uppercase tracking-widest">
            {saving ? <SpinnerGap size={20} className="animate-spin" /> : <FloppyDisk size={20} weight="bold" />}
            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
          </button>
        </div>
      </motion.div>
    </>
  );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function CRM() {
  const navigate = useNavigate();
  const { token, userEmail, clients, setClients, user, logout } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFunnel, setCurrentFunnel] = useState('COMPRADORES');
  const [searchTerm, setSearchTerm] = useState('');
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);

  const openModal = (client) => setSelectedClient(client);

  const fetchClients = useCallback(async (isManual = false) => {
    if (!user?.name) return;
    if (isManual) setRefreshing(true); else setLoading(true);
    try {
      const url = `${API_URL}?action=getData&userRequested=${encodeURIComponent(user.name)}&token=${encodeURIComponent(token)}&userEmail=${encodeURIComponent(userEmail)}`;
      const data = await fetch(url).then(r => r.json());
      
      if (Array.isArray(data)) {
        setClients(data);
        if (isManual) toast.success('Base de datos sincronizada');
      } else {
        setClients([]);
        if (data?.error) {
          toast.error(`Error: ${data.error}`);
          if (data.error === 'Unauthorized') {
            setTimeout(() => logout(), 2000);
          }
        }
      }
    } catch (error) {
      toast.error('Error al sincronizar');
    } finally { setLoading(false); setRefreshing(false); }
  }, [user?.name, setClients, token, userEmail]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const filteredClients = useMemo(() => {
    const funnelCats = FUNNELS[currentFunnel].categories;
    let list = clients.filter(c => {
      if (!funnelCats.includes(c.cat)) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (c.nom?.toLowerCase().includes(q)) ||
             (c.prop?.toLowerCase().includes(q)) ||
             (c.zona?.toLowerCase().includes(q)) ||
             (c.tel?.includes(q));
    });
    // Default sort by urgency
    return list.sort((a, b) => getHealthStatus(a).urgency - getHealthStatus(b).urgency);
  }, [clients, currentFunnel, searchTerm]);

  const handleDrop = (e, newStage) => {
    e.preventDefault();
    if (!draggedItemId) return;
    const client = clients.find(c => c.id === draggedItemId);
    if (!client || client.etapa === newStage) return;
    setClients(clients.map(c => c.id === draggedItemId ? { ...c, etapa: newStage } : c));
    setSelectedClient({ ...client, etapa: newStage });
    toast.info('¡Movimiento registrado! Definí el próximo paso.');
    setDraggedItemId(null);
  };

  const handleSaveModal = async ({ tempDate, tempNote, tempEtapa }) => {
    if (!tempDate) { toast.error('La Próxima Acción es obligatoria.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=updateClient`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ id: selectedClient.id, etapa: tempEtapa, agenda: tempDate, nota: tempNote, token, userEmail }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      const updatedNotes = tempNote?.trim()
        ? `[${new Date().toLocaleDateString('es-AR')}] ${tempNote}\n${selectedClient.notas || ''}`
        : selectedClient.notas;

      setClients(clients.map(c =>
        c.id === selectedClient.id
          ? { ...c, etapa: tempEtapa, agenda: tempDate, notas: updatedNotes }
          : c
      ));
      toast.success('Gestión guardada en Google Sheets ✓');
      setSelectedClient(null);
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <SpinnerGap size={36} className="animate-spin text-amber-300" />
      <span className="text-[11px] font-black text-slate-500 tracking-[0.25em] uppercase">Cargando pipeline...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#040810] p-4 md:p-6 rounded-2xl border border-white/[0.05] shadow-2xl relative overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors containerStyle={{ zIndex: 100 }} />

      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6 shrink-0">
        <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-white/[0.05]">
          {Object.keys(FUNNELS).map(key => {
            const f = FUNNELS[key];
            const isActive = currentFunnel === key;
            return (
              <button key={key} onClick={() => setCurrentFunnel(key)}
                      className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isActive ? 'shadow-md' : 'hover:bg-white/5'}`}
                      style={isActive ? { backgroundColor: f.bg, color: f.color } : { color: '#64748b' }}>
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative w-full lg:w-64">
            <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type="text" placeholder="Buscar cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-900/50 border border-white/[0.05] rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/30 transition-colors" />
          </div>
          
          <button onClick={() => setShowBulkImport(true)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors border border-white/5" title="Importar Excel">
            <FileArrowUp size={16} weight="duotone" className="text-emerald-400" /> <span className="hidden md:inline">Importar</span>
          </button>
          
          <button onClick={() => fetchClients(true)} disabled={refreshing} className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition-colors border border-white/5 disabled:opacity-50">
            <ArrowsClockwise size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-x-auto pb-4 custom-scroll snap-x">
        {STAGES.map(stage => {
          const col = filteredClients.filter(c => (c.etapa || 'INGRESO') === stage.id);
          return (
            <div key={stage.id} className="min-w-[280px] w-[280px] bg-slate-900/20 rounded-2xl border border-white/[0.03] flex flex-col h-full"
                 onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage.id)}>
              <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.03] shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color, boxShadow: `0 0 8px ${stage.color}` }} />
                  <span className="text-[10px] font-black text-slate-300 tracking-[0.2em] uppercase">{stage.label}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-white/5">{col.length}</span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scroll">
                <AnimatePresence>
                  {col.map(client => (
                    <KanbanCard key={client.id} client={client} funnelKey={currentFunnel} onSelect={openModal} onDragStart={setDraggedItemId} />
                  ))}
                </AnimatePresence>
                {col.length === 0 && (
                  <div className="flex items-center justify-center h-24 text-[10px] text-slate-700 font-bold uppercase tracking-widest border-2 border-dashed border-white/5 rounded-xl">
                    Vacío
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SIDE PANEL (SLIDE-OVER) */}
      <AnimatePresence>
        {selectedClient && (
          <SidePanel client={selectedClient} onClose={() => setSelectedClient(null)} onSave={handleSaveModal} saving={saving} />
        )}
      </AnimatePresence>

      {/* BULK IMPORT MODAL */}
      <AnimatePresence>
        {showBulkImport && (
          <BulkImport onClose={() => setShowBulkImport(false)} onImportSuccess={() => fetchClients(true)} />
        )}
      </AnimatePresence>
    </div>
  );
}

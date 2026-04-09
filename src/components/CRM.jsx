import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import {
  Kanban, SpinnerGap, MagnifyingGlass, CalendarBlank,
  WarningCircle, CalendarCheck, X, WhatsappLogo,
  FloppyDisk, Plus, ArrowsClockwise, CaretRight,
  UserPlus, Buildings, Phone, EnvelopeSimple,
  MapPin, CurrencyDollar, House, Tag, Clock,
  SortAscending, Funnel, ChartBar, CheckCircle,
  ArrowRight, Dot, Circle, Timer
} from 'phosphor-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

// ─── PIPELINE: 5 etapas del embudo inmobiliario ───────────────────────────────
const STAGES = [
  { id: 'INGRESO',    label: 'NUEVO',      short: 'NUEVO',   color: '#64748b', glow: 'rgba(100,116,139,0.3)',  icon: '●' },
  { id: 'CONTACTADO', label: 'CONTACTADO', short: 'CONT.',   color: '#38bdf8', glow: 'rgba(56,189,248,0.3)',   icon: '◎' },
  { id: 'GESTION',    label: 'EN GESTIÓN', short: 'GEST.',   color: '#fbbf24', glow: 'rgba(251,191,36,0.3)',   icon: '◈' },
  { id: 'RESERVA',    label: 'RESERVA',    short: 'RES.',    color: '#a78bfa', glow: 'rgba(167,139,250,0.3)',  icon: '◆' },
  { id: 'CERRADO',    label: 'CERRADO',    short: 'CERR.',   color: '#4ade80', glow: 'rgba(74,222,128,0.3)',   icon: '✓' },
];

// ─── COLORES POR CATEGORIA ────────────────────────────────────────────────────
const CAT_CONFIG = {
  COMPRADOR:    { color: '#38bdf8', bg: 'rgba(56,189,248,0.1)',  label: 'COMPRA' },
  INQUILINO:    { color: '#34d399', bg: 'rgba(52,211,153,0.1)',  label: 'ALQUILER' },
  VENDEDOR:     { color: '#fb923c', bg: 'rgba(251,146,60,0.1)',  label: 'VENDE' },
  PROPIETARIO:  { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', label: 'ALQUILA' },
};

// ─── ORIGEN: colores para badges ─────────────────────────────────────────────
const ORIGEN_COLORS = {
  'FACEBOOK ADS':   '#1877f2',
  'INSTAGRAM ADS':  '#e1306c',
  'REFERIDO':       '#4ade80',
  'PORTAL':         '#fbbf24',
  'LLAMADA':        '#38bdf8',
  'WHATSAPP':       '#25d366',
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

// ─── TARJETA KANBAN ───────────────────────────────────────────────────────────
const KanbanCard = ({ client, onSelect, onDragStart }) => {
  const health = getHealthStatus(client);
  const cat = CAT_CONFIG[client.cat] || CAT_CONFIG.COMPRADOR;
  const tel = fmtTel(client.tel);
  const lastNote = client.notas ? client.notas.split('\n')[0] : null;

  return (
    <motion.div
      layoutId={client.id}
      draggable
      onDragStart={() => onDragStart(client.id)}
      onClick={() => onSelect(client)}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      style={{ '--cat-color': cat.color }}
      className="group relative bg-[#0f172a] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer
                 hover:border-[var(--cat-color)]/40 transition-all duration-200 shadow-lg"
    >
      {/* borde lateral coloreado */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
           style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}` }} />

      <div className="pl-4 pr-3 pt-3 pb-3">
        {/* Fila 1: nombre + badge categoría */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="text-[13px] font-bold text-white leading-tight truncate flex-1">{client.nom}</h4>
          <span className="shrink-0 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                style={{ backgroundColor: cat.bg, color: cat.color }}>
            {cat.label}
          </span>
        </div>

        {/* Fila 2: Propiedad/Zona */}
        {(client.zona || client.prop) && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-2 truncate">
            <MapPin size={9} weight="fill" className="shrink-0 text-slate-600" />
            <span className="truncate">{client.zona || client.prop}</span>
          </div>
        )}

        {/* Fila 3: presupuesto si tiene */}
        {client.pre && (
          <div className="flex items-center gap-1 text-[10px] text-amber-300/70 mb-2">
            <CurrencyDollar size={9} weight="bold" className="shrink-0" />
            <span>{client.pre}</span>
          </div>
        )}

        {/* Última nota (preview) */}
        {lastNote && (
          <p className="text-[9px] text-slate-600 italic truncate mb-2 border-l border-slate-700 pl-2">
            {lastNote.replace(/^\[.*?\]\s*/, '')}
          </p>
        )}

        {/* Fila bottom: health + acción rápida WA */}
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

// ─── TARJETA AGENDA ───────────────────────────────────────────────────────────
const AgendaCard = ({ client, onSelect }) => {
  const health = getHealthStatus(client);
  const cat = CAT_CONFIG[client.cat] || CAT_CONFIG.COMPRADOR;
  const tel = fmtTel(client.tel);

  return (
    <motion.div
      whileHover={{ x: 3 }}
      onClick={() => onSelect(client)}
      className="flex items-center gap-3 p-3 bg-[#0f172a] border border-white/[0.06] rounded-xl
                 hover:border-white/20 cursor-pointer transition-all group"
    >
      <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: health.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-bold text-white truncate">{client.nom}</span>
          <span className="text-[8px] font-black shrink-0" style={{ color: health.color }}>{health.label}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-[9px] text-slate-500">
          <span className="font-black uppercase" style={{ color: cat.color }}>{cat.label}</span>
          {client.zona && <span className="truncate">{client.zona}</span>}
          {client.etapa && (
            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase">{client.etapa}</span>
          )}
        </div>
      </div>
      {tel && (
        <a href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer"
           onClick={(e) => e.stopPropagation()}
           className="p-2 bg-green-500/10 rounded-lg text-green-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-green-500/20">
          <WhatsappLogo size={14} weight="fill" />
        </a>
      )}
    </motion.div>
  );
};

// ─── MODAL DE GESTIÓN ─────────────────────────────────────────────────────────
const GestionModal = ({ client, onClose, onSave, saving }) => {
  const [tempNote, setTempNote] = useState('');
  const [tempDate, setTempDate] = useState(client.agenda ? client.agenda.split('T')[0] : '');
  const [tempEtapa, setTempEtapa] = useState(client.etapa || 'INGRESO');
  const cat = CAT_CONFIG[client.cat] || CAT_CONFIG.COMPRADOR;
  const tel = fmtTel(client.tel);
  const health = getHealthStatus(client);

  // Notas históricas parseadas
  const notasHistory = useMemo(() => {
    if (!client.notas) return [];
    return client.notas.split('\n').filter(Boolean).map(line => {
      const match = line.match(/^\[(.+?)\]\s*(.*)/);
      return match ? { fecha: match[1], texto: match[2] } : { fecha: '—', texto: line };
    });
  }, [client.notas]);

  const handleSave = () => onSave({ tempDate, tempNote, tempEtapa });

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#0b1120] border border-white/10 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del modal */}
        <div className="relative p-5 pb-4 border-b border-white/[0.06]"
             style={{ background: `linear-gradient(135deg, ${cat.bg}, transparent)` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-black text-white leading-tight truncate">{client.nom}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest"
                      style={{ backgroundColor: cat.bg, color: cat.color }}>{cat.label}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: health.color }}>
                  {health.label}
                </span>
                {client.agenda && (
                  <span className="text-[9px] text-slate-500">· Agenda: {fmtDate(client.agenda)}</span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-full transition-colors shrink-0">
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          {/* Datos clave del cliente en el header */}
          <div className="flex flex-wrap gap-3 mt-3">
            {tel && (
              <a href={`tel:+${tel}`} className="flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-white transition-colors">
                <Phone size={11} weight="fill" className="text-slate-500" /> {client.tel}
              </a>
            )}
            {client.mail && (
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <EnvelopeSimple size={11} weight="fill" className="text-slate-500" /> {client.mail}
              </span>
            )}
            {client.zona && (
              <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <MapPin size={11} weight="fill" className="text-slate-500" /> {client.zona}
              </span>
            )}
            {client.pre && (
              <span className="flex items-center gap-1.5 text-[10px] text-amber-300/70">
                <CurrencyDollar size={11} weight="bold" /> {client.pre}
              </span>
            )}
          </div>

          {/* Propiedad/Interés */}
          {client.prop && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-400">
              <House size={11} weight="fill" className="text-slate-500" />
              <span className="font-medium">{client.prop}</span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Cambiar etapa del pipeline */}
          <div>
            <label className="text-[9px] font-black text-slate-500 block mb-2 uppercase tracking-widest">Etapa del Pipeline</label>
            <div className="flex gap-1.5 flex-wrap">
              {STAGES.map(s => (
                <button key={s.id} onClick={() => setTempEtapa(s.id)}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border"
                        style={tempEtapa === s.id
                          ? { backgroundColor: s.color + '20', color: s.color, borderColor: s.color + '60', boxShadow: `0 0 8px ${s.glow}` }
                          : { backgroundColor: 'transparent', color: '#475569', borderColor: 'rgba(255,255,255,0.08)' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Próxima acción + WhatsApp en grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-slate-500 block mb-1.5 uppercase tracking-widest">
                Próxima Acción <span className="text-red-400">*</span>
              </label>
              <input type="date" value={tempDate} onChange={(e) => setTempDate(e.target.value)}
                     className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white text-xs
                                focus:border-amber-200/50 outline-none transition-all" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 block mb-1.5 uppercase tracking-widest">Contacto Rápido</label>
              <div className="flex gap-2 h-[38px]">
                {tel ? (
                  <>
                    <a href={`https://wa.me/${tel}`} target="_blank" rel="noreferrer"
                       className="flex-1 flex items-center justify-center gap-1.5 bg-green-500/10 text-green-400
                                  rounded-xl border border-green-500/20 font-bold text-[10px] hover:bg-green-500/20 transition-all">
                      <WhatsappLogo size={14} weight="fill" /> WA
                    </a>
                    <a href={`tel:+${tel}`}
                       className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 text-blue-400
                                  rounded-xl border border-blue-500/20 font-bold text-[10px] hover:bg-blue-500/20 transition-all">
                      <Phone size={14} weight="fill" /> TEL
                    </a>
                  </>
                ) : (
                  <span className="flex items-center text-[10px] text-slate-600 px-2">Sin teléfono</span>
                )}
              </div>
            </div>
          </div>

          {/* Nueva nota */}
          <div>
            <label className="text-[9px] font-black text-slate-500 block mb-1.5 uppercase tracking-widest">Agregar Nota de Gestión</label>
            <textarea value={tempNote} onChange={(e) => setTempNote(e.target.value)}
                      placeholder="¿Qué se habló? ¿Qué queda pendiente?"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white h-20
                                 resize-none focus:outline-none focus:border-amber-200/50 transition-all placeholder:text-slate-700" />
          </div>

          {/* Historial de notas */}
          {notasHistory.length > 0 && (
            <div>
              <label className="text-[9px] font-black text-slate-500 block mb-2 uppercase tracking-widest">Historial de Gestión</label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {notasHistory.map((n, i) => (
                  <div key={i} className="flex gap-2 text-[10px]">
                    <span className="text-slate-600 font-mono shrink-0 pt-0.5">{n.fecha}</span>
                    <span className="text-slate-400 leading-relaxed">{n.texto}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="p-5 pt-0">
          <button onClick={handleSave} disabled={saving || !tempDate}
                  className="w-full bg-amber-300 text-slate-900 font-black py-3.5 rounded-2xl flex items-center
                             justify-center gap-2 hover:bg-amber-200 transition-all shadow-xl shadow-amber-300/10
                             disabled:opacity-40 disabled:cursor-not-allowed text-sm uppercase tracking-widest">
            {saving ? <SpinnerGap size={18} className="animate-spin" /> : <FloppyDisk size={18} weight="bold" />}
            {saving ? 'Guardando...' : 'Guardar Gestión'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── BARRA DE STATS (mini KPIs en cabecera) ───────────────────────────────────
const StatsBar = ({ clients }) => {
  const vencidos = clients.filter(c => getHealthStatus(c).status === 'vencido').length;
  const hoy      = clients.filter(c => getHealthStatus(c).status === 'hoy').length;
  const sinAccion = clients.filter(c => !c.agenda).length;
  const cerrados = clients.filter(c => c.etapa === 'CERRADO').length;

  return (
    <div className="flex gap-3 text-[9px] font-black uppercase tracking-widest">
      {vencidos > 0 && (
        <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-lg border border-red-400/20">
          <WarningCircle size={10} weight="fill" /> {vencidos} vencidos
        </span>
      )}
      {hoy > 0 && (
        <span className="flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
          <Timer size={10} weight="fill" /> {hoy} hoy
        </span>
      )}
      {sinAccion > 0 && (
        <span className="flex items-center gap-1 text-slate-500 bg-slate-800 px-2 py-1 rounded-lg border border-white/5">
          <Circle size={10} weight="fill" /> {sinAccion} sin agenda
        </span>
      )}
      {cerrados > 0 && (
        <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">
          <CheckCircle size={10} weight="fill" /> {cerrados} cerrados
        </span>
      )}
    </div>
  );
};

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function CRM() {
  const navigate = useNavigate();
  const { clients, setClients, user } = useAppStore();

  const [loading, setLoading]           = useState(true);
  const [refreshing, setRefreshing]     = useState(false);
  const [currentCat, setCurrentCat]     = useState('COMPRADOR');
  const [searchTerm, setSearchTerm]     = useState('');
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [viewMode, setViewMode]         = useState('KANBAN');
  const [showNewMenu, setShowNewMenu]   = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [saving, setSaving]             = useState(false);
  const [sortBy, setSortBy]             = useState('urgencia'); // 'urgencia' | 'nombre' | 'fecha'
  const [filterOrigenActivo, setFilterOrigenActivo] = useState(null);

  // ─── FETCH ──────────────────────────────────────────────────────────────────
  const fetchClients = useCallback(async (isManual = false) => {
    if (!user?.name) return;
    if (isManual) setRefreshing(true); else setLoading(true);
    try {
      const url = `${API_URL}?action=getData&userRequested=${encodeURIComponent(user.name)}`;
      const data = await fetch(url).then(r => r.json());
      setClients(data);
      if (isManual) toast.success('Base de datos sincronizada');
    } catch {
      toast.error('Error al sincronizar');
    } finally { setLoading(false); setRefreshing(false); }
  }, [user?.name, setClients]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  // ─── FILTRADO Y ORDENAMIENTO ─────────────────────────────────────────────────
  const filteredClients = useMemo(() => {
    let list = clients.filter(c => {
      if (c.cat !== currentCat) return false;
      if (filterOrigenActivo && c.origen !== filterOrigenActivo) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (c.nom?.toLowerCase().includes(q)) ||
             (c.prop?.toLowerCase().includes(q)) ||
             (c.zona?.toLowerCase().includes(q)) ||
             (c.tel?.includes(q));
    });

    if (sortBy === 'urgencia') {
      list = list.sort((a, b) => getHealthStatus(a).urgency - getHealthStatus(b).urgency);
    } else if (sortBy === 'nombre') {
      list = list.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
    } else if (sortBy === 'fecha') {
      list = list.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }
    return list;
  }, [clients, currentCat, searchTerm, sortBy, filterOrigenActivo]);

  // ─── DRAG & DROP ─────────────────────────────────────────────────────────────
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

  // ─── ABRIR MODAL ─────────────────────────────────────────────────────────────
  const openModal = (client) => setSelectedClient(client);

  // ─── GUARDAR CAMBIOS ──────────────────────────────────────────────────────────
  const handleSaveModal = async ({ tempDate, tempNote, tempEtapa }) => {
    if (!tempDate) { toast.error('La Próxima Acción es obligatoria.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}?action=updateClient`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ id: selectedClient.id, etapa: tempEtapa, agenda: tempDate, nota: tempNote }),
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

  // ─── LOADING ─────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <SpinnerGap size={36} className="animate-spin text-amber-300" />
      <span className="text-[11px] font-black text-slate-500 tracking-[0.25em] uppercase">Cargando cartera...</span>
    </div>
  );

  const cats = ['COMPRADOR', 'INQUILINO', 'VENDEDOR', 'PROPIETARIO'];

  // ─── CONTADORES POR CATEGORÍA ─────────────────────────────────────────────
  const countByCat = useMemo(() =>
    cats.reduce((acc, cat) => {
      acc[cat] = clients.filter(c => c.cat === cat).length;
      return acc;
    }, {}), [clients]);

  return (
    <div className="flex flex-col h-full bg-[#080e1a] p-3 md:p-5 rounded-2xl md:rounded-3xl border border-white/[0.07]
                    shadow-2xl relative overflow-hidden">
      <Toaster position="top-center" theme="dark" richColors />

      {/* ── CABECERA ── */}
      <div className="flex flex-col gap-3 mb-4 shrink-0">

        {/* Fila 1: Tabs vista + acciones */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Toggle vista */}
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/[0.06] gap-1">
            {[
              { id: 'KANBAN', icon: <Kanban size={13} weight="fill" />, label: 'PIPELINE' },
              { id: 'AGENDA', icon: <CalendarBlank size={13} weight="fill" />, label: 'AGENDA' },
            ].map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider
                        ${viewMode === v.id ? 'bg-amber-300 text-slate-900' : 'text-slate-500 hover:text-white'}`}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center gap-2">
            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="bg-slate-950/80 border border-white/[0.06] text-slate-400 text-[9px] font-black
                               uppercase tracking-wider rounded-xl px-3 py-2 outline-none">
              <option value="urgencia">Por urgencia</option>
              <option value="nombre">Por nombre</option>
              <option value="fecha">Por fecha</option>
            </select>

            <button onClick={() => fetchClients(true)} disabled={refreshing}
                    className="p-2 bg-slate-950/80 border border-white/[0.06] rounded-xl text-slate-400
                               hover:text-amber-300 transition-all disabled:opacity-40"
                    title="Sincronizar">
              <ArrowsClockwise size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>

            <button onClick={() => setShowNewMenu(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-300 text-slate-900 rounded-xl
                               text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-all shadow-lg">
              <Plus size={14} weight="bold" /> NUEVO
            </button>
          </div>
        </div>

        {/* Fila 2: Categorías + búsqueda */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tabs categoría con contadores */}
          <div className="flex gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/[0.06] flex-wrap">
            {cats.map(cat => {
              const cfg = CAT_CONFIG[cat];
              const isActive = currentCat === cat;
              return (
                <button key={cat} onClick={() => setCurrentCat(cat)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                        style={isActive
                          ? { backgroundColor: cfg.bg, color: cfg.color }
                          : { color: '#475569' }}>
                  {cat}
                  <span className="text-[8px] opacity-70">{countByCat[cat]}</span>
                </button>
              );
            })}
          </div>

          {/* Búsqueda */}
          <div className="relative flex-1 min-w-[180px]">
            <MagnifyingGlass size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input type="text" placeholder="Buscar por nombre, zona, teléfono..."
                   value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                   className="w-full bg-slate-950/80 border border-white/[0.06] rounded-xl pl-8 pr-4 py-2
                              text-[11px] text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-300/30 transition-all" />
          </div>
        </div>

        {/* Fila 3: Mini KPIs de urgencia */}
        <StatsBar clients={filteredClients} />
      </div>

      {/* ── VISTA KANBAN ── */}
      {viewMode === 'KANBAN' && (
        <div className="flex-1 min-h-0 flex gap-3 overflow-x-auto pb-3" style={{ scrollbarWidth: 'thin' }}>
          {STAGES.map(stage => {
            const col = filteredClients.filter(c => (c.etapa || 'INGRESO') === stage.id);
            const colVencidos = col.filter(c => getHealthStatus(c).status === 'vencido').length;
            return (
              <div key={stage.id}
                   className="min-w-[260px] w-[260px] bg-slate-900/30 rounded-2xl border border-white/[0.05]
                              flex flex-col h-full"
                   onDragOver={e => e.preventDefault()}
                   onDrop={e => handleDrop(e, stage.id)}>
                {/* Header columna */}
                <div className="px-3 py-2.5 flex items-center justify-between border-b border-white/[0.04] shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full"
                         style={{ backgroundColor: stage.color, boxShadow: `0 0 6px ${stage.color}` }} />
                    <span className="text-[9px] font-black text-slate-400 tracking-[0.18em] uppercase">{stage.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {colVencidos > 0 && (
                      <span className="text-[8px] font-black text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">
                        {colVencidos} ⚠
                      </span>
                    )}
                    <span className="text-[9px] font-bold bg-slate-800/60 text-slate-500 px-1.5 py-0.5 rounded-full">{col.length}</span>
                  </div>
                </div>
                {/* Cards */}
                <div className="p-2 flex-1 overflow-y-auto space-y-2" style={{ scrollbarWidth: 'none' }}>
                  <AnimatePresence>
                    {col.map(client => (
                      <KanbanCard key={client.id} client={client}
                                  onSelect={openModal} onDragStart={setDraggedItemId} />
                    ))}
                  </AnimatePresence>
                  {col.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-[9px] text-slate-700 uppercase tracking-widest">
                      Sin clientes
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VISTA AGENDA ── */}
      {viewMode === 'AGENDA' && (
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Vencidos */}
            <div>
              <h5 className="text-[9px] font-black text-red-400 tracking-[0.2em] uppercase flex items-center gap-1.5 mb-3 px-1">
                <WarningCircle weight="fill" size={11} /> Vencidos ({filteredClients.filter(c => getHealthStatus(c).status === 'vencido').length})
              </h5>
              <div className="space-y-2">
                {filteredClients
                  .filter(c => getHealthStatus(c).status === 'vencido')
                  .map(c => <AgendaCard key={c.id} client={c} onSelect={openModal} />)}
              </div>
            </div>
            {/* Hoy */}
            <div>
              <h5 className="text-[9px] font-black text-amber-400 tracking-[0.2em] uppercase flex items-center gap-1.5 mb-3 px-1">
                <CalendarCheck weight="fill" size={11} /> Hoy ({filteredClients.filter(c => getHealthStatus(c).status === 'hoy').length})
              </h5>
              <div className="space-y-2">
                {filteredClients
                  .filter(c => getHealthStatus(c).status === 'hoy')
                  .map(c => <AgendaCard key={c.id} client={c} onSelect={openModal} />)}
              </div>
            </div>
            {/* Próximos */}
            <div>
              <h5 className="text-[9px] font-black text-blue-400 tracking-[0.2em] uppercase flex items-center gap-1.5 mb-3 px-1">
                <CalendarBlank weight="fill" size={11} /> Próximos ({filteredClients.filter(c => ['proximo','ok'].includes(getHealthStatus(c).status)).length})
              </h5>
              <div className="space-y-2">
                {filteredClients
                  .filter(c => ['proximo','ok'].includes(getHealthStatus(c).status))
                  .map(c => <AgendaCard key={c.id} client={c} onSelect={openModal} />)}
              </div>
              {/* Sin agenda */}
              {filteredClients.filter(c => !c.agenda).length > 0 && (
                <div className="mt-4">
                  <h5 className="text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase flex items-center gap-1.5 mb-2 px-1">
                    Sin agendar ({filteredClients.filter(c => !c.agenda).length})
                  </h5>
                  <div className="space-y-2">
                    {filteredClients.filter(c => !c.agenda).map(c => <AgendaCard key={c.id} client={c} onSelect={openModal} />)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL GESTIÓN ── */}
      <AnimatePresence>
        {selectedClient && (
          <GestionModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            onSave={handleSaveModal}
            saving={saving}
          />
        )}
      </AnimatePresence>

      {/* ── MODAL NUEVO ── */}
      <AnimatePresence>
        {showNewMenu && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
            onClick={() => setShowNewMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-[#0b1120] border border-white/10 p-7 rounded-3xl w-full max-w-sm text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-amber-300/10 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-300">
                <UserPlus size={28} weight="duotone" />
              </div>
              <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">Nuevo Registro</h3>
              <p className="text-slate-500 text-[10px] mb-6 uppercase tracking-widest">Seleccioná el tipo de cliente</p>
              <div className="space-y-2.5">
                {[
                  { type: 'COMPRADOR', icon: <MagnifyingGlass weight="bold" />, color: '#38bdf8', label: 'Busca Propiedad', sub: 'Comprador o Inquilino', bg: 'rgba(56,189,248,0.08)' },
                  { type: 'VENDEDOR',  icon: <Buildings weight="bold" />,       color: '#fb923c', label: 'Ofrece Propiedad', sub: 'Vendedor o Propietario', bg: 'rgba(251,146,60,0.08)' },
                ].map(item => (
                  <button key={item.type}
                          onClick={() => { setShowNewMenu(false); navigate(item.type === 'COMPRADOR' ? '/compradores' : '/vendedores'); }}
                          className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-white/[0.06] transition-all text-left hover:border-white/20"
                          style={{ backgroundColor: item.bg }}>
                    <div className="p-2.5 rounded-xl" style={{ backgroundColor: item.color + '20', color: item.color }}>{item.icon}</div>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-white uppercase">{item.label}</span>
                      <span className="block text-[9px] text-slate-500 mt-0.5">{item.sub}</span>
                    </div>
                    <ArrowRight size={14} style={{ color: item.color }} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowNewMenu(false)}
                      className="mt-6 text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] transition-colors">
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
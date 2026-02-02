import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'react-plotly.js';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperPlaneRight, X, Robot, CircleNotch, Warning, 
  CaretDown, ChartBar, User, Funnel, CalendarBlank 
} from 'phosphor-react';

const API_URL = import.meta.env.VITE_API_URL;

// Configuración de métricas
const METRICS_OPTIONS = [
  { value: "CAPTACIONES", label: "CAPTACIONES" },
  { value: "VALUACIONES", label: "TASACIONES" },
  { value: "RESERVAS", label: "RESERVAS" },
  { value: "VISITAS", label: "VISITAS" },
  { value: "OPERACIONES COLOCADOR", label: "OP. COLOCADOR" },
  { value: "OPERACIONES CAPTADOR", label: "OP. CAPTADOR" },
  { value: "CLIENTES", label: "COMPRADORES" },
  { value: "CLIENTES VENDEDORES", label: "VENDEDORES" },
  { value: "CARTELES", label: "CARTELES" },
  { value: "RESEÑAS", label: "RESEÑAS" },
  { value: "GENERADO USD", label: "VENTAS (USD)" }
];

export default function Rendimiento() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState([]); 
  const [agentes, setAgentes] = useState([]);
  
  // Filtros
  const [agenteActual, setAgenteActual] = useState("TODOS");
  const [accionActual, setAccionActual] = useState("CAPTACIONES");
  const [periodoActual, setPeriodoActual] = useState("MENSUAL"); 

  // Chatbot
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', text: 'Analista listo. **¿Qué métricas revisamos hoy?**' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, chatOpen]);

  // Carga de Datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}?action=getDashboard`, { method: 'GET', redirect: 'follow' });
        const json = await response.json();
        if(json.error) throw new Error(json.error);
        
        setRawData(json.evolucion_data || []); 
        
        const lista = (json.agentes_activos || []).filter(a => a !== "TODOS").sort();
        lista.unshift("TODOS");
        setAgentes(lista);
        setLoading(false);
      } catch (err) { setError(err.message); setLoading(false); }
    };
    fetchData();
  }, []);

  // --- LÓGICA DE PROCESAMIENTO ---
  const pad2 = (n) => String(n).padStart(2, '0');
  
  const getDateNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0,0,0,0);
    return d;
  };

  const getSeries = () => {
    const graphMap = {}; 

    if (periodoActual === "MENSUAL") {
        const hoy = new Date();
        for (let i = 12; i >= 0; i--) {
            const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
            graphMap[key] = 0; 
        }

        rawData.forEach(item => {
            if (item.accion !== accionActual) return;
            if (agenteActual !== "TODOS" && item.agente !== agenteActual) return;
            const mesKey = item.fecha.substring(0, 7); 
            if (graphMap.hasOwnProperty(mesKey)) {
                graphMap[mesKey] += (+item.cantidad || 0);
            }
        });

        const keys = Object.keys(graphMap).sort();
        return keys.map(k => ({ x: k + "-01", y: graphMap[k] }));

    } else {
        const daysBack = parseInt(periodoActual);
        const limitDate = getDateNDaysAgo(daysBack);

        for (let i = daysBack - 1; i >= 0; i--) { 
            const d = new Date(); 
            d.setDate(d.getDate() - i); 
            const key = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
            graphMap[key] = 0;
        }

        rawData.forEach(item => {
            if (item.accion !== accionActual) return;
            if (agenteActual !== "TODOS" && item.agente !== agenteActual) return;
            const parts = item.fecha.split('-');
            const itemDate = new Date(parts[0], parts[1]-1, parts[2]);
            if (itemDate >= limitDate) {
                const key = item.fecha;
                if (graphMap.hasOwnProperty(key)) {
                    graphMap[key] += (+item.cantidad || 0);
                }
            }
        });

        const keys = Object.keys(graphMap).sort();
        return keys.map(k => ({ x: k, y: graphMap[k] }));
    }
  };

  const calculateKPIs = () => {
    let limitDate;
    const hoy = new Date();
    
    if (periodoActual === "MENSUAL") {
        limitDate = new Date(hoy.getFullYear(), hoy.getMonth() - 12, 1);
    } else {
        limitDate = getDateNDaysAgo(parseInt(periodoActual));
    }

    const filteredData = rawData.filter(d => {
        if (d.accion !== accionActual) return false;
        const parts = d.fecha.split('-');
        const itemDate = new Date(parts[0], parts[1]-1, parts[2]);
        return itemDate >= limitDate;
    });

    const totalFiltrado = filteredData.reduce((sum, item) => {
        if (agenteActual !== "TODOS" && item.agente !== agenteActual) return sum;
        return sum + (+item.cantidad || 0);
    }, 0);
    
    const totalEquipo = filteredData.reduce((sum, item) => sum + (+item.cantidad || 0), 0);

    const share = totalEquipo === 0 ? 0 : (totalFiltrado / totalEquipo) * 100;
    const displayValue = agenteActual === "TODOS" ? totalEquipo : totalFiltrado;
    const avgValue = agenteActual === "TODOS" ? (totalEquipo / (agentes.length - 1 || 1)) : totalFiltrado;

    return { totalEquipo, displayValue, avgValue, share };
  };

  const { totalEquipo, displayValue, avgValue, share } = calculateKPIs();
  const seriesData = getSeries();
  const x = seriesData.map(s => s.x);
  const y = seriesData.map(s => s.y);
  
  const isCurrency = accionActual.includes("USD");
  // Formateo condicional más compacto para móvil
  const fmt = (n) => {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return isCurrency ? '$ ' + n.toLocaleString('en-US', {maximumFractionDigits: 0}) : n.toLocaleString('es-AR');
  };

  const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const tickText = x.map((val, i) => {
      if (!val) return "";
      const p = val.split('-');
      // En móvil mostramos menos etiquetas (cada 2 o 3) si hay muchos datos
      if (window.innerWidth < 768 && x.length > 10 && i % 2 !== 0) return ""; 

      if (periodoActual === "MENSUAL") {
          const nombreMes = MESES[parseInt(p[1])-1];
          return nombreMes;
      } else {
          return p[2] + "/" + p[1]; 
      }
  });

    const handleSendMessage = async () => {
    if(!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { type: 'user', text: chatInput }]);
    const userMsg = chatInput;
    setChatInput("");
    setAiLoading(true);
    
    try {
        const response = await fetch(`${API_URL}?action=chatAI`, {
            method: 'POST', 
            body: JSON.stringify({ question: userMsg }), 
            headers: { "Content-Type": "text/plain;charset=utf-8" }
        });
        const json = await response.json();
        setChatMessages(prev => [...prev, { type: 'ai', text: json.answer }]);
    } catch (e) { 
        setChatMessages(prev => [...prev, { type: 'ai', text: "⚠️ Error de conexión con el Analista." }]); 
    }
    setAiLoading(false);
    };

  if (loading) return <div className="h-full flex flex-col items-center justify-center text-amber-200 gap-4"><CircleNotch size={48} className="animate-spin"/><span className="font-orbitron tracking-widest text-sm animate-pulse">CARGANDO MÉTRICAS...</span></div>;
  if (error) return <div className="h-full flex items-center justify-center text-red-400 font-rajdhani text-xl"><Warning size={32} className="mr-2"/> {error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      // Ajuste de scroll: overflow-y-auto habilitado y padding inferior grande para móvil
      className="flex flex-col h-full w-full gap-4 p-2 md:p-6 text-slate-200 overflow-y-auto md:overflow-hidden pb-24 md:pb-6 custom-scroll"
    >
      
      {/* 1. HUD CONTROL (FILTROS) */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center bg-slate-900/40 backdrop-blur-xl border border-white/5 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl shrink-0">
        
        {/* Título (Oculto en móvil muy pequeño o simplificado) */}
        <div className="hidden md:flex items-center gap-4 px-2 border-r border-white/5 pr-6 min-w-[200px]">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300"><ChartBar size={24} weight="duotone" /></div>
            <div>
                <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">DATA HUB</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Análisis en Tiempo Real</p>
            </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
            {/* Grid de selectores para móvil */}
            <div className="grid grid-cols-2 md:flex md:flex-row gap-2 md:gap-3">
                <div className="relative group col-span-1 md:flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-amber-200 transition-colors"><User size={16} /></div>
                    <select value={agenteActual} onChange={(e) => setAgenteActual(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 text-slate-300 text-xs md:text-sm font-medium rounded-xl pl-9 pr-8 py-3 appearance-none focus:outline-none focus:border-amber-200/50 focus:bg-slate-900 transition-all cursor-pointer truncate">
                        {agentes.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"><CaretDown size={12} weight="bold" /></div>
                </div>

                <div className="relative group col-span-1 md:flex-1">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-cyan-400 transition-colors"><Funnel size={16} /></div>
                    <select value={accionActual} onChange={(e) => setAccionActual(e.target.value)} className="w-full bg-slate-950/50 border border-white/10 text-slate-300 text-xs md:text-sm font-medium rounded-xl pl-9 pr-8 py-3 appearance-none focus:outline-none focus:border-cyan-400/50 focus:bg-slate-900 transition-all cursor-pointer truncate">
                        {METRICS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none"><CaretDown size={12} weight="bold" /></div>
                </div>
            </div>

            {/* Botones de periodo */}
            <div className="bg-slate-950/50 border border-white/10 rounded-xl p-1 flex items-center">
                {['MENSUAL', '30', '15', '7'].map(p => (
                    <button key={p} onClick={() => setPeriodoActual(p)} className={`flex-1 px-1 md:px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all font-inter ${periodoActual === p ? 'bg-amber-200 text-slate-950 shadow-lg shadow-amber-200/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        {p === 'MENSUAL' ? 'HIST' : `${p}D`}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* 2. GRID KPIS (Adaptable 2 cols en móvil) */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
           <KpiCard title={`Total`} value={fmt(totalEquipo)} subtitle="Equipo" color="text-cyan-400" />
           <KpiCard title={agenteActual === "TODOS" ? "Promedio" : `Personal`} value={fmt(avgValue)} subtitle={agenteActual === "TODOS" ? "/ Agente" : agenteActual.split(' ')[0]} color="text-amber-400" />
           <KpiCard title="Share" value={`${share.toFixed(1)}%`} subtitle="Cuota" color="text-emerald-400" />
           {/* KPI Extra visible solo si hay espacio o se puede cambiar */}
           <div className="hidden lg:block">
              <KpiCard title="Proyección" value={fmt(avgValue * 1.2)} subtitle="Meta +20%" color="text-purple-400" />
           </div>
      </div>

      {/* 3. GRÁFICO (Altura fija en móvil para evitar colapsos) */}
      <div className="flex-1 w-full min-h-[300px] md:min-h-0 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden flex flex-col shadow-2xl">
            <div className="flex justify-between items-start mb-2 z-10">
                <h3 className="text-white font-orbitron font-bold tracking-widest text-sm md:text-lg flex items-center gap-2">
                    <span className="w-1.5 h-4 md:h-6 bg-amber-400 rounded-full inline-block"></span>
                    EVOLUCIÓN
                </h3>
            </div>

            <div className="flex-1 w-full h-full min-h-[250px] z-10 relative">
                <Plotly
                    data={[
                        { 
                            x: x, y: y, type: 'bar', 
                            marker: { color: 'rgba(251, 191, 36, 0.7)', line: { color: '#fbbf24', width: 0 } }, 
                            name: 'Volumen', hovertemplate: isCurrency ? '%{text}<br>$%{y:,.0f}<extra></extra>' : '%{text}<br>Cant: %{y}<extra></extra>'
                        },
                        { 
                            x: x, y: y, type: 'scatter', mode: 'lines+markers', 
                            line: { color: '#38bdf8', width: 3, shape: 'spline' }, 
                            marker: { color: '#0f172a', size: 6, line: {color: '#38bdf8', width: 2} }, 
                            name: 'Tendencia', hoverinfo: 'skip'
                        }
                    ]}
                    layout={{
                        autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
                        font: { family: 'Rajdhani', color: '#64748b', size: 10 },
                        margin: { t: 10, b: 30, l: 30, r: 10 },
                        xaxis: { 
                            gridcolor: 'rgba(255,255,255,0.03)', zeroline: false,
                            tickmode: 'array', tickvals: x, ticktext: tickText,
                            fixedrange: true, tickangle: -45
                        },
                        yaxis: { 
                            gridcolor: 'rgba(255,255,255,0.03)', zerolinecolor: 'rgba(255,255,255,0.05)',
                            tickprefix: isCurrency ? '$' : '', fixedrange: true
                        },
                        showlegend: false, hovermode: 'closest',
                        hoverlabel: { bgcolor: '#0f172a', bordercolor: '#fbbf24', font: {family: 'Inter', color: '#fff'} }
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%", position: 'absolute' }}
                    config={{ displayModeBar: false }} // Desactiva barra de herramientas en móvil
                />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>
      </div>

      {/* CHATBOT (Ajustado para móvil) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-4">
        <AnimatePresence>
            {chatOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: 20, scale: 0.9 }} 
                    // En móvil: w-full y altura fija grande. En desktop: w-350 y altura 500
                    className="w-[calc(100vw-32px)] md:w-[350px] h-[60vh] md:h-[500px] mb-2 md:mb-0 bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden origin-bottom-right"
                >
                    <div className="p-4 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex justify-between items-center">
                        <div className="flex items-center gap-2"><div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400"><Robot size={18} weight="fill"/></div><span className="font-orbitron text-xs font-bold text-white tracking-widest">WARNER AI</span></div>
                        <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white"><X size={18} weight="bold"/></button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto custom-scroll flex flex-col gap-3 font-inter text-sm">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${msg.type === 'user' ? 'self-end bg-blue-600 text-white rounded-br-sm' : 'self-start bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'}`}>
                                <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                            </div>
                        ))}
                        {aiLoading && <div className="self-start text-amber-400 text-[10px] animate-pulse font-bold tracking-widest pl-2">PROCESANDO...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-white/5 bg-slate-950/50 flex gap-2">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Pregunta..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-600 font-inter px-2" />
                        <button type="submit" disabled={aiLoading} className="bg-amber-400 text-slate-900 p-2 rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50"><PaperPlaneRight size={18} weight="fill"/></button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
        <button onClick={() => setChatOpen(!chatOpen)} className="group w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center text-slate-950 hover:scale-110 hover:rotate-6 transition-all">
            {chatOpen ? <X size={20} md:size={24} weight="bold"/> : <Robot size={24} md:size={28} weight="fill" className="group-hover:animate-bounce" />}
        </button>
      </div>

    </motion.div>
  );
}

// KPI CARD OPTIMIZADO PARA MÓVIL
const KpiCard = ({ title, value, subtitle, color }) => (
    <div className={`group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between hover:bg-slate-800/40 transition-all duration-300`}>
        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-current opacity-50 group-hover:opacity-100 transition-opacity ${color}`}></div>
        <div className="pl-3 md:pl-4">
            <span className="text-[9px] md:text-[10px] font-orbitron font-bold text-slate-500 tracking-[0.2em] uppercase block mb-1">{title}</span>
            {/* Texto adaptable: más pequeño en móvil para que no se salga */}
            <div className={`font-rajdhani text-2xl md:text-5xl font-bold text-white mt-0 md:mt-1 drop-shadow-md truncate`}>{value}</div>
            <div className={`text-[9px] md:text-[10px] font-inter font-medium opacity-60 mt-1 md:mt-2 truncate ${color}`}>{subtitle}</div>
        </div>
    </div>
);
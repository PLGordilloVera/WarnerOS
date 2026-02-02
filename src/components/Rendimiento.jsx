import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'react-plotly.js';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperPlaneRight, X, Robot, CircleNotch, Warning, 
  CaretDown, ChartBar, User, Funnel, CalendarBlank 
} from 'phosphor-react';

const API_URL = import.meta.env.VITE_API_URL;

const METRICS_OPTIONS = [
  { value: "CAPTACIONES", label: "CAPTACIONES (VENTA)" },
  { value: "VALUACIONES", label: "TASACIONES" },
  { value: "RESERVAS", label: "RESERVAS" },
  { value: "VISITAS", label: "VISITAS" },
  { value: "OPERACIONES COLOCADOR", label: "CIERRES (COLOCADOR)" },
  { value: "OPERACIONES CAPTADOR", label: "CIERRES (CAPTADOR)" },
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
  
  const [agenteActual, setAgenteActual] = useState("TODOS");
  const [accionActual, setAccionActual] = useState("CAPTACIONES");
  const [periodoActual, setPeriodoActual] = useState("MENSUAL"); 

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { type: 'ai', text: 'Analista listo. **¿Qué métricas revisamos hoy?**' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages, chatOpen]);

  // CARGA Y NORMALIZACIÓN INICIAL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}?action=getDashboard`, { method: 'GET', redirect: 'follow' });
        const json = await response.json();
        
        if(json.error) throw new Error(json.error);
        
        // 1. Normalizar lista de agentes para el selector
        const lista = (json.agentes_activos || []).map(a => a.toUpperCase().trim()).sort();
        if (!lista.includes("TODOS")) lista.unshift("TODOS");
        setAgentes(lista);

        // 2. Normalizar datos de evolución al recibirlos
        const dataLimpia = (json.evolucion_data || []).map(item => ({
            ...item,
            agente: item.agente.toUpperCase().trim()
        }));
        
        setRawData(dataLimpia); 
        setLoading(false);
      } catch (err) { 
        console.error("Error en Fetch:", err);
        setError(err.message); 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const pad2 = (n) => String(n).padStart(2, '0');
  const getDateNDaysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    d.setHours(0,0,0,0);
    return d;
  };

  // LÓGICA DE GRÁFICOS CON FILTRO NORMALIZADO
  const getSeries = () => {
    const graphMap = {}; 
    const nomFiltro = agenteActual.toUpperCase().trim();

    if (periodoActual === "MENSUAL") {
        const hoy = new Date();
        for (let i = 12; i >= 0; i--) {
            const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
            graphMap[key] = 0; 
        }

        rawData.forEach(item => {
            if (item.accion !== accionActual) return;
            // Comparación robusta
            if (agenteActual !== "TODOS" && item.agente !== nomFiltro) return;

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
            if (agenteActual !== "TODOS" && item.agente !== nomFiltro) return;

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

    const nomFiltro = agenteActual.toUpperCase().trim();

    const totalFiltrado = filteredData.reduce((sum, item) => {
        if (agenteActual !== "TODOS" && item.agente !== nomFiltro) return sum;
        return sum + (+item.cantidad || 0);
    }, 0);
    
    const totalEquipo = filteredData.reduce((sum, item) => sum + (+item.cantidad || 0), 0);
    const share = totalEquipo === 0 ? 0 : (totalFiltrado / totalEquipo) * 100;
    const avgValue = agenteActual === "TODOS" ? (totalEquipo / (agentes.length - 1 || 1)) : totalFiltrado;

    return { totalEquipo, totalFiltrado, avgValue, share };
  };

  const { totalEquipo, totalFiltrado, avgValue, share } = calculateKPIs();
  const seriesData = getSeries();
  const x = seriesData.map(s => s.x);
  const y = seriesData.map(s => s.y);
  
  const isCurrency = accionActual.includes("USD");
  const fmt = (n) => {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
      return isCurrency ? '$ ' + n.toLocaleString('en-US', {maximumFractionDigits: 0}) : n.toLocaleString('es-AR');
  };

  const MESES = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  const tickText = x.map((val, i) => {
      if (!val) return "";
      const p = val.split('-');
      if (window.innerWidth < 768 && x.length > 10 && i % 2 !== 0) return ""; 
      return (periodoActual === "MENSUAL") ? MESES[parseInt(p[1])-1] : `${p[2]}/${p[1]}`;
  });

  const handleSendMessage = async () => {
    if(!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setChatInput("");
    setAiLoading(true);
    try {
        const resp = await fetch(`${API_URL}?action=chatAI&question=${encodeURIComponent(userMsg)}`, { method: 'GET', redirect: 'follow' });
        const json = await resp.json();
        setChatMessages(prev => [...prev, { type: 'ai', text: json.answer }]);
    } catch (e) {
        setChatMessages(prev => [...prev, { type: 'ai', text: "Error de conexión." }]);
    }
    setAiLoading(false);
  };

  if (loading) return <div className="h-full flex flex-col items-center justify-center text-amber-200 gap-4"><CircleNotch size={48} className="animate-spin"/><span className="font-orbitron tracking-widest text-sm animate-pulse">CARGANDO MÉTRICAS...</span></div>;
  if (error) return <div className="h-full flex items-center justify-center text-red-400 font-rajdhani text-xl"><Warning size={32} className="mr-2"/> {error}</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="flex flex-col h-full w-full gap-4 p-2 md:p-6 text-slate-200 overflow-y-auto md:overflow-hidden pb-24 md:pb-6 custom-scroll"
    >
      {/* HUD CONTROL */}
      <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center bg-slate-900/40 backdrop-blur-xl border border-white/5 p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-xl shrink-0">
        <div className="hidden md:flex items-center gap-4 px-2 border-r border-white/5 pr-6 min-w-[200px]">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-300"><ChartBar size={24} weight="duotone" /></div>
            <div>
                <h2 className="font-orbitron text-lg font-bold text-white tracking-wider">DATA HUB</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Análisis en Tiempo Real</p>
            </div>
        </div>

        <div className="flex-1 flex flex-col gap-3">
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

            <div className="bg-slate-950/50 border border-white/10 rounded-xl p-1 flex items-center">
                {['MENSUAL', '30', '15', '7'].map(p => (
                    <button key={p} onClick={() => setPeriodoActual(p)} className={`flex-1 px-1 md:px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all font-inter ${periodoActual === p ? 'bg-amber-200 text-slate-950 shadow-lg shadow-amber-200/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        {p === 'MENSUAL' ? 'HIST' : `${p}D`}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* KPIS */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
           <KpiCard title={`Total Equipo`} value={fmt(totalEquipo)} subtitle="Rendimiento Global" color="text-cyan-400" />
           <KpiCard title={agenteActual === "TODOS" ? "Promedio" : `Personal`} value={fmt(agenteActual === "TODOS" ? avgValue : totalFiltrado)} subtitle={agenteActual === "TODOS" ? "/ Agente" : agenteActual.split(' ')[0]} color="text-amber-400" />
           <KpiCard title="Market Share" value={`${share.toFixed(1)}%`} subtitle="Cuota de Producción" color="text-emerald-400" />
           <div className="hidden lg:block">
              <KpiCard title="Proyección" value={fmt((agenteActual === "TODOS" ? totalEquipo : totalFiltrado) * 1.2)} subtitle="Meta Estructurada" color="text-purple-400" />
           </div>
      </div>

      {/* GRÁFICO */}
      <div className="flex-1 w-full min-h-[300px] md:min-h-0 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 relative overflow-hidden flex flex-col shadow-2xl">
            <h3 className="text-white font-orbitron font-bold tracking-widest text-sm md:text-lg flex items-center gap-2 mb-2 z-10">
                <span className="w-1.5 h-4 md:h-6 bg-amber-400 rounded-full inline-block"></span>
                EVOLUCIÓN TEMPORAL
            </h3>
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
                        xaxis: { gridcolor: 'rgba(255,255,255,0.03)', zeroline: false, tickmode: 'array', tickvals: x, ticktext: tickText, fixedrange: true, tickangle: -45 },
                        yaxis: { gridcolor: 'rgba(255,255,255,0.03)', zerolinecolor: 'rgba(255,255,255,0.05)', tickprefix: isCurrency ? '$' : '', fixedrange: true },
                        showlegend: false, hovermode: 'closest'
                    }}
                    useResizeHandler={true}
                    style={{ width: "100%", height: "100%", position: 'absolute' }}
                    config={{ displayModeBar: false }}
                />
            </div>
      </div>

      {/* CHATBOT AI */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[60] flex flex-col items-end gap-4">
        <AnimatePresence>
            {chatOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} 
                    className="w-[calc(100vw-32px)] md:w-[350px] h-[60vh] md:h-[500px] bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden origin-bottom-right"
                >
                    <div className="p-4 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent flex justify-between items-center">
                        <div className="flex items-center gap-2"><div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400"><Robot size={18} weight="fill"/></div><span className="font-orbitron text-xs font-bold text-white tracking-widest">WARNER AI</span></div>
                        <button onClick={() => setChatOpen(false)} className="text-slate-500 hover:text-white"><X size={18} weight="bold"/></button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 font-inter text-sm">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${msg.type === 'user' ? 'self-end bg-blue-600 text-white rounded-br-sm' : 'self-start bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'}`}>
                                <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} />
                            </div>
                        ))}
                        {aiLoading && <div className="self-start text-amber-400 text-[10px] animate-pulse font-bold tracking-widest pl-2">PROCESANDO...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 border-t border-white/5 flex gap-2">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Pregunta..." className="flex-1 bg-transparent text-white text-sm outline-none px-2" />
                        <button type="submit" disabled={aiLoading} className="bg-amber-400 text-slate-900 p-2 rounded-xl hover:bg-amber-300 transition-colors"><PaperPlaneRight size={18} weight="fill"/></button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
        <button onClick={() => setChatOpen(!chatOpen)} className="group w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center text-slate-950 transition-all">
            {chatOpen ? <X size={20} weight="bold"/> : <Robot size={24} weight="fill" className="group-hover:animate-bounce" />}
        </button>
      </div>
    </motion.div>
  );
}

const KpiCard = ({ title, value, subtitle, color }) => (
    <div className={`group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-6 flex flex-col justify-between hover:bg-slate-800/40 transition-all duration-300`}>
        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-current ${color}`}></div>
        <div className="pl-3 md:pl-4">
            <span className="text-[9px] md:text-[10px] font-orbitron font-bold text-slate-500 tracking-[0.2em] uppercase block mb-1">{title}</span>
            <div className={`font-rajdhani text-2xl md:text-5xl font-bold text-white mt-0 md:mt-1 drop-shadow-md truncate`}>{value}</div>
            <div className={`text-[9px] md:text-[10px] font-inter font-medium opacity-60 mt-1 md:mt-2 truncate ${color}`}>{subtitle}</div>
        </div>
    </div>
);
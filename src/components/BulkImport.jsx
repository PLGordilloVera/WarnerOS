import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadSimple, FileArrowUp, CheckCircle, ArrowRight, X, ArrowsLeftRight } from 'phosphor-react';
import { toast } from 'sonner';
import { useAppStore } from '../store/useAppStore';

const VENDEDORES_COLS = [
  'AGENTE INMOBILIARIO', 'ORIGEN DE CONTACTO', 'TELEFONO_CLIENTE', 'EMAIL_CLIENTE', 
  'OPERACION', 'INMUEBLE', 'OBSERVACIONES', 'NOMBRE_CLIENTE', 'ETAPA', 'AGENDA', 'NOTAS'
];

const COMPRADORES_COLS = [
  'AGENTE INMOBILIARIO', 'ORIGEN DE CONTACTO', 'NOMBRE_CLIENTE', 'TELEFONO_CLIENTE', 
  'EMAIL_CLIENTE', 'OPERACION_CLIENTE', 'INMUEBLE', 'AMBIENTES', 'COCHERA', 
  'PRESUPUESTO', 'MONEDA', 'PUEDE ACCEDER A CREDITO HIPOTECARIO', 'PISO', 
  'ZONA QUE PREFIERE', 'OBSERVACIONES', 'PERFIL', 'ETAPA', 'AGENDA', 'NOTAS'
];

export default function BulkImport({ onClose, onImportSuccess }) {
  const { user, token, userEmail } = useAppStore();
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Review/Send
  const [type, setType] = useState('COMPRADOR'); // COMPRADOR or VENDEDOR
  const [fileData, setFileData] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(false);

  const targetCols = type === 'COMPRADOR' ? COMPRADORES_COLS : VENDEDORES_COLS;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { defval: "" });
        
        if (data.length === 0) {
          toast.error("El archivo está vacío.");
          return;
        }
        
        const headers = Object.keys(data[0]);
        setFileHeaders(headers);
        setFileData(data);
        
        // Auto-mapeo básico
        const initialMap = {};
        targetCols.forEach(col => {
          const match = headers.find(h => h.toLowerCase().trim() === col.toLowerCase().trim());
          if (match) initialMap[col] = match;
        });
        setMapping(initialMap);
        setStep(2);
      } catch (err) {
        toast.error("Error al procesar el archivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const generateJSON = () => {
    return fileData.map(row => {
      const obj = { categoria: type }; // For backend identifying
      targetCols.forEach(col => {
        const fileCol = mapping[col];
        if (fileCol && row[fileCol] !== undefined) {
          obj[col] = row[fileCol];
        }
      });
      return obj;
    });
  };

  const handleImport = async () => {
    const finalData = generateJSON();
    if (finalData.length === 0) return toast.error("No hay datos para importar");
    
    // As per user prompt: "Al finalizar, debe generar un JSON limpio para enviar al backend"
    console.log("JSON Generado:", finalData);
    
    setLoading(true);
    try {
      // If we don't have a bulk endpoint, we send them one by one, or ideally create a bulk endpoint.
      // Let's assume we map the fields to handleCreateClient format and send individually for now, or just show success.
      // We will map fields to the ones expected by handleCreateClient.
      
      const API_URL = import.meta.env.VITE_API_URL;
      const payload = {
        action: 'bulkCreateClients',
        token,
        userEmail,
        clients: finalData
      };
      
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      
      if(resData.status === 'success') {
        toast.success(`${resData.count} registros importados correctamente.`);
      } else {
        toast.error("Error del servidor: " + resData.error);
      }
      if (onImportSuccess) onImportSuccess();
      onClose();
    } catch (err) {
      toast.error("Error durante la importación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileArrowUp size={24} weight="duotone" className="text-emerald-400" />
              Importación Masiva
            </h2>
            <p className="text-xs text-slate-400 mt-1">Carga leads desde un archivo Excel (.xlsx)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          {step === 1 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6">
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setType('COMPRADOR')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'COMPRADOR' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'}`}
                >
                  Embudo Compradores
                </button>
                <button 
                  onClick={() => setType('VENDEDOR')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'VENDEDOR' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'}`}
                >
                  Embudo Vendedores
                </button>
              </div>

              <div className="relative group cursor-pointer">
                <div className="w-80 h-48 border-2 border-dashed border-slate-600 rounded-2xl flex flex-col items-center justify-center gap-3 group-hover:border-emerald-400 group-hover:bg-emerald-400/5 transition-all">
                  <UploadSimple size={48} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-sm font-medium text-slate-300">Haz clic o arrastra un .xlsx aquí</span>
                </div>
                <input 
                  type="file" 
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <ArrowsLeftRight size={18} className="text-amber-400"/> Mapeo de Columnas
                </h3>
                <p className="text-xs text-slate-400 mb-6">Relaciona las columnas de tu Excel con las del sistema.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {targetCols.map(sysCol => (
                    <div key={sysCol} className="flex flex-col gap-1.5 p-3 bg-slate-900 rounded-lg border border-slate-700/50">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{sysCol}</span>
                      <select 
                        value={mapping[sysCol] || ''} 
                        onChange={(e) => setMapping(prev => ({...prev, [sysCol]: e.target.value}))}
                        className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded px-3 py-2 outline-none focus:border-amber-400/50"
                      >
                        <option value="">-- Ignorar / No mapear --</option>
                        {fileHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors">Atrás</button>
                <button 
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-colors"
                >
                  Continuar <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 border border-emerald-500/30">
                <CheckCircle size={32} weight="fill" className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Todo listo para importar!</h3>
              <p className="text-slate-400 text-sm mb-8 text-center max-w-md">
                Se detectaron <strong>{fileData.length}</strong> registros en el archivo para el embudo de <strong>{type}</strong>. 
                Se generará el JSON y se enviará al servidor.
              </p>
              
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} disabled={loading} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-white transition-colors">Volver</button>
                <button 
                  onClick={handleImport}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-slate-950 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-emerald-400 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Importando...' : 'Iniciar Importación'}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

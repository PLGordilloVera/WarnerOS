import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { 
  Calculator, CaretRight, User, SpinnerGap, House, 
  CheckCircle, CurrencyDollar, FileText, Ruler, 
  ChatText, Clock, IdentificationBadge
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

// --- COMPONENTES UI EXTERNOS ---

const SectionCard = ({ title, icon, children, className = "" }) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl ${className}`}>
    <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, name, value, onChange, type="text", placeholder, className="", ...props }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
    <div className="relative group">
        {props.icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-200 transition-colors">{props.icon}</div>}
        <input 
          type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} {...props}
          className={`w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 ${props.icon ? 'pl-12' : ''} text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all uppercase placeholder:normal-case placeholder:text-slate-600`} 
        />
    </div>
  </div>
);

const TextArea = ({ label, name, value, onChange, rows=3, placeholder, className="", ...props }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
    <textarea 
      name={name} rows={rows} placeholder={placeholder} value={value} onChange={onChange} {...props}
      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all uppercase placeholder:normal-case placeholder:text-slate-600 custom-scroll" 
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, className="", ...props }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
    <div className="relative">
      <select name={name} value={value} onChange={onChange} {...props}
          className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 appearance-none focus:border-amber-200/50 focus:outline-none cursor-pointer hover:bg-slate-900/80 transition-colors">
          <option value="">...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <CaretRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" size={14} />
    </div>
  </div>
);

export default function Valuacion() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre_propietario: '', celular: '', email: '', 
    provincia: 'TUCUMÁN', ciudad: '', calle: '', numero: '', barrio: '', 
    padron_catastral: '', padron_municipal: '',
    
    // Características (AQUÍ AGREGAMOS LOS PISOS)
    tipo_inmueble: '', antiguedad: '', m2_construidos: '', m2_terreno: '',
    ambientes: '', dormitorios: '', banos: '', cocheras: '',
    patio_jardin: 'NO', balcon: 'NO', cocina: 'SEPARADA', disposicion: '', 
    piso_ubicacion: '', cantidad_pisos: '', constructora: '', // Nuevos campos en el state
    
    // Estado (1-10)
    humedad: '', pintura: '', pisos_estado: '', revoques: '', fachada: '', estado_inmueble: '',
    
    // Legal & $
    documentacion: 'ESCRITURA PERFECTA', expensas: 'NO', monto_expensas: '', comodidades: '',
    
    // Entrevista Venta
    origen_contacto: '', recomendado_por: '', contacto_previo: 'NO',
    motivo_venta: '', ocupantes: '', experiencia_previa: '',
    urgencia_venta: 'NORMAL', precio_expectativa: '', decision_compartida: 'NO',
    
    // Historial
    primera_vez_venta: 'SI', tiempo_venta: '', inmobiliaria_anterior: '', 
    precio_publicacion_anterior: '', fecha_inicio_venta: '', razon_no_venta: '',
    
    // Cierre
    condicion_10_dias: 'NO', necesita_comprar: 'NO', tipo_compra_futura: '',
    permuta_financiacion: 'NO', horarios_visita: '', valor_escritura: '', observaciones: ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'text' || type === 'textarea' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_propietario) return toast.warning("Falta Nombre Propietario");
    if (!formData.calle) return toast.warning("Falta Calle");
    if (!formData.estado_inmueble) return toast.warning("Selecciona el Estado General del Inmueble");

    setLoading(true);
    const payload = {
      action: 'addValuacion',
      agente: user?.name,
      ...formData
    };

    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
      toast.success("¡Valuación registrada correctamente!");
      setTimeout(() => navigate('/', { state: { view: 'FORMS' } }), 1500);
      
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans overflow-y-auto overflow-x-hidden custom-scroll relative selection:bg-amber-500/30 selection:text-amber-900">
      <Toaster position="top-center" theme="dark" richColors />

      {/* Fondos */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Botón Volver */}
      <button onClick={() => navigate('/', { state: { view: 'FORMS' } })} className="fixed top-4 left-4 z-50 group flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full hover:border-amber-200/50 transition-all shadow-lg active:scale-95">
        <CaretRight size={14} weight="bold" className="rotate-180 text-slate-400 group-hover:text-amber-200 transition-colors" />
        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-200 uppercase tracking-widest transition-colors">Volver</span>
      </button>

      <div className="min-h-full flex justify-center p-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl relative z-10">
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Alta de Tasación</h1>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Formulario Sincronizado con Base de Datos</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* 0. RESPONSABLE */}
              <SectionCard title="Responsable de Tasación" icon={<IdentificationBadge size={16}/>}>
                <div className="relative flex items-center bg-slate-950/50 border border-amber-500/20 rounded-xl p-4 text-slate-200">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300 mr-4">
                        <User size={24} weight="fill" />
                    </div>
                    <div>
                        <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider block">Agente Tasador</span>
                        <span className="font-bold text-lg text-white tracking-wide">{user?.name || "Usuario Desconocido"}</span>
                    </div>
                </div>
              </SectionCard>

              {/* 1. PROPIETARIO */}
              <SectionCard title="1. Datos del Propietario" icon={<User size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Input label="Nombre Completo" name="nombre_propietario" value={formData.nombre_propietario} onChange={handleChange} required className="md:col-span-2" />
                    <Input label="Celular" name="celular" type="tel" value={formData.celular} onChange={handleChange} />
                    <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} style={{textTransform:'none'}} />
                    <Input label="Origen de Contacto" name="origen_contacto" placeholder="Ej: Instagram, Cartel, etc." value={formData.origen_contacto} onChange={handleChange} />
                    <Input label="¿Quién recomendó?" name="recomendado_por" value={formData.recomendado_por} onChange={handleChange} />
                    <Input label="¿Contacto previo con agente?" name="contacto_previo" placeholder="¿Con quién?" value={formData.contacto_previo} onChange={handleChange} />
                </div>
              </SectionCard>

              {/* SECCIÓN 2: UBICACIÓN */}
              <SectionCard title="2. Ubicación y Catastro" icon={<MapPin size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Input label="Calle" name="calle" value={formData.calle} onChange={handleChange} required />
                    <Input label="Número" name="numero" value={formData.numero} onChange={handleChange} />
                    <Input label="Barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
                    <Input label="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                    <Input label="Provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input label="Padrón Catastral" name="padron_catastral" value={formData.padron_catastral} onChange={handleChange} />
                        <Input label="Padrón Municipal" name="padron_municipal" value={formData.padron_municipal} onChange={handleChange} />
                    </div>
                 </div>
              </SectionCard>

              {/* 2. CARACTERÍSTICAS FÍSICAS */}
              <SectionCard title="2. Características del Inmueble" icon={<House size={16}/>}>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Select label="Tipo Inmueble" name="tipo_inmueble" options={['CASA','DEPARTAMENTO','TERRENO','PH','LOCAL','OFICINA','GALPON']} value={formData.tipo_inmueble} onChange={handleChange} />
                    <Input label="Antigüedad (Años)" name="antiguedad" type="number" value={formData.antiguedad} onChange={handleChange} />
                    <Input label="M² Cubiertos" name="m2_construidos" type="number" value={formData.m2_construidos} onChange={handleChange} />
                    <Input label="M² Terreno" name="m2_terreno" type="number" value={formData.m2_terreno} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Input label="Ambientes" name="ambientes" type="number" value={formData.ambientes} onChange={handleChange} />
                    <Input label="Dormitorios" name="dormitorios" type="number" value={formData.dormitorios} onChange={handleChange} />
                    <Input label="Baños" name="banos" type="number" value={formData.banos} onChange={handleChange} />
                    <Input label="Cocheras" name="cocheras" type="number" value={formData.cocheras} onChange={handleChange} />
                 </div>
                 
                 {/* 👇 AQUÍ AGREGAMOS LOS CAMPOS DE PISOS */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Input label="Piso (Ubicación)" name="piso_ubicacion" placeholder="Ej: 4to A" value={formData.piso_ubicacion} onChange={handleChange} />
                    <Input label="Cant. Pisos Edificio" name="cantidad_pisos" type="number" value={formData.cantidad_pisos} onChange={handleChange} />
                    <div className="md:col-span-2"></div>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <Select label="Patio/Jardín" name="patio_jardin" options={['SI','NO','PEQUEÑO']} value={formData.patio_jardin} onChange={handleChange} />
                    <Select label="Balcón" name="balcon" options={['SI','NO','ATERRAZADO']} value={formData.balcon} onChange={handleChange} />
                    <Input label="Piso (Unidad)" name="piso_ubicacion" value={formData.piso_ubicacion} onChange={handleChange} />
                    <Input label="Cant. de Pisos Edificio" name="cantidad_pisos" value={formData.cantidad_pisos} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* 3. ESTADO (1-10) */}
              <SectionCard title="3. Estado de Conservación (1-10)" icon={<Ruler size={16}/>}>
                 <div className="grid grid-cols-5 gap-3">
                    {['humedad', 'pintura', 'pisos_estado', 'revoques', 'fachada'].map(field => (
                        <div key={field} className="text-center">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{field.replace('_estado','')}</label>
                            <input type="number" name={field} min="1" max="10" value={formData[field]} onChange={handleChange} 
                                className="w-full bg-slate-950/30 border border-white/10 rounded-xl p-2 text-center text-white font-bold focus:border-amber-500/50 focus:outline-none" placeholder="-" />
                        </div>
                    ))}
                 </div>
                 <Select label="Estado General (Resumen)" name="estado_inmueble" options={['EXCELENTE','MUY BUENO','BUENO','REGULAR','A RECICLAR','DEMOLICION']} value={formData.estado_inmueble} onChange={handleChange} />
              </SectionCard>

              {/* 4. LEGALES */}
              <SectionCard title="4. Aspectos Legales y Gastos" icon={<FileText size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Select label="Documentación" name="documentacion" options={opcionesDocumentacion} value={formData.documentacion} onChange={handleChange} />
                    <Input label="Constructora / Edificio" name="constructora" value={formData.constructora} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="¿Paga Expensas?" name="expensas" options={['NO','SI']} value={formData.expensas} onChange={handleChange} />
                        {formData.expensas === 'SI' && (
                            <Input label="Monto Mensual" name="monto_expensas" type="number" value={formData.monto_expensas} onChange={handleChange} />
                        )}
                    </div>
                    <Input label="Comodidades Ubicación" name="comodidades" placeholder="Ej: Cerca de parque, escuelas..." value={formData.comodidades} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* 5. ENTREVISTA VENTA */}
              <SectionCard title="5. Entrevista de Venta (Motivación)" icon={<ChatText size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Input label="¿Por qué vende?" name="motivo_venta" value={formData.motivo_venta} onChange={handleChange} />
                    <Input label="¿Quién vive hoy?" name="ocupantes" value={formData.ocupantes} onChange={handleChange} />
                    <Input label="Urgencia de Venta" name="urgencia_venta" value={formData.urgencia_venta} onChange={handleChange} />
                    <Input label="Precio que espera (Dueño)" name="precio_expectativa" type="number" value={formData.precio_expectativa} onChange={handleChange} icon={<CurrencyDollar size={16}/>} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select label="¿Decisión Compartida?" name="decision_compartida" options={['SI (ESPOSOS)','SI (HERMANOS)','NO (UNICO DUEÑO)']} value={formData.decision_compartida} onChange={handleChange} />
                    <Select label="¿Experiencia previa vendiendo?" name="experiencia_previa" options={['SI, BUENA','SI, MALA','NUNCA VENDIO']} value={formData.experiencia_previa} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* 6. HISTORIAL */}
              <SectionCard title="6. Historial Comercial" icon={<Clock size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <Select label="¿Primera vez en venta?" name="primera_vez_venta" options={['SI','NO']} value={formData.primera_vez_venta} onChange={handleChange} />
                    <Input label="Tiempo en venta" name="tiempo_venta" placeholder="Ej: 6 meses" value={formData.tiempo_venta} onChange={handleChange} />
                    <Input label="Inmobiliaria anterior" name="inmobiliaria_anterior" value={formData.inmobiliaria_anterior} onChange={handleChange} />
                    <Input label="Precio publicado antes" name="precio_publicacion_anterior" value={formData.precio_publicacion_anterior} onChange={handleChange} />
                    <Input label="Fecha inicio venta" type="date" name="fecha_inicio_venta" value={formData.fecha_inicio_venta} onChange={handleChange} />
                    <Input label="¿Por qué no se vendió?" name="razon_no_venta" value={formData.razon_no_venta} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* 7. CIERRE */}
              <SectionCard title="7. Condiciones de Cierre" icon={<CheckCircle size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Select label="¿Vende si hay oferta en 10 días?" name="condicion_10_dias" options={['SI, SEGURO','LO PENSARIA','NO']} value={formData.condicion_10_dias} onChange={handleChange} />
                    <Select label="¿Necesita comprar otra?" name="necesita_comprar" options={['SI (REUBICACION)','NO (INVERSION/EFECTIVO)']} value={formData.necesita_comprar} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Tipo propiedad que busca" name="tipo_compra_futura" value={formData.tipo_compra_futura} onChange={handleChange} />
                    <Input label="Valor Escrituración Deseado" name="valor_escritura" value={formData.valor_escritura} onChange={handleChange} />
                 </div>
                 <div className="mt-5">
                    <TextArea label="Observaciones Finales / Detalles Técnicos" name="observaciones" value={formData.observaciones} onChange={handleChange} />
                 </div>
                 <TextArea label="Observaciones Finales" name="observaciones" value={formData.observaciones} onChange={handleChange} />
              </SectionCard>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-6 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:shadow-[0_0_60px_rgba(251,191,36,0.5)] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-base uppercase tracking-widest hover:brightness-110">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <> <CheckCircle size={24} weight="fill"/> REGISTRAR TASACIÓN</>}
              </button>
            </form>
        </motion.div>
      </div>
    </div>
  );
}
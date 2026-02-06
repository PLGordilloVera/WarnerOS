import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { 
  Calculator, CaretRight, User, SpinnerGap, House, 
  MapPin, CheckCircle, CurrencyDollar, FileText, Ruler, 
  ChatText, Clock, Question, IdentificationBadge
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
    tipo_inmueble: '', humedad: '', pintura: '', pisos_estado: '', revoques: '', fachada: '', estado_inmueble: '',
    ambientes: '', banos: '', cocina: 'SEPARADA', patio_jardin: 'NO', balcon: 'NO', disposicion: '', 
    piso_ubicacion: '', cantidad_pisos: '', documentacion: 'ESCRITURA PERFECTA', monto_expensas: '0', 
    constructora: '', antiguedad: '', comodidades: '', observaciones: '',
    m2_construidos: '', m2_terreno: '',
    origen_contacto: '', recomendado_por: '', contacto_previo: '', motivo_venta: '', ocupantes: '', 
    experiencia_previa: '', urgencia_venta: '', precio_expectativa: '', decision_compartida: '',
    primera_vez_venta: 'SI', tiempo_venta: '', inmobiliaria_anterior: '', precio_publicacion_anterior: '', 
    fecha_inicio_venta: '', razon_no_venta: '', condicion_10_dias: '', necesita_comprar: '', 
    tipo_compra_futura: '', permuta_financiacion: '', horarios_visita: '', valor_escritura: '', precio_tasacion: ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'text' || type === 'textarea' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre_propietario || !formData.calle) return toast.warning("Completa los campos obligatorios");

    setLoading(true);

    // Mapeo exacto a las columnas del Sheets
    const payload = {
      action: 'addValuacion',
      "AGENTE INMOBILIARIO": user?.name || "S/D",
      "NOMBRE_PROPIETARIO": formData.nombre_propietario,
      "CELULAR_PROPIETARIO": formData.celular,
      "EMAIL_PROPIETARIO": formData.email,
      "PROVINCIA": formData.provincia,
      "CIUDAD": formData.ciudad,
      "CALLE": formData.calle,
      "NUMERO": formData.numero,
      "BARRIO": formData.barrio,
      "PADRON_CATASTRAL": formData.padron_catastral,
      "PADRON MUNICIPAL": formData.padron_municipal,
      "TIPO_DE_INMUEBLE": formData.tipo_inmueble,
      "HUMEDAD": formData.humedad,
      "PINTURA": formData.pintura,
      "PISOS": formData.pisos_estado,
      "REVOQUES": formData.revoques,
      "FACHADA": formData.fachada,
      "ESTADO_INMUEBLE": formData.estado_inmueble,
      "AMBIENTES": formData.ambientes,
      "BAÑOS": formData.banos,
      "COCINA": formData.cocina,
      "PATIO_JARDIN": formData.patio_jardin,
      "BALCON": formData.balcon,
      "DISPOSICION": formData.disposicion,
      "PISO": formData.piso_ubicacion,
      "CANTIDAD_DE_PISOS": formData.cantidad_pisos,
      "DOCUMENTACION": formData.documentacion,
      "MONTO EXPENSAS": formData.monto_expensas,
      "CONSTRUCTORA": formData.constructora,
      "ANTIGUEDAD": formData.antiguedad,
      "COMODIDADES DE LA UBICACION": formData.comodidades,
      "OBSERVACIONES": formData.observaciones,
      "M2_CONSTRUIDOS/PROPIOS": formData.m2_construidos,
      "M2_TERRENO/TOTALES": formData.m2_terreno,
      "ORIGEN DE CONTACTO": formData.origen_contacto,
      "QUIEN SE LO RECOMENDO?": formData.recomendado_por,
      "TUVO CONTACTO CON ALGUN AGENTE ANTES? CON QUIEN?": formData.contacto_previo,
      "PORQUE VENDE LA PROPIEDAD?": formData.motivo_venta,
      "QUIEN VIVE EN LA PROPIEDAD ACTUALMENTE?": formData.ocupantes,
      "ALGUNA VEZ VENDIO UN INMUEBLE? COMO FUE SU EXPERIENCIA?": formData.experiencia_previa,
      "QUE TAN RAPIDO PRETENDE VENDER SU PROPIEDAD?": formData.urgencia_venta,
      "QUE PRECIO CONSIDERA QUE VALE SU INMUEBLE?": formData.precio_expectativa,
      "LA DESICION DE VENTA ES COMPARTIDA?": formData.decision_compartida,
      "ES LA PRIMERA VEZ QUE SE PONE EN VENTA EL INMUEBLE?": formData.primera_vez_venta,
      "CUANTO TIEMPO ESTUVO EN VENTA?": formData.tiempo_venta,
      "CON QUE INMOBILIARIA?": formData.inmobiliaria_anterior,
      "EN QUE PRECIO ESTUVO PUBLICADA?": formData.precio_publicacion_anterior,
      "EN QUE FECHA SE PUSO EN VENTA?": formData.fecha_inicio_venta,
      "POR QUE CREE QUE NO se VENDIO?": formData.razon_no_venta,
      "SI SE PRESENTA UN COMPRADOR ANTES DE QUE SE CUMPLAN 10 DIAS DE SER PUBLICADA, LA VENDE?": formData.condicion_10_dias,
      "NECESITA COMPRAR OTRA PROPIEDAD?": formData.necesita_comprar,
      "QUE TIPO DE INMUEBLE BUSCA EN EL CASO DE COMPRAR OTRO?": formData.tipo_compra_futura,
      "ACEPTA PERMUTAS O FINANCIACIÓN? DE QUÉ TIPO?": formData.permuta_financiacion,
      "DIAS Y HORARIOS QUE SE PUEDE VISITAR": formData.horarios_visita,
      "EN QUE VALOR NECESITA ESCRITURARLA EN CASO DE SER VENDIDA?": formData.valor_escritura,
      "PRECIO TASACION": formData.precio_tasacion
    };

    try {
      await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
      toast.success("¡Tasación registrada!");
      setTimeout(() => navigate('/', { state: { view: 'FORMS' } }), 1500);
    } catch (err) {
      toast.error("Error al enviar datos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans overflow-y-auto overflow-x-hidden custom-scroll relative">
      <Toaster position="top-center" theme="dark" richColors />
      
      <div className="min-h-full flex justify-center p-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl relative z-10">
            
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Alta de Tasación</h1>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">Formulario Sincronizado con Base de Datos</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* SECCIÓN 1: PROPIETARIO */}
              <SectionCard title="1. Identificación" icon={<User size={16}/>}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Input label="Nombre del Propietario" name="nombre_propietario" value={formData.nombre_propietario} onChange={handleChange} required />
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

              {/* SECCIÓN 3: CARACTERÍSTICAS */}
              <SectionCard title="3. Características Físicas" icon={<House size={16}/>}>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Select label="Tipo Inmueble" name="tipo_inmueble" options={['CASA','DEPARTAMENTO','TERRENO','PH','LOCAL','OFICINA','GALPON']} value={formData.tipo_inmueble} onChange={handleChange} />
                    <Input label="Antigüedad" name="antiguedad" value={formData.antiguedad} onChange={handleChange} />
                    <Input label="M² Construidos/Propios" name="m2_construidos" value={formData.m2_construidos} onChange={handleChange} />
                    <Input label="M² Terreno/Totales" name="m2_terreno" value={formData.m2_terreno} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Input label="Ambientes" name="ambientes" value={formData.ambientes} onChange={handleChange} />
                    <Input label="Baños" name="banos" value={formData.banos} onChange={handleChange} />
                    <Select label="Cocina" name="cocina" options={['SEPARADA','INTEGRADA','COMEDOR']} value={formData.cocina} onChange={handleChange} />
                    <Select label="Disposición" name="disposicion" options={['FRENTE','CONTRAFRENTE','LATERAL','INTERNO']} value={formData.disposicion} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <Select label="Patio/Jardín" name="patio_jardin" options={['SI','NO','PEQUEÑO']} value={formData.patio_jardin} onChange={handleChange} />
                    <Select label="Balcón" name="balcon" options={['SI','NO','ATERRAZADO']} value={formData.balcon} onChange={handleChange} />
                    <Input label="Piso (Unidad)" name="piso_ubicacion" value={formData.piso_ubicacion} onChange={handleChange} />
                    <Input label="Cant. de Pisos Edificio" name="cantidad_pisos" value={formData.cantidad_pisos} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* SECCIÓN 4: ESTADO TÉCNICO */}
              <SectionCard title="4. Estado de Conservación" icon={<Ruler size={16}/>}>
                 <div className="grid grid-cols-5 gap-3 mb-6">
                    {['humedad', 'pintura', 'pisos_estado', 'revoques', 'fachada'].map(field => (
                        <div key={field} className="text-center">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">{field.replace('_estado','')}</label>
                            <input type="number" name={field} min="1" max="10" value={formData[field]} onChange={handleChange} 
                                className="w-full bg-slate-950/30 border border-white/10 rounded-xl p-2 text-center text-white font-bold" placeholder="1-10" />
                        </div>
                    ))}
                 </div>
                 <Select label="Estado General (Resumen)" name="estado_inmueble" options={['EXCELENTE','MUY BUENO','BUENO','REGULAR','A RECICLAR','DEMOLICION']} value={formData.estado_inmueble} onChange={handleChange} />
              </SectionCard>

              {/* SECCIÓN 5: LEGAL Y GESTIÓN */}
              <SectionCard title="5. Datos Legales y Gastos" icon={<FileText size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Select label="Documentación" name="documentacion" options={['ESCRITURA PERFECTA','BOLETO','SUCESION EN PROCESO','OTRO']} value={formData.documentacion} onChange={handleChange} />
                    <Input label="Monto Expensas" name="monto_expensas" type="number" value={formData.monto_expensas} onChange={handleChange} />
                    <Input label="Constructora / Edificio" name="constructora" value={formData.constructora} onChange={handleChange} />
                    <Input label="Comodidades Ubicación" name="comodidades" placeholder="Ej: Cerca de bancos, parques..." value={formData.comodidades} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* SECCIÓN 6: ENTREVISTA COMERCIAL */}
              <SectionCard title="6. Motivación de Venta" icon={<ChatText size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="¿Por qué vende?" name="motivo_venta" value={formData.motivo_venta} onChange={handleChange} />
                    <Input label="¿Quién vive actualmente?" name="ocupantes" value={formData.ocupantes} onChange={handleChange} />
                    <Input label="Experiencia previa vendiendo" name="experiencia_previa" value={formData.experiencia_previa} onChange={handleChange} />
                    <Input label="Rapidez que pretende" name="urgencia_venta" value={formData.urgencia_venta} onChange={handleChange} />
                    <Input label="Precio que considera que vale" name="precio_expectativa" value={formData.precio_expectativa} onChange={handleChange} icon={<CurrencyDollar size={16}/>} />
                    <Select label="Decisión Compartida" name="decision_compartida" options={['SI','NO']} value={formData.decision_compartida} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* SECCIÓN 7: HISTORIAL Y CIERRE */}
              <SectionCard title="7. Historial y Condiciones" icon={<Clock size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <Select label="¿Primera vez en venta?" name="primera_vez_venta" options={['SI','NO']} value={formData.primera_vez_venta} onChange={handleChange} />
                    <Input label="Tiempo en venta" name="tiempo_venta" placeholder="Ej: 6 meses" value={formData.tiempo_venta} onChange={handleChange} />
                    <Input label="Inmobiliaria anterior" name="inmobiliaria_anterior" value={formData.inmobiliaria_anterior} onChange={handleChange} />
                    <Input label="Precio publicado antes" name="precio_publicacion_anterior" value={formData.precio_publicacion_anterior} onChange={handleChange} />
                    <Input label="Fecha inicio venta" type="date" name="fecha_inicio_venta" value={formData.fecha_inicio_venta} onChange={handleChange} />
                    <Input label="¿Por qué no se vendió?" name="razon_no_venta" value={formData.razon_no_venta} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Select label="¿Vende en menos de 10 días?" name="condicion_10_dias" options={['SI','NO','DUDOSO']} value={formData.condicion_10_dias} onChange={handleChange} />
                    <Select label="¿Necesita comprar otra?" name="necesita_comprar" options={['SI','NO']} value={formData.necesita_comprar} onChange={handleChange} />
                    <Input label="¿Qué tipo de inmueble busca?" name="tipo_compra_futura" value={formData.tipo_compra_futura} onChange={handleChange} />
                    <Input label="Acepta Permuta/Financiación" name="permuta_financiacion" placeholder="Ej: Solo permuta menor valor" value={formData.permuta_financiacion} onChange={handleChange} />
                    <Input label="Días y Horarios de Visita" name="horarios_visita" value={formData.horarios_visita} onChange={handleChange} />
                    <Input label="Valor Escritura Deseado" name="valor_escritura" value={formData.valor_escritura} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-1 gap-5">
                    <TextArea label="Observaciones Finales" name="observaciones" value={formData.observaciones} onChange={handleChange} />
                    <Input label="PRECIO DE TASACIÓN SUGERIDO" name="precio_tasacion" value={formData.precio_tasacion} onChange={handleChange} className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20" />
                 </div>
              </SectionCard>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-6 rounded-2xl shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <><CheckCircle size={24} weight="fill"/> REGISTRAR TASACIÓN COMPLETA</>}
              </button>

            </form>
        </motion.div>
      </div>
    </div>
  );
}
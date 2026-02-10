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

// --- COMPONENTES UI REUTILIZABLES ---
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
    tipo_inmueble: '', antiguedad: '', m2_construidos: '', m2_terreno: '',
    ambientes: '', dormitorios: '', banos: '', cocheras: '',
    patio_jardin: 'NO', balcon: 'NO', cocina: 'SEPARADA', disposicion: '', 
    piso_ubicacion: '', cantidad_pisos: '', constructora: '',
    humedad: '', pintura: '', pisos_estado: '', revoques: '', fachada: '', estado_inmueble: '',
    documentacion: 'ESCRITURA PERFECTA', expensas: 'NO', monto_expensas: '', comodidades: '',
    origen_contacto: '', recomendado_por: '', contacto_previo: 'NO',
    motivo_venta: '', ocupantes: '', experiencia_previa: '',
    urgencia_venta: 'NORMAL', precio_expectativa: '', decision_compartida: 'NO',
    primera_vez_venta: 'SI', tiempo_venta: '', inmobiliaria_anterior: '', 
    precio_publicacion_anterior: '', fecha_inicio_venta: '', razon_no_venta: '',
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
    
    // Validaciones básicas
    if (!formData.nombre_propietario) return toast.warning("Falta Nombre Propietario");
    if (!formData.calle) return toast.warning("Falta Calle");
    if (!formData.estado_inmueble) return toast.warning("Selecciona el Estado General");

    setLoading(true);

    // MAPEO EXACTO: "COLUMNA DE SHEET" : valor_del_state
    const payload = {
      action: 'addValuacion',
      
      // Identificación
      "AGENTE INMOBILIARIO": user?.name || "SIN AGENTE",
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

      // Características Físicas
      "TIPO_DE_INMUEBLE": formData.tipo_inmueble,
      "HUMEDAD": formData.humedad,
      "PINTURA": formData.pintura,
      "PISOS": formData.pisos_estado, // Ojo aquí, mapea tu state 'pisos_estado'
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
      "M2_CONSTRUIDOS/PROPIOS": formData.m2_construidos,
      "M2_TERRENO/TOTALES": formData.m2_terreno,
      "ANTIGUEDAD": formData.antiguedad,

      // Legales y Ubicación
      "DOCUMENTACION": formData.documentacion,
      "MONTO EXPENSAS": formData.monto_expensas,
      "CONSTRUCTORA": formData.constructora,
      "COMODIDADES DE LA UBICACION": formData.comodidades,
      "OBSERVACIONES": formData.observaciones,

      // Entrevista / Comercial (Nombres largos)
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
      "POR QUE CREE QUE NO SE VENDIO?": formData.razon_no_venta,
      
      // Cierre
      "SI SE PRESENTA UN COMPRADOR ANTES DE QUE SE CUMPLAN 10 DIAS DE SER PUBLICADA, LA VENDE?": formData.condicion_10_dias,
      "NECESITA COMPRAR OTRA PROPIEDAD?": formData.necesita_comprar,
      "QUE TIPO DE INMUEBLE BUSCA EN EL CASO DE COMPRAR OTRO?": formData.tipo_compra_futura,
      "ACEPTA PERMUTAS O FINANCIACION? DE QUE TIPO?": formData.permuta_financiacion,
      "DIAS Y HORARIOS QUE SE PUEDE VISITAR": formData.horarios_visita,
      "EN QUE VALOR NECESITA ESCRITURARLA EN CASO DE SER VENDIDA?": formData.valor_escritura,
      "PRECIO TASACION": "" // Lo dejamos vacío o ponle un valor si lo calculas
    };

    try {
      // Usamos mode: 'no-cors' si tienes problemas, pero idealmente maneja la respuesta
      await fetch(API_URL, { 
        method: 'POST', 
        body: JSON.stringify(payload)
      });
      
      // Asumimos éxito si no salta al catch (con no-cors no podemos leer respuesta)
      toast.success("¡Valuación enviada al sistema!");
      setTimeout(() => navigate('/', { state: { view: 'FORMS' } }), 1500);
      
    } catch (err) {
      console.error(err);
      toast.error("Error de conexión al enviar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-slate-950 text-slate-100 font-sans overflow-y-auto overflow-x-hidden relative selection:bg-amber-500/30 selection:text-amber-900">
      <Toaster position="top-center" theme="dark" richColors />
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Volver */}
      <button onClick={() => navigate('/', { state: { view: 'FORMS' } })} className="fixed top-4 left-4 z-50 group flex items-center gap-2 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full hover:border-amber-200/50 transition-all shadow-lg active:scale-95">
        <CaretRight size={14} weight="bold" className="rotate-180 text-slate-400 group-hover:text-amber-200 transition-colors" />
        <span className="text-xs font-bold text-slate-400 group-hover:text-amber-200 uppercase tracking-widest transition-colors">Volver</span>
      </button>

      <div className="min-h-full flex justify-center p-4 pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-5xl relative z-10">
            
            <div className="text-center mb-10">
              <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-white/10 shadow-xl mb-4">
                  <Calculator size={40} weight="duotone" className="text-amber-200" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">Alta de Tasación</h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">RELEVAMIENTO TÉCNICO Y COMERCIAL</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 0. RESPONSABLE */}
              <SectionCard title="Responsable" icon={<IdentificationBadge size={16}/>}>
                <div className="relative flex items-center bg-slate-950/50 border border-amber-500/20 rounded-xl p-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg text-amber-300 mr-4"><User size={24} weight="fill" /></div>
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
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Input label="Calle" name="calle" value={formData.calle} onChange={handleChange} required />
                    <Input label="Número" name="numero" type="number" value={formData.numero} onChange={handleChange} />
                    <Input label="Barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
                    <Input label="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                    <Input label="Provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-2">
                        <Input label="Padrón Cat." name="padron_catastral" type="number" value={formData.padron_catastral} onChange={handleChange} />
                        <Input label="Padrón Mun." name="padron_municipal" type="number" value={formData.padron_municipal} onChange={handleChange} />
                    </div>
                 </div>
              </SectionCard>

              {/* 2. CARACTERISTICAS */}
              <SectionCard title="2. Características" icon={<House size={16}/>}>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Select label="Tipo Inmueble" name="tipo_inmueble" options={['CASA','DEPARTAMENTO','TERRENO','PH','LOCAL','OFICINA','GALPON']} value={formData.tipo_inmueble} onChange={handleChange} />
                    <Input label="Antigüedad" name="antiguedad" type="number" value={formData.antiguedad} onChange={handleChange} />
                    <Input label="M² Cubiertos" name="m2_construidos" type="number" value={formData.m2_construidos} onChange={handleChange} />
                    <Input label="M² Terreno" name="m2_terreno" type="number" value={formData.m2_terreno} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Input label="Ambientes" name="ambientes" type="number" value={formData.ambientes} onChange={handleChange} />
                    <Input label="Dormitorios" name="dormitorios" type="number" value={formData.dormitorios} onChange={handleChange} />
                    <Input label="Baños" name="banos" type="number" value={formData.banos} onChange={handleChange} />
                    <Input label="Cocheras" name="cocheras" type="number" value={formData.cocheras} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Input label="Piso (Ubicación)" name="piso_ubicacion" placeholder="Ej: 4to A" value={formData.piso_ubicacion} onChange={handleChange} />
                    <Input label="Cant. Pisos Edificio" name="cantidad_pisos" type="number" value={formData.cantidad_pisos} onChange={handleChange} />
                    <Input label="Constructora" name="constructora" className="md:col-span-2" value={formData.constructora} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <Select label="Patio/Jardín" name="patio_jardin" options={['SI','NO','PEQUEÑO']} value={formData.patio_jardin} onChange={handleChange} />
                    <Select label="Balcón" name="balcon" options={['SI','NO','ATERRAZADO']} value={formData.balcon} onChange={handleChange} />
                    <Select label="Cocina" name="cocina" options={['SEPARADA','INTEGRADA','COMEDOR']} value={formData.cocina} onChange={handleChange} />
                    <Select label="Disposición" name="disposicion" options={['FRENTE','CONTRAFRENTE','LATERAL','INTERNO']} value={formData.disposicion} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* 3. ESTADO */}
              <SectionCard title="3. Estado (1-10)" icon={<Ruler size={16}/>}>
                 <div className="grid grid-cols-5 gap-3 mb-4">
                    {['humedad', 'pintura', 'pisos_estado', 'revoques', 'fachada'].map(field => (
                        <div key={field} className="text-center">
                            <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1 truncate">{field.replace('_',' ')}</label>
                            <input type="number" name={field} min="1" max="10" value={formData[field]} onChange={handleChange} 
                                className="w-full bg-slate-950/30 border border-white/10 rounded-xl p-2 text-center text-white font-bold focus:border-amber-500/50 focus:outline-none" />
                        </div>
                    ))}
                 </div>
                 <Select label="Estado General (Resumen)" name="estado_inmueble" options={['EXCELENTE','MUY BUENO','BUENO','REGULAR','A RECICLAR','DEMOLICION']} value={formData.estado_inmueble} onChange={handleChange} />
              </SectionCard>

              {/* 4. LEGALES */}
              <SectionCard title="4. Jurídico & Gastos" icon={<FileText size={16}/>}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Select label="Documentación" name="documentacion" options={['ESCRITURA PERFECTA','BOLETO','SUCESIÓN']} value={formData.documentacion} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-3">
                        <Select label="Expensas" name="expensas" options={['NO','SI']} value={formData.expensas} onChange={handleChange} />
                        {formData.expensas === 'SI' && <Input label="Monto" name="monto_expensas" type="number" value={formData.monto_expensas} onChange={handleChange} />}
                    </div>
                  </div>
                  <Input label="Comodidades Ubicación" name="comodidades" placeholder="Ej: Cerca de parque..." value={formData.comodidades} onChange={handleChange} />
              </SectionCard>

              {/* 5. ENTREVISTA (Aquí faltaban cosas) */}
              <SectionCard title="5. Entrevista Motivación" icon={<ChatText size={16}/>}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Input label="Motivo de venta" name="motivo_venta" value={formData.motivo_venta} onChange={handleChange} />
                    <Input label="Urgencia" name="urgencia_venta" value={formData.urgencia_venta} onChange={handleChange} />
                    <Input label="Expectativa $" name="precio_expectativa" type="number" value={formData.precio_expectativa} onChange={handleChange} icon={<CurrencyDollar size={16}/>} />
                    <Select label="Decisión" name="decision_compartida" options={['SI','NO']} value={formData.decision_compartida} onChange={handleChange} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <Input label="¿Quién vive hoy?" name="ocupantes" value={formData.ocupantes} onChange={handleChange} />
                     <Select label="Experiencia Previa" name="experiencia_previa" options={['SI, BUENA','SI, MALA','NUNCA VENDIO']} value={formData.experiencia_previa} onChange={handleChange} />
                     <Input label="Origen Contacto" name="origen_contacto" value={formData.origen_contacto} onChange={handleChange} />
                     <Input label="Recomendado por" name="recomendado_por" value={formData.recomendado_por} onChange={handleChange} />
                  </div>
              </SectionCard>

              {/* 6. HISTORIAL (FALTABA COMPLETO) */}
              <SectionCard title="6. Historial Comercial" icon={<Clock size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                    <Select label="¿Primera vez en venta?" name="primera_vez_venta" options={['SI','NO']} value={formData.primera_vez_venta} onChange={handleChange} />
                    <Input label="Tiempo en venta (Meses)" name="tiempo_venta" type="number" value={formData.tiempo_venta} onChange={handleChange} />
                    <Input label="Inmobiliaria Anterior" name="inmobiliaria_anterior" value={formData.inmobiliaria_anterior} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input label="Precio Publicación Anterior" name="precio_publicacion_anterior" value={formData.precio_publicacion_anterior} onChange={handleChange} />
                    <Input label="¿Por qué cree que no se vendió?" name="razon_no_venta" value={formData.razon_no_venta} onChange={handleChange} />
                 </div>
              </SectionCard>

              {/* 7. CIERRE (FALTABA COMPLETO) */}
              <SectionCard title="7. Cierre y Negociación" icon={<CheckCircle size={16}/>}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Select label="Vende en 10 días si hay oferta?" name="condicion_10_dias" options={['SI, SEGURO','LO PENSARIA','NO']} value={formData.condicion_10_dias} onChange={handleChange} />
                    <Select label="Necesita comprar otra?" name="necesita_comprar" options={['SI (REUBICACION)','NO (INVERSION/EFECTIVO)']} value={formData.necesita_comprar} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Input label="¿Qué busca comprar?" name="tipo_compra_futura" value={formData.tipo_compra_futura} onChange={handleChange} />
                    <Input label="Valor Escritura Deseado" name="valor_escritura" value={formData.valor_escritura} onChange={handleChange} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <Input label="Horarios Visita" name="horarios_visita" value={formData.horarios_visita} onChange={handleChange} />
                    <Input label="Permuta / Financiación" name="permuta_financiacion" value={formData.permuta_financiacion} onChange={handleChange} />
                 </div>
                 <TextArea label="Observaciones Finales" name="observaciones" value={formData.observaciones} onChange={handleChange} />
              </SectionCard>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-6 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 tracking-widest uppercase">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <> <CheckCircle size={24} weight="fill"/> REGISTRAR EN SISTEMA</>}
              </button>
            </form>
        </motion.div>
      </div>
    </div>
  );
}
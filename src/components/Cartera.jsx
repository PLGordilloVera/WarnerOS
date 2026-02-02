import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { 
  House, CaretRight, User, SpinnerGap, MapPin, 
  CurrencyDollar, Ruler, Waves, Star, Link as LinkIcon, CheckCircle,
  ToggleLeft, ToggleRight, FileText, IdentificationBadge
} from 'phosphor-react';
import { Toaster, toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

// --- 1. COMPONENTES EXTERNOS (ESTÁTICOS PARA EVITAR RE-RENDER) ---

const SectionCard = ({ title, icon, children, className = "" }) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl ${className}`}>
    <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

const Input = ({ label, name, value, onChange, type="text", placeholder, className="", ...props }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
    <input 
      type={type} 
      name={name} 
      placeholder={placeholder} 
      value={value} 
      onChange={onChange} 
      {...props}
      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all uppercase placeholder:normal-case placeholder:text-slate-600" 
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, className="", ...props }) => (
  <div className={className}>
    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
    <div className="relative">
      <select 
        name={name} 
        value={value} 
        onChange={onChange} 
        {...props}
        className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3.5 text-sm text-slate-200 appearance-none focus:border-amber-200/50 focus:outline-none cursor-pointer hover:bg-slate-900/80 transition-colors"
      >
        <option value="">SELECCIONAR...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <CaretRight className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none" size={14} />
    </div>
  </div>
);

const BooleanToggle = ({ label, isYes, onToggle }) => {
  return (
      <div className="flex flex-col h-full justify-end">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">{label}</label>
          <button 
              type="button"
              onClick={onToggle}
              className={`w-full flex items-center justify-between px-3 py-3.5 rounded-xl border transition-all duration-200 ${isYes ? 'bg-amber-500/10 border-amber-500/50 text-amber-200' : 'bg-slate-950/50 border-white/10 text-slate-500 hover:border-white/20'}`}
          >
              <span className="text-xs font-bold">{isYes ? 'SÍ' : 'NO'}</span>
              {isYes ? <ToggleRight size={22} weight="fill" /> : <ToggleLeft size={22} />}
          </button>
      </div>
  );
};

// --- 2. COMPONENTE PRINCIPAL ---

export default function Cartera() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    estado: 'CAPTADO', padron_catastral: '', tipo_inmueble: '',
    provincia: 'TUCUMÁN', ciudad: '', barrio: '', calle: '', numero: '',
    piso: '', unidad: '', cantidad_pisos: '', codigo_postal: '',
    operacion: 'COMPRA', moneda: 'DOLARES', precio_lista: '', precio_cierre: '',
    expensas: 'NO', valor_expensas: '', credito_hipotecario: 'NO', documentacion: 'ESCRITURA PERFECTA',
    m2_construidos: '', m2_terreno: '', antiguedad: '', ambientes: '',
    dormitorios: '', banos: '', cocheras: '', disposicion: 'FRENTE',
    balcon: 'NO', terraza: 'NO', patio_jardin: 'NO', espacio_verde: 'NO',
    piscina: 'NO', quincho: 'NO', asador: 'NO', amoblado: 'NO',
    apto_mascotas: 'NO', ascensor: 'NO', seguridad: 'NO', internet: 'NO',
    agua_corriente: 'SI', luz: 'SI', gas_natural: 'SI', cloacas: 'SI',
    humedad: '', pintura: '', pisos: '', revoques: '', fachada: '',
    fecha_captacion: new Date().toISOString().split('T')[0],
    nombre_propietario: '', celular_propietario: '', email_propietario: '', firmo_exclusividad: 'NO',
    link_fotos: '', link_videos: '', link_planos: '', link_documentacion: ''
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'text' || type === 'textarea' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleToggle = (name) => {
    setFormData(prev => ({
        ...prev,
        [name]: prev[name] === 'SI' ? 'NO' : 'SI'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.padron_catastral) return toast.warning("Falta Padrón Catastral");
    if (!formData.tipo_inmueble) return toast.warning("Selecciona Tipo Inmueble");
    if (!formData.calle) return toast.warning("Ingresa la Calle");

    setLoading(true);

    const payload = {
      action: 'addCartera',
      agente_captador: user?.name,
      ...formData
    };

    try {
      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      toast.success("¡Propiedad registrada exitosamente!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      console.error(err);
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
              <div className="inline-flex p-4 rounded-3xl bg-slate-900/50 border border-white/10 shadow-xl mb-4">
                  <House size={40} weight="duotone" className="text-amber-200" />
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase">
                Alta de Inmueble
              </h1>
              <p className="text-slate-500 text-sm font-medium tracking-wide">CARTERA DE PROPIEDADES</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            
              {/* SECCIÓN 1: GESTIÓN INTERNA */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <FileText size={16} /> Identificación
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Agente Read-Only */}
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 mb-1 block tracking-wider">Agente Captador</label>
                        <div className="relative flex items-center bg-slate-950/50 border border-amber-500/20 rounded-xl p-3.5 text-slate-200">
                            <User size={20} className="text-amber-200 mr-3" weight="fill" />
                            <span className="font-bold text-sm tracking-wide">{user?.name || "Usuario"}</span>
                        </div>
                    </div>

                    <Select label="Estado Gestión" name="estado" value={formData.estado} onChange={handleChange} options={['CAPTADO','VENDIDO','RESERVADO','ALQUILADO','CAIDA']} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Padrón Catastral" name="padron_catastral" type="number" value={formData.padron_catastral} onChange={handleChange} required />
                    <Select label="Tipo Inmueble" name="tipo_inmueble" value={formData.tipo_inmueble} onChange={handleChange} options={['CASA','DEPARTAMENTO','TERRENO','DUPLEX','LOCAL','GALPON','OFICINA']} required />
                </div>
              </div>

              {/* SECCIÓN 2: UBICACIÓN */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <MapPin size={16} /> Ubicación
                </h3>
                <div className="space-y-5">
                    <Input label="Calle" name="calle" value={formData.calle} onChange={handleChange} required />
                    <div className="grid grid-cols-2 gap-5">
                        <Input label="Altura (Número)" name="numero" type="number" value={formData.numero} onChange={handleChange} />
                        <Input label="Código Postal" name="codigo_postal" type="number" value={formData.codigo_postal} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <Input label="Piso" name="piso" placeholder="PB.." value={formData.piso} onChange={handleChange} />
                        <Input label="Unidad / Depto" name="unidad" placeholder="A.." value={formData.unidad} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Input label="Barrio" name="barrio" value={formData.barrio} onChange={handleChange} />
                        <Input label="Ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                        <Input label="Provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
                    </div>
                </div>
              </div>

              {/* SECCIÓN 3: VALORES */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <CurrencyDollar size={16} /> Operación y Valores
                </h3>
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <Select label="Operación" name="operacion" value={formData.operacion} onChange={handleChange} options={['VENTA','ALQUILER']} />
                    <Select label="Moneda" name="moneda" value={formData.moneda} onChange={handleChange} options={['DOLARES','PESOS']} />
                </div>
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <Input label="Precio Lista" name="precio_lista" type="number" placeholder="0.00" value={formData.precio_lista} onChange={handleChange} />
                    <Input label="Precio Cierre" name="precio_cierre" type="number" placeholder="-" value={formData.precio_cierre} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-5 items-end">
                    <BooleanToggle label="¿Tiene Expensas?" isYes={formData.expensas === 'SI'} onToggle={() => handleToggle('expensas')} />
                    {formData.expensas === 'SI' ? (
                        <Input label="Monto Expensas" name="valor_expensas" type="number" value={formData.valor_expensas} onChange={handleChange} />
                    ) : (
                        <div className="h-12 bg-slate-950/20 rounded-xl border border-white/5 flex items-center justify-center text-slate-600 text-xs">Sin Monto</div>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-5 mt-5">
                    <BooleanToggle label="Apto Crédito" isYes={formData.credito_hipotecario === 'SI'} onToggle={() => handleToggle('credito_hipotecario')} />
                    <Select label="Documentación" name="documentacion" value={formData.documentacion} onChange={handleChange} options={['ESCRITURA PERFECTA','BOLETO C/V','SUCESION']} />
                </div>
              </div>

              {/* SECCIÓN 4: CARACTERÍSTICAS */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <Ruler size={16} /> Superficies y Distribución
                </h3>
                <div className="grid grid-cols-2 gap-5 mb-5">
                    <Input label="M² Cubiertos" name="m2_construidos" type="number" value={formData.m2_construidos} onChange={handleChange} />
                    <Input label="M² Terreno" name="m2_terreno" type="number" value={formData.m2_terreno} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
                    <Input label="Antigüedad" name="antiguedad" type="number" value={formData.antiguedad} onChange={handleChange} />
                    <Input label="Ambientes" name="ambientes" type="number" value={formData.ambientes} onChange={handleChange} />
                    <Input label="Dormitorios" name="dormitorios" type="number" value={formData.dormitorios} onChange={handleChange} />
                    <Input label="Baños" name="banos" type="number" value={formData.banos} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <Input label="Cocheras" name="cocheras" type="number" value={formData.cocheras} onChange={handleChange} />
                    <Select label="Disposición" name="disposicion" value={formData.disposicion} onChange={handleChange} options={['FRENTE','CONTRAFRENTE','LATERAL','INTERNO']} />
                </div>
              </div>

              {/* SECCIÓN 5: AMENITIES */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <Waves size={16} /> Servicios y Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <BooleanToggle label="Gas Natural" isYes={formData.gas_natural === 'SI'} onToggle={() => handleToggle('gas_natural')} />
                     <BooleanToggle label="Agua C." isYes={formData.agua_corriente === 'SI'} onToggle={() => handleToggle('agua_corriente')} />
                     <BooleanToggle label="Luz" isYes={formData.luz === 'SI'} onToggle={() => handleToggle('luz')} />
                     <BooleanToggle label="Cloacas" isYes={formData.cloacas === 'SI'} onToggle={() => handleToggle('cloacas')} />
                     
                     <BooleanToggle label="Balcón" isYes={formData.balcon === 'SI'} onToggle={() => handleToggle('balcon')} />
                     <BooleanToggle label="Terraza" isYes={formData.terraza === 'SI'} onToggle={() => handleToggle('terraza')} />
                     <BooleanToggle label="Patio" isYes={formData.patio_jardin === 'SI'} onToggle={() => handleToggle('patio_jardin')} />
                     <BooleanToggle label="Piscina" isYes={formData.piscina === 'SI'} onToggle={() => handleToggle('piscina')} />
                     
                     <BooleanToggle label="Quincho" isYes={formData.quincho === 'SI'} onToggle={() => handleToggle('quincho')} />
                     <BooleanToggle label="Asador" isYes={formData.asador === 'SI'} onToggle={() => handleToggle('asador')} />
                     <BooleanToggle label="Seguridad" isYes={formData.seguridad === 'SI'} onToggle={() => handleToggle('seguridad')} />
                     <BooleanToggle label="Internet" isYes={formData.internet === 'SI'} onToggle={() => handleToggle('internet')} />
                </div>
              </div>

              {/* SECCIÓN 6: ESTADO */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                 <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Star size={16} /> Estado (1-10)
                 </h3>
                 <div className="grid grid-cols-5 gap-2">
                    {['humedad', 'pintura', 'pisos', 'revoques', 'fachada'].map(field => (
                        <div key={field} className="bg-slate-950/30 p-2 rounded-xl border border-white/5 text-center">
                            <label className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase block mb-1 truncate">{field}</label>
                            <input 
                                type="number" 
                                name={field} 
                                min="1" max="10" 
                                value={formData[field]} 
                                onChange={handleChange} 
                                className="w-full bg-transparent text-center text-white font-bold focus:outline-none" 
                                placeholder="-" 
                            />
                        </div>
                    ))}
                 </div>
              </div>

              {/* SECCIÓN 7: PROPIETARIO */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-600"></div>
                 <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <User size={16} className="text-amber-500"/> Datos Propietario (Privado)
                 </h3>
                 <div className="space-y-5">
                    <Input label="Nombre Completo" name="nombre_propietario" value={formData.nombre_propietario} onChange={handleChange} />
                    <div className="grid grid-cols-2 gap-5">
                        <Input label="Celular" name="celular_propietario" type="tel" value={formData.celular_propietario} onChange={handleChange} />
                        <Input label="Email" name="email_propietario" type="email" style={{textTransform: 'none'}} value={formData.email_propietario} onChange={handleChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-5 items-end">
                        <Input label="Fecha Captación" name="fecha_captacion" type="date" value={formData.fecha_captacion} onChange={handleChange} />
                        <BooleanToggle label="¿Exclusividad?" isYes={formData.firmo_exclusividad === 'SI'} onToggle={() => handleToggle('firmo_exclusividad')} />
                    </div>
                 </div>
              </div>

              {/* SECCIÓN 8: MULTIMEDIA */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                <h3 className="text-xs font-bold text-amber-200/80 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                  <LinkIcon size={16} /> Multimedia (Links)
                </h3>
                <div className="space-y-5">
                    <Input label="Link Google Photos" name="link_fotos" type="url" style={{textTransform:'none'}} placeholder="https://..." value={formData.link_fotos} onChange={handleChange} />
                    <Input label="Link Video Youtube" name="link_videos" type="url" style={{textTransform:'none'}} value={formData.link_videos} onChange={handleChange} />
                    <Input label="Link Documentación (Drive)" name="link_documentacion" type="url" style={{textTransform:'none'}} value={formData.link_documentacion} onChange={handleChange} />
                </div>
              </div>

              {/* Botón Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-amber-200 to-amber-500 text-slate-900 font-black py-6 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.3)] hover:shadow-[0_0_60px_rgba(251,191,36,0.5)] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 text-base uppercase tracking-widest hover:brightness-110">
                {loading ? <SpinnerGap size={24} className="animate-spin" /> : <> <CheckCircle size={24} weight="fill"/> CONFIRMAR ALTA </>}
              </button>

            </form>
        </motion.div>
      </div>
    </div>
  );
}
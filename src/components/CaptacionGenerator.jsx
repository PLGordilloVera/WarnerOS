import React, { useState } from 'react';
import { FileText, Printer, Plus, Trash, UserPlus } from 'phosphor-react';

/**
 * Función helper para convertir números a letras (Español)
 * Soporta hasta millones para precios de inmuebles.
 */
function numeroALetras(num) {
  const n = Math.floor(num);
  if (n === 0) return 'cero';

  const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas2 = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  const leerSeccion = (n) => {
    let res = '';
    if (n >= 100) {
      if (n === 100) return 'cien';
      res += centenas[Math.floor(n / 100)] + ' ';
      n %= 100;
    }
    if (n >= 10) {
      if (n >= 10 && n <= 19) {
        res += decenas[n - 10];
        return res.trim();
      } else if (n >= 20 && n <= 29) {
        res += (n === 20 ? 'veinte' : 'veinti' + unidades[n - 20]);
        return res.trim();
      } else {
        res += decenas2[Math.floor(n / 10)];
        n %= 10;
        if (n > 0) res += ' y ';
      }
    }
    res += unidades[n];
    return res.trim();
  };

  let final = '';
  let millones = Math.floor(n / 1000000);
  let miles = Math.floor((n % 1000000) / 1000);
  let resto = n % 1000;

  if (millones > 0) {
    if (millones === 1) final += 'un millón ';
    else final += leerSeccion(millones) + ' millones ';
  }
  if (miles > 0) {
    if (miles === 1) final += 'mil ';
    else final += leerSeccion(miles) + ' mil ';
  }
  if (resto > 0) {
    final += leerSeccion(resto);
  }

  return final.trim();
}

export default function CaptacionGenerator() {
  const [propietarios, setPropietarios] = useState([
    { nombre: '', dni: '', domicilio: '' }
  ]);

  const [formData, setFormData] = useState({
    direccionInmueble: '',
    padron: '',
    precio: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const handleOwnerChange = (index, field, value) => {
    const newOwners = [...propietarios];
    newOwners[index][field] = value;
    setPropietarios(newOwners);
  };

  const addOwner = () => {
    setPropietarios([...propietarios, { nombre: '', dni: '', domicilio: '' }]);
  };

  const removeOwner = (index) => {
    if (propietarios.length > 1) {
      setPropietarios(propietarios.filter((_, i) => i !== index));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'precio') {
      // Formateo automático de miles
      const cleanValue = value.replace(/\D/g, '');
      const formatted = cleanValue ? Number(cleanValue).toLocaleString('es-AR') : '';
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePrint = () => {
    const dateObj = new Date(formData.fecha + 'T00:00:00'); 
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dia = dateObj.getDate();
    const mes = meses[dateObj.getMonth()];
    const anio = dateObj.getFullYear();

    const multi = propietarios.length > 1;
    const suscritos = multi ? "Los que suscriben" : "El que suscribe";
    const propLabel = multi ? "los PROPIETARIOS" : "el PROPIETARIO";

    // Unir datos de propietarios gramaticalmente
    const listOwnersHtml = propietarios.map((p, i) => {
      const isLast = i === propietarios.length - 1;
      const isSecondToLast = i === propietarios.length - 2;
      let sep = ', ';
      if (isLast) sep = '';
      if (isSecondToLast) sep = ' y ';
      
      return `Sr/a. <span class="var-text">${p.nombre || '__________'}</span>, D.N.I. N.º <span class="var-text">${p.dni || '________'}</span>, con domicilio en <span class="var-text">${p.domicilio || '__________'}</span>${sep}`;
    }).join('');

    const signatureBlocksHtml = propietarios.map(p => `
      <div class="signature-block">
        <div class="sig-line"></div>
        <p class="sig-text">Firma del propietario(a):</p>
        <p class="sig-text">Nombre: <span class="var-text">${p.nombre}</span></p>
        <p class="sig-text">D.N.I.: <span class="var-text">${p.dni}</span></p>
      </div>
    `).join('');

    const precioNum = Number(formData.precio.replace(/\./g, ''));
    const precioEnLetras = precioNum ? numeroALetras(precioNum) : '____________________';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes para generar el documento.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Exclusividad de Venta - ${propietarios[0].nombre || 'Propietario'}</title>
          <style>
            @page { margin: 2.5cm 3cm; size: A4 portrait; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 10.5pt; 
              line-height: 1.5; 
              color: black; 
              text-align: justify;
              margin: 0;
              padding: 0;
            }
            h1 { 
              text-align: center; 
              font-size: 12pt; 
              font-weight: bold; 
              margin-bottom: 20px; 
              text-decoration: underline;
              text-transform: uppercase;
            }
            h2 {
              font-size: 11pt;
              font-weight: bold;
              margin-top: 25px;
              margin-bottom: 15px;
              text-decoration: underline;
            }
            .date-right { 
              text-align: right; 
              margin-bottom: 25px; 
            }
            p { 
              margin-bottom: 10px; 
            }
            .var-text {
              font-weight: bold;
            }
            .signature-section { 
              margin-top: 50px; 
              display: flex;
              flex-wrap: wrap;
              gap: 40px;
              width: 100%; 
            }
            .signature-block { 
              flex: 1;
              min-width: 200px;
              text-align: left; 
            }
            .sig-line { 
              width: 100%; 
              max-width: 220px;
              border-top: 1px solid black; 
              margin-bottom: 8px; 
            }
            .sig-text { 
              font-size: 9pt; 
              margin: 2px 0; 
            }
            ul { margin-top: 8px; margin-bottom: 15px; padding-left: 20px; }
            li { margin-bottom: 8px; }
            .anexo-box {
              border-top: 2px solid black;
              margin-top: 40px;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <h1>EXCLUSIVIDAD DE VENTA Y COMPROMISO DE PAGO</h1>
          
          <p class="date-right">
            San Miguel de Tucumán, <span class="var-text">${dia}</span> de <span class="var-text">${mes}</span> de <span class="var-text">${anio}</span>.-
          </p>

          <p>
            ${suscritos} ${listOwnersHtml}, en adelante ${propLabel}, 
            por el presente acto AUTORIZAN a Warner desarrollo e inversiones S.A.S CUIT 30-71917401-5, con domicilio en calle Gral Paz 571, 
            piso 7, oficina 1, San Miguel de Tucumán, Tucumán, representada en este acto por el Sr. Joaquín Luciano Apud, D.N.I. N.º 
            37.423.740, para que en su nombre y representación gestione la venta, a quien en definitiva acepte y convenga con las 
            condiciones de venta insertas en el presente, del inmueble de su propiedad ubicado en <span class="var-text">${formData.direccionInmueble || '______________________'}</span>
            , identificado con IDENTIFICACIÓN CATASTRAL: Padrón N° <span class="var-text">${formData.padron || '___________________'}</span>.
          </p>
          
          <p>
            Precio de venta: <span class="var-text" style="text-transform: uppercase;">${precioEnLetras}</span> DOLARES ESTADOUNIDENSES (U$S <span class="var-text">${formData.precio || '____________'}</span>.-)
          </p>

          <p>
            Una vez efectuada la venta, ${propLabel} se comprometen a dar la posesión del 
            inmueble libre de todo gravamen que no figure expresamente en este documento y sobre la base de títulos perfectos, con todos 
            los impuestos, tasas y servicios al día a la fecha de la escrituración.
          </p>

          <p>
            Dicha EXCLUSIVIDAD tiene vigencia por el término de NOVENTA (90) días corridos, a contar desde la fecha de la presente con 
            su respectiva suscripción. Queda establecido que para la gestión de venta, Warner desarrollo e inversiones S.A.S se encuentra 
            autorizado a realizar todos los actos y gestiones necesarios para el desempeño de su mandato, pudiendo efectuar por su cuenta 
            los gastos de publicidad que crea convenientes, tales como carteles, avisos gráficos, radiales o televisivos, publicaciones 
            en portales y redes sociales, afiches en vidrieras y salón, confección de folletos, remisión por correo o medios digitales a 
            listas de interesados, promoción general en internet y/o gastos o comisiones a terceros, entendiéndose que si no se vende el 
            inmueble, el mandante no abonará suma alguna por dichos conceptos.
          </p>

          <p>
            Igualmente se conviene que, si Warner desarrollo e inversiones S.A.S concretara con un tercero interesado la operación de 
            venta del inmueble, ${propLabel} se obligan a abonar en favor del mandatario honorarios 
            del 3% (tres por ciento) sobre el valor total del precio de venta, pagaderos al momento de la firma del correspondiente boleto 
            de compraventa o de la escritura traslativa de dominio, lo que ocurra primero.
          </p>

          <p>
            En caso de que Warner desarrollo e inversiones S.A.S concretase la operación de venta en los términos referidos en la presente, 
            acercando un comprador que acepte las condiciones aquí establecidas, y ${propLabel} 
            decidieran finalmente no realizar la venta, éstos se obligan a abonar los honorarios correspondientes del comprador y del vendedor, 
            equivalentes al 6% (seis por ciento) sobre el valor de venta pactado en este documento.
          </p>

          <p>
            Se considera que la gestión de Warner desarrollo e inversiones S.A.S concluye exitosamente con la aceptación expresa por parte 
            de un comprador de las condiciones insertas en el presente, manifestada instrumentalmente mediante recibo de reserva, carta 
            de intención de compra o documento equivalente.
          </p>

          <p>
            En prueba de conformidad, se firman dos ejemplares de un mismo tenor y a un solo efecto.
          </p>

          <div class="anexo-box">
            <h1>Anexo I: Protocolo de Preparación Estética (Home Staging)</h1>
            <p>
              Para lograr vender la propiedad en el menor tiempo posible y defender el máximo valor de mercado, es fundamental que los potenciales 
              compradores puedan imaginarse viviendo allí desde el primer segundo de la visita. El Home Staging es una técnica de marketing 
              inmobiliario que nos ayuda a presentar el inmueble en su mejor versión, acelerando el proceso de venta y mejorando el valor percibido.
            </p>
            <p>
              <strong>${multi ? 'LOS PROPIETARIOS SE COMPROMETEN' : 'EL PROPIETARIO SE COMPROMETE'} A COLABORAR EN LA IMPLEMENTACIÓN DE LOS SIGUIENTES PUNTOS ANTES DE LA SESIÓN DE FOTOS PROFESIONAL Y PREVIO A CADA VISITA:</strong>
            </p>
            <ul>
              <li><strong>Despersonalización:</strong> Crear un ambiente neutral retirando fotografías familiares y objetos personales muy llamativos.</li>
              <li><strong>Despeje y Minimalismo:</strong> Reducir mobiliario que bloquee el paso y despejar superficies visibles.</li>
              <li><strong>Limpieza y Control de Olores:</strong> La propiedad debe estar impecable y bien ventilada (especialmente baños y cocina).</li>
              <li><strong>Iluminación:</strong> Abrir persianas para luz natural y asegurar el funcionamiento de todas las luminarias (preferencia luz cálida).</li>
              <li><strong>Mantenimiento Visual:</strong> Reparar pequeños detalles como canillas que gotean o revoques saltados.</li>
            </ul>
          </div>

          <div class="signature-section">
            ${signatureBlocksHtml}
            <div class="signature-block">
              <div class="sig-line"></div>
              <p class="sig-text">Firma del mandatario:</p>
              <p class="sig-text">Nombre: Joaquín Luciano Apud</p>
              <p class="sig-text">D.N.I. N.º 37.423.740</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
            <FileText size={24} weight="fill" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Generador de Documentos</h3>
            <p className="text-xs text-slate-400">Exclusividad de Venta e Integración de Protocolo Estético</p>
          </div>
        </div>

        {/* PROPIETARIOS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-amber-200 uppercase tracking-widest">Datos de Propietarios</h4>
            <button 
              onClick={addOwner}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 rounded-lg text-[10px] font-bold transition-all border border-amber-400/20"
            >
              <UserPlus size={14} weight="bold" /> AGREGAR PROPIETARIO
            </button>
          </div>

          {propietarios.map((p, index) => (
            <div key={index} className="p-4 bg-slate-950/40 border border-white/5 rounded-2xl space-y-4 relative group">
              {propietarios.length > 1 && (
                <button 
                  onClick={() => removeOwner(index)}
                  className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  title="Eliminar Propietario"
                >
                  <Trash size={16} />
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={p.nombre} 
                    onChange={(e) => handleOwnerChange(index, 'nombre', e.target.value)} 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-black uppercase ml-1">DNI</label>
                  <input 
                    type="text" 
                    value={p.dni} 
                    onChange={(e) => handleOwnerChange(index, 'dni', e.target.value)} 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Domicilio Particular</label>
                  <input 
                    type="text" 
                    value={p.domicilio} 
                    onChange={(e) => handleOwnerChange(index, 'domicilio', e.target.value)} 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* INMUEBLE Y PRECIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Dirección del Inmueble a Vender</label>
            <input type="text" name="direccionInmueble" value={formData.direccionInmueble} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Padrón Catastral</label>
            <input type="text" name="padron" value={formData.padron} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Precio de Venta (U$S)</label>
            <input 
              type="text" 
              name="precio" 
              value={formData.precio} 
              onChange={handleChange} 
              placeholder="Ej: 150.000" 
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 font-bold focus:border-amber-200/50 focus:outline-none transition-all" 
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-slate-500 font-black uppercase ml-1">Fecha del Documento</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-amber-400/10 active:scale-[0.99] mt-4"
        >
          <Printer size={20} weight="bold" /> Generar Contrato Integrado
        </button>
      </div>
    </div>
  );
}

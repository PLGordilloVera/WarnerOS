import React, { useState } from 'react';
import { FileText, Printer } from 'phosphor-react';

export default function CaptacionGenerator() {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    domicilio: '',
    direccionInmueble: '',
    padron: '',
    precio: '',
    precioLetras: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    // Helper to convert date to dia, mes, anio
    const dateObj = new Date(formData.fecha + 'T00:00:00'); 
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dia = dateObj.getDate();
    const mes = meses[dateObj.getMonth()];
    const anio = dateObj.getFullYear();

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes (pop-ups) para generar el documento.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Exclusividad de Venta - ${formData.nombre || 'Propietario'}</title>
          <style>
            @page { margin: 2.5cm 3cm; size: A4 portrait; }
            body { 
              font-family: Arial, sans-serif; 
              font-size: 11pt; 
              line-height: 1.6; 
              color: black; 
              text-align: justify;
              margin: 0;
              padding: 0;
            }
            h1 { 
              text-align: center; 
              font-size: 12pt; 
              font-weight: bold; 
              margin-bottom: 30px; 
              text-decoration: underline;
            }
            .date-right { 
              text-align: right; 
              margin-bottom: 30px; 
            }
            p { 
              margin-bottom: 12px; 
              text-indent: 0; 
            }
            .var-text {
              font-weight: bold;
            }
            .page-break { page-break-before: always; }
            .signature-section { 
              margin-top: 80px; 
              display: table; 
              width: 100%; 
            }
            .signature-block { 
              display: table-cell; 
              width: 50%; 
              text-align: left; 
              vertical-align: top; 
            }
            .sig-line { 
              width: 250px; 
              border-top: 1px solid black; 
              margin-bottom: 10px; 
            }
            .sig-text { 
              font-size: 11pt; 
              margin: 3px 0; 
            }
            ul { margin-top: 10px; margin-bottom: 20px; padding-left: 20px; }
            li { margin-bottom: 15px; }
          </style>
        </head>
        <body>
          <!-- PÁGINA 1: EXCLUSIVIDAD -->
          <h1>EXCLUSIVIDAD DE VENTA Y COMPROMISO DE PAGO</h1>
          
          <p class="date-right">
            San Miguel de Tucumán, <span class="var-text">${dia || '___'}</span> de <span class="var-text">${mes || '_________________'}</span> de <span class="var-text">${anio || '202__'}</span>.-
          </p>

          <p>
            El que suscribe Sr/a. <span class="var-text">${formData.nombre || '__________________________________'}</span>, D.N.I. N.º <span class="var-text">${formData.dni || '_____________'}</span>, 
            con domicilio en <span class="var-text">${formData.domicilio || '__________________________________________________'}</span>, provincia de Tucumán, 
            por el presente acto AUTORIZA a Warner desarrollo e inversiones S.A.S CUIT 30-71917401-5, con domicilio en calle Gral Paz 571, 
            piso 7, oficina 1, San Miguel de Tucumán, Tucumán, representada en este acto por el Sr. Joaquín Luciano Apud, D.N.I. N.º 
            37.423.740, para que en su nombre y representación gestione la venta, a quien en definitiva acepte y convenga con las 
            condiciones de venta insertas en el presente, del inmueble de su propiedad ubicado en <span class="var-text">${formData.direccionInmueble || '______________________'}</span>, 
            provincia de Tucumán, identificado con IDENTIFICACIÓN CATASTRAL: Padrón N° <span class="var-text">${formData.padron || '___________________'}</span>.
          </p>
          
          <p>
            Precio de venta: <span class="var-text">${formData.precioLetras ? formData.precioLetras : '_________________________________'}</span> (U$S <span class="var-text">${formData.precio || '____________'}</span>.-)
          </p>

          <p>
            Una vez efectuada la venta, el/la Sr/a. <span class="var-text">${formData.nombre || '_________________'}</span> se compromete a dar la posesión del 
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
            venta del inmueble, el/la Sr/a <span class="var-text">${formData.nombre || '________________'}</span> se obliga a abonar en favor del mandatario honorarios 
            del 3% (tres por ciento) sobre el valor total del precio de venta, pagaderos al momento de la firma del correspondiente boleto 
            de compraventa o de la escritura traslativa de dominio, lo que ocurra primero.
          </p>

          <p>
            En caso de que Warner desarrollo e inversiones S.A.S concretase la operación de venta en los términos referidos en la presente, 
            acercando un comprador que acepte las condiciones aquí establecidas, y el/la Sr/a <span class="var-text">${formData.nombre || '__________________'}</span> 
            decidiera finalmente no realizar la venta, éste se obliga a abonar los honorarios correspondientes del comprador y del vendedor, 
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

          <div class="signature-section">
            <div class="signature-block">
              <div class="sig-line"></div>
              <p class="sig-text">Firma del propietario(a):</p>
              <p class="sig-text">Nombre y apellido: <span class="var-text">${formData.nombre}</span></p>
              <p class="sig-text">D.N.I.: <span class="var-text">${formData.dni}</span></p>
            </div>
            <div class="signature-block">
              <div class="sig-line"></div>
              <p class="sig-text">Firma del mandatario:</p>
              <p class="sig-text">Nombre y apellido: Joaquín Luciano Apud</p>
              <p class="sig-text">D.N.I. N.º 37.423.740</p>
            </div>
          </div>

          <!-- PÁGINA 2: HOME STAGING -->
          <div class="page-break"></div>
          
          <h1>Guía Estratégica de Home Staging</h1>
          
          <p><strong>Estimado Propietario:</strong></p>
          
          <p>
            Para lograr vender su propiedad en el menor tiempo posible y defender el máximo valor de mercado, es fundamental que los potenciales 
            compradores puedan imaginarse viviendo allí desde el primer segundo de la visita. El Home Staging es una técnica de marketing 
            inmobiliario que nos ayuda a presentar su inmueble en su mejor versión, acelerando el proceso de venta y mejorando el valor percibido.
          </p>
          
          <p>
            Le solicitamos su colaboración para implementar los siguientes puntos antes de nuestra sesión de fotos profesional y previo a cada 
            visita de compradores:
          </p>

          <ul>
            <li>
              <strong>Despersonalización del espacio:</strong> El objetivo es crear un ambiente neutral. Le pedimos guardar temporalmente fotografías 
              familiares, colecciones personales muy llamativas, recuerdos de viajes y elementos con connotaciones políticas o religiosas. 
              El comprador necesita un "lienzo en blanco" para proyectar su propia vida en la casa.
            </li>
            <li>
              <strong>Despeje y Minimalismo:</strong> Un espacio despejado se percibe visualmente mucho más grande. Es recomendable reducir el mobiliario 
              que bloquea el paso y guardar al menos el 50% de los elementos visibles en estanterías, mesadas de cocina y armarios.
            </li>
            <li>
              <strong>Limpieza profunda y control de olores:</strong> La propiedad debe estar impecable. Preste especial atención a los baños 
              (juntas y griferías) y a la cocina. Es vital ventilar bien la propiedad y neutralizar olores fuertes a mascotas, humedad o encierro 
              antes de cada visita.
            </li>
            <li>
              <strong>Iluminación estratégica:</strong> Antes de recibir una visita o al fotógrafo, abra todas las persianas y cortinas para dejar 
              entrar la luz natural. Asegúrese de que todas las lámparas funcionen; recomendamos utilizar luces cálidas y evitar los ambientes pintados 
              completamente de gris, ya que actualmente se perciben fríos y anticuados.
            </li>
            <li>
              <strong>Mantenimiento visual:</strong> Los pequeños detalles importan. Arregle canillas que goteen, aceite las puertas que hacen ruido, 
              reemplace vidrios rotos y repare revoques saltados. El comprador suele exagerar mentalmente el costo de estas pequeñas reparaciones y 
              usarlo para pedir rebajas en el precio.
            </li>
            <li>
              <strong>Espacios multifuncionales:</strong> Hoy en día, los compradores valoran mucho la versatilidad. Si tiene una habitación vacía o de 
              "trastos", es ideal acomodarla para que parezca una cómoda oficina para trabajo remoto o un área de lectura.
            </li>
          </ul>

          <p style="font-style: italic;">
            Trabajando en equipo y cuidando estos detalles, lograremos que su propiedad se destaque del resto de las opciones en San Miguel de Tucumán.
          </p>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Esperamos un momento a que el navegador procese el html antes de llamar a print()
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* FORM SECTION */}
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
            <FileText size={24} weight="fill" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-wide">Generador de Documentos</h3>
            <p className="text-xs text-slate-400">Exclusividad de Venta y Guía de Home Staging</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">Nombre del Propietario</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">DNI del Propietario</label>
            <input type="text" name="dni" value={formData.dni} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">Domicilio del Propietario</label>
            <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">Dirección del Inmueble a vender</label>
            <input type="text" name="direccionInmueble" value={formData.direccionInmueble} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">Padrón (Identificación Catastral)</label>
            <input type="text" name="padron" value={formData.padron} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">Precio de Venta (en números)</label>
            <input type="text" name="precio" value={formData.precio} onChange={handleChange} placeholder="Ej: 150.000" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">Precio de Venta (en letras)</label>
            <input type="text" name="precioLetras" value={formData.precioLetras} onChange={handleChange} placeholder="Ej: ciento cincuenta mil" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-bold uppercase ml-1">Fecha</label>
            <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:border-amber-200/50 focus:outline-none transition-all" />
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold py-3 rounded-xl transition-colors mt-4"
        >
          <Printer size={20} weight="bold" /> Generar Documento PDF
        </button>
      </div>
    </div>
  );
}

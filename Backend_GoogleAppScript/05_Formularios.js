/**
 * 05_Formularios.js
 * * Módulo de Operaciones de Escritura (CRUD).
 * Maneja la recepción de datos de los formularios del frontend y su persistencia en Google Sheets.
 * Incluye lógica de bloqueo (concurrency locking) para evitar conflictos en reservas.
 */

// --- CALIDAD Y VALUACIONES ---

function handleAddResena(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.RESENAS);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_RESENAS);
    // Timestamp automático del servidor
    sheet.appendRow([new Date(), data.link, data.agente, data.mencion]);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

function handleAddValuacion(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.VALUACION);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_VALUACION);
    // Mapeo dinámico: Hace coincidir las keys del JSON con los Headers de la Sheet
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const map = { 
        agente: "AGENTE INMOBILIARIO", 
        nombre_propietario: "NOMBRE_PROPIETARIO", 
        celular: "CELULAR_PROPIETARIO", 
        email: "EMAIL_PROPIETARIO", 
        provincia: "PROVINCIA", 
        ciudad: "CIUDAD", 
        calle: "CALLE", 
        numero: "NUMERO", 
        barrio: "BARRIO", 
        padron_catastral: "PADRON_CATASTRAL", 
        tipo_inmueble: "TIPO_DE_INMUEBLE", 
        estado_inmueble: "ESTADO_INMUEBLE", 
        ambientes: "AMBIENTES", 
        banos: "BAÑOS", 
        m2_construidos: "M2_CONSTRUIDOS/PROPIOS", 
        m2_terreno: "M2_TERRENO/TOTALES", 
        precio_expectativa: "QUE PRECIO CONSIDERA QUE VALE SU INMUEBLE?" 
    };

    let fila = new Array(headers.length).fill("");
    headers.forEach((h, i) => {
      if (h === "Marca temporal") { fila[i] = new Date(); return; }
      const key = Object.keys(map).find(k => map[k] === h);
      if (key && data[key] !== undefined) fila[i] = data[key];
    });

    sheet.appendRow(fila);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

// --- GESTIÓN DE STOCK Y RESERVAS ---

/**
 * Registra una reserva y bloquea la propiedad en tiempo real.
 * Utiliza LockService para prevenir condiciones de carrera (Race Conditions).
 */
function handleAddReserva(data) {
  const lock = LockService.getScriptLock();
  // Espera hasta 10 segundos para obtener el bloqueo exclusivo
  lock.tryLock(10000);
  
  try {
    // 1. Registrar el movimiento económico en la hoja de Reservas
    const ssReservas = SpreadsheetApp.openById(CONFIG.IDS.RESERVAS);
    ssReservas.getSheetByName(CONFIG.SHEETS.TAB_RESERVAS).appendRow([
        new Date(), data.padron, data.direccion, data.agente, data.valor, data.moneda, data.operacion
    ]);

    // 2. Actualizar el estado del inmueble en la Cartera Maestra
    const ssCartera = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheetCartera = ssCartera.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    const dataCartera = sheetCartera.getDataRange().getValues();
    
    // Búsqueda dinámica de índices
    const idxPadron = dataCartera[0].indexOf('PADRON_CATASTRAL');
    const idxEstado = dataCartera[0].indexOf('ESTADO');
    
    for (let i = 1; i < dataCartera.length; i++) {
      // Comparación laxa de strings para evitar errores de espacios
      if (String(dataCartera[i][idxPadron]).trim() === String(data.padron).trim()) {
        sheetCartera.getRange(i + 1, idxEstado + 1).setValue('RESERVADO');
        break;
      }
    }
    return jsonResponse({ status: 'success' });
  } catch (e) { 
    return jsonResponse({ status: 'error' }); 
  } finally { 
    // Siempre liberar el bloqueo, incluso si hubo error
    lock.releaseLock(); 
  }
}

function handleAddCartera(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    let fila = new Array(headers.length).fill("");
    headers.forEach((h, i) => {
      if (h === "Marca temporal") { fila[i] = new Date(); return; }
      // Mapeo directo: El frontend envía keys que coinciden con los headers del Excel
      if (data[h] !== undefined) fila[i] = data[h];
    });
    
    sheet.appendRow(fila);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error' }); }
}

// --- CARTELERÍA Y VISITAS ---

function handleAddCartel(data) {
  try {
    // Sube la foto a Drive solo si existe
    const fotoUrl = data.foto_cartel 
        ? uploadToDrive(data.foto_cartel.data, data.foto_cartel.mimeType, data.foto_cartel.fileName, CONFIG.IDS.CARTELES_FOTO_FOLDER) 
        : "";
        
    SpreadsheetApp.openById(CONFIG.IDS.CARTELES)
        .getSheetByName(CONFIG.SHEETS.CARTELES)
        .appendRow([new Date(), data.padron_catastral, data.agente, fotoUrl]);
        
    // Dispara actualización en cascada para marcar la propiedad con "CARTEL: SI"
    updateCarteraCartel(data.padron_catastral);
    return jsonResponse({ status: 'success' });
    } catch (e) { return jsonResponse({ status: 'error' }); }
}


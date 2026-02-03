/**
 * 07_Utils.js
 * * Biblioteca de Utilidades Generales y Métricas.
 * Contiene funciones auxiliares para manejo de fechas, normalización de textos,
 * respuestas HTTP estandarizadas y la lógica compleja de cálculo de métricas (Evolution).
 */

// Diccionario de equivalencias: "Nombre Corto (Métricas)": "Nombre Legal (RRHH)"
const MAPEO_IDENTIDADES = {
  "AGUSTIN REYNOSO": "AGUSTIN ISAIAS REYNOSO",
  "ALEXIA RIVAS": "ALEXIA RIVAS BORQUE",
  "ALONSO CASTAÑO": "ALONSO CASTAÑO SEPULVEDA",
  "ANGEL HERRERA": "ANGEL MARIANO HERRERA"
};

// ==========================================
// 1. HELPERS HTTP Y DATOS
// ==========================================

/**
 * Genera una respuesta JSON estándar para React.
 * Configura los headers MIME correctos.
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Parsea fechas de Google Sheets asegurando que sean objetos Date válidos.
 */
function parseDate(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Obtiene los datos de una hoja de forma segura.
 * Si no encuentra la hoja por nombre, intenta devolver la primera (fallback).
 */
function getSheetData(id, name) {
  try {
    const ss = SpreadsheetApp.openById(id);
    const sheet = name ? ss.getSheetByName(name) : ss.getSheets()[0];
    return sheet ? sheet.getDataRange().getValues() : [];
  } catch(e) { 
    console.error(`Error leyendo hoja ${name}: ${e.toString()}`);
    return []; 
  }
}

/**
 * Helper para obtener objeto Sheet (usado en actualizaciones).
 */
function getSheetSmart(ss, name) {
  const sheet = ss.getSheetByName(name);
  return sheet ? sheet : ss.getSheets()[0];
}

// ==========================================
// 2. MANEJO DE ARCHIVOS (DRIVE)
// ==========================================

/**
 * Sube un archivo Base64 a una carpeta específica de Google Drive.
 * Configura permisos públicos para que la imagen sea accesible desde la web.
 * * @param {string} data - String base64 (ej: "data:image/png;base64,iVBOR...")
 * @param {string} mimeType - Tipo MIME (ej: "image/png")
 * @param {string} fileName - Nombre del archivo
 * @param {string} folderId - ID de la carpeta destino
 * @returns {string} URL pública de visualización o descarga
 */
function uploadToDrive(data, mimeType, fileName, folderId) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    
    // Limpieza del encabezado base64 si viene incluido
    const base64Clean = data.includes("base64,") ? data.split("base64,")[1] : data;
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Clean), mimeType, fileName);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Retorna URL de descarga directa para usar en etiquetas <img>
    return "https://drive.google.com/uc?export=view&id=" + file.getId();
  } catch (e) {
    console.error("Error subiendo a Drive: " + e.toString());
    return "";
  }
}

// ==========================================
// 3. NORMALIZACIÓN DE NOMBRES
// ==========================================

/**
 * Normaliza nombres para cruzar datos entre sistemas.
 * Elimina tildes, espacios extra y aplica el diccionario de identidades.
 */
function normalizeName(name) {
  if (!name) return "";
  
  // 1. Limpieza estándar (Mayúsculas, sin tildes, sin espacios dobles)
  let clean = String(name)
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Mapeo inteligente para consistencia
  return MAPEO_IDENTIDADES[clean] || clean;
}

// ==========================================
// 4. MOTOR DE MÉTRICAS (EVOLUTION)
// ==========================================

/**
 * Función principal que recorre TODAS las bases de datos para calcular
 * el rendimiento histórico de cada agente.
 * Alimenta tanto al Dashboard como a la IA.
 */
function calculateEvolution() {
  const hoy = new Date();
  const minDate = new Date(hoy.getFullYear() - 1, 0, 1); // Analiza desde el año anterior
  const rawEvents = [];
  
  // Obtener lista de Agentes desde Auth (función definida en 03_Auth.js)
  const validAgents = getActiveAgentsFromSheet(); 
  const agentsSet = new Set(validAgents); 

  console.log("--- INICIO DE AUDITORIA DE MÉTRICAS ---");

  // Función interna para procesar cada planilla de forma genérica
  const procesarHoja = (idSpreadsheet, nombreHoja, nombreColumnaAgente, nombreAccion, filtroExtraFn) => {
    try {
      const ss = SpreadsheetApp.openById(idSpreadsheet);
      // Fallback a la primera hoja si el nombre no coincide exactamente
      let sheet = nombreHoja ? ss.getSheetByName(nombreHoja) : ss.getSheets()[0];
      if (!sheet) sheet = ss.getSheets()[0]; 
      if (!sheet) return;

      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) return;

      const headers = data[0].map(h => String(h).toUpperCase().trim());
      // Búsqueda dinámica de columnas
      const idxAgente = headers.findIndex(h => h === nombreColumnaAgente.toUpperCase() || h.includes("AGENTE"));
      const idxFecha = headers.findIndex(h => h.includes("MARCA TEMPORAL") || h.includes("FECHA"));

      if (idxAgente === -1 || idxFecha === -1) return;

      let contadorHoja = 0;
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        
        let nombreRaw = String(row[idxAgente] || "");
        let nombreOficial = normalizeName(nombreRaw);
        
        // Solo procesamos métricas de agentes activos oficiales
        if (!nombreOficial || !agentsSet.has(nombreOficial)) continue;

        let fecha = parseDate(row[idxFecha]);
        // Filtros de fecha y lógica específica (ej: solo captados)
        if (!fecha || fecha < minDate) continue;
        if (filtroExtraFn && !filtroExtraFn(row, headers)) continue;

        rawEvents.push({
          agente: nombreOficial,
          accion: nombreAccion,
          fecha: fecha.toISOString().split('T')[0],
          cantidad: 1
        });
        contadorHoja++;
      }
      console.log(`[${nombreAccion}] Procesados: ${contadorHoja}`);
    } catch (e) {
      console.error(`Error procesando ${nombreAccion}: ` + e.toString());
    }
  };

  // --- EJECUCIÓN DE PROCESOS BATCH ---
  // Se escanean todas las fuentes de datos configuradas
  procesarHoja(CONFIG.IDS.VENDEDORES, CONFIG.SHEETS.TAB_VENDEDORES, "AGENTE INMOBILIARIO", "CLIENTES VENDEDORES");
  procesarHoja(CONFIG.IDS.COMPRADORES, CONFIG.SHEETS.TAB_COMPRADORES, "AGENTE INMOBILIARIO", "CLIENTES");
  procesarHoja(CONFIG.IDS.CARTELES, CONFIG.SHEETS.CARTELES, "AGENTE INMOBILIARIO", "CARTELES");
  procesarHoja(CONFIG.IDS.REGISTRO_VISITAS, CONFIG.SHEETS.TAB_VISITAS, "AGENTE INMOBILIARIO", "VISITAS");
  procesarHoja(CONFIG.IDS.VALUACION, CONFIG.SHEETS.TAB_VALUACION, "AGENTE INMOBILIARIO", "VALUACIONES");
  procesarHoja(CONFIG.IDS.RESERVAS, CONFIG.SHEETS.TAB_RESERVAS, "AGENTE INMOBILIARIO", "RESERVAS");
  procesarHoja(CONFIG.IDS.RESENAS, CONFIG.SHEETS.TAB_RESENAS, "AGENTE INMOBILIARIO", "RESEÑAS");

  // Proceso especial para cartera: Filtro custom (Callback)
  procesarHoja(CONFIG.IDS.CARTERA_INMUEBLES, CONFIG.SHEETS.TAB_CARTERA, "AGENTE_CAPTADOR", "CAPTACIONES", (row, headers) => {
    const idxEstado = headers.indexOf("ESTADO");
    return idxEstado === -1 ? true : String(row[idxEstado]).toUpperCase().trim() === "CAPTADO";
  });

  return { rawEvents, agentes_activos: validAgents };
}

// Fin de 07_Utils.js

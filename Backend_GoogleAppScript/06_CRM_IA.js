/**
 * 06_CRM_IA.js
 * * Módulo de Inteligencia de Negocios y CRM.
 * Contiene la lógica para:
 * 1. Servir datos al CRM filtrados por permisos de agente.
 * 2. Calcular métricas para el Dashboard (con Caching).
 * 3. Integración con Gemini AI para análisis de datos en lenguaje natural.
 */

// ==========================================
// GESTIÓN DE CLIENTES (CRM)
// ==========================================

/**
 * Obtiene los datos del CRM filtrados por agente.
 * Implementa "Row Level Security" (RLS) básica: Un agente solo ve sus leads, 
 * a menos que sea Admin o el lead esté compartido.
 */
function handleGetData(agenteNombre) {
  const crmData = [];
  
  // 1. Normalización de entrada
  let inputName = agenteNombre ? String(agenteNombre).trim().toUpperCase() : null;
  
  // 2. Traducción de identidad (Mapping)
  // Permite que "JUAN" vea los datos de "JUAN PEREZ" (definido en Config)
  let nombreParaFiltrar = inputName;
  if (inputName && NOMBRES_CRM[inputName]) {
    nombreParaFiltrar = NOMBRES_CRM[inputName];
  }

  const agenteSolicitante = nombreParaFiltrar ? nombreParaFiltrar.toUpperCase() : null;

  // Función interna para procesar hojas (DRY - Don't Repeat Yourself)
  const leerHoja = (id, tipo, idx) => {
    try {
      const rows = getSheetData(id, CONFIG.SHEETS.CRM_GENERICO);
      if (!rows || rows.length <= 1) return;

      for (let i = 1; i < rows.length; i++) {
        let r = rows[i];
        if (!r[0]) continue; 

        // Normalización del nombre en la fila
        let nombreAgenteEnFila = String(r[idx.AG] || "").trim().toUpperCase();
        
        // FILTRADO DE SEGURIDAD:
        // Si hay un agente solicitante y no coincide con la fila, se salta (privacidad).
        if (agenteSolicitante && !nombreAgenteEnFila.includes(agenteSolicitante) && !agenteSolicitante.includes(nombreAgenteEnFila)) {
          continue; 
        }

        let op = String(r[idx.OP] || "").toUpperCase();
        // Determinación dinámica de categoría (Inquilino/Comprador/etc)
        let cat = (tipo === 'CLI') ? 
                  (op.includes("ALQUILER") ? "INQUILINO" : "COMPRADOR") : 
                  (op.includes("ALQUILER") ? "PROPIETARIO" : "VENDEDOR");
        
        let timeId = (r[0] instanceof Date) ? r[0].toISOString() : String(r[0]);
        
        crmData.push({
          id: `${tipo}||${timeId}`, // ID Compuesto para trazabilidad
          fecha: timeId, 
          cat: cat, 
          etapa: r[idx.ETAPA] || "INGRESO",
          agente: nombreAgenteEnFila, 
          nom: String(r[idx.NOM] || r[idx.PROP] || "Sin Nombre").trim(), 
          tel: String(r[idx.TEL] || ""),
          mail: String(r[idx.MAIL] || ""), 
          prop: String(r[idx.PROP] || ""),
          zona: String(r[idx.ZONA] || ""), 
          agenda: r[idx.AGENDA] ? new Date(r[idx.AGENDA]).toISOString() : null, 
          notas: r[idx.NOTAS] || ""
        });
      }
    } catch(e) { console.error("Error en lectura CRM: " + e.toString()); }
  };

  // Procesamos ambas fuentes de datos: Compradores y Vendedores
  leerHoja(CONFIG.IDS.COMPRADORES, "CLI", CRM_INDICES.CLI);
  leerHoja(CONFIG.IDS.VENDEDORES, "VEN", CRM_INDICES.VEN);
  
  return jsonResponse(crmData);
}

/**
 * Actualiza el estado, agenda o notas de un cliente.
 * Utiliza el ID compuesto para localizar la fila exacta en la hoja correspondiente.
 */
function handleUpdateClient(jsonString) {
  try {
    const p = JSON.parse(jsonString);
    const [type, targetIso] = p.id.split('||'); // Deserializa el ID
    const isCli = type === 'CLI';
    
    const ss = SpreadsheetApp.openById(isCli ? CONFIG.IDS.COMPRADORES : CONFIG.IDS.VENDEDORES);
    const sheet = getSheetSmart(ss, CONFIG.SHEETS.CRM_GENERICO);
    const data = sheet.getDataRange().getValues();
    
    // Búsqueda lineal del registro por Timestamp (Unique ID)
    let rowIdx = -1;
    for(let i=1; i<data.length; i++) {
      let cellIso = (data[i][0] instanceof Date) ? data[i][0].toISOString() : String(data[i][0]);
      if(cellIso === targetIso || String(data[i][0]) == targetIso) { rowIdx = i + 1; break; }
    }
    
    if (rowIdx === -1) return jsonResponse({success: false, error: "Registro no encontrado"});
    
    // Actualización condicional de campos
    if (p.etapa) sheet.getRange(rowIdx, isCli ? 19 : 10).setValue(p.etapa);
    
    if (p.hasOwnProperty('agenda')) {
      const cell = sheet.getRange(rowIdx, isCli ? 20 : 11);
      (!p.agenda || p.agenda === "DELETE") ? cell.clearContent() : cell.setValue(new Date(p.agenda));
    }
    
    if (p.nota) {
      const cell = sheet.getRange(rowIdx, isCli ? 21 : 12);
      const old = cell.getValue();
      const fechaActual = new Date().toLocaleDateString('es-AR');
      // Append de notas (Historial)
      cell.setValue(`[${fechaActual}] ${p.nota}\n${old || ""}`);
    }
    return jsonResponse({success: true});
  } catch (e) { return jsonResponse({success: false, error: e.message}); }
}

// ==========================================
// DASHBOARD & ANALYTICS (CON CACHÉ)
// ==========================================

function handleGetDashboardData() {
  // Estrategia de Caché:
  // Dado que calcular métricas es costoso (lee muchas Sheets),
  // guardamos el resultado procesado por 15 minutos.
  const cache = CacheService.getScriptCache();
  const CACHE_KEY = "DASHBOARD_DATA_V1"; 
  
  // 1. Hit de Caché
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    return jsonResponse(JSON.parse(cached));
  }

  try {
    // 2. Miss de Caché: Procesamiento pesado
    // Nota: 'calculateEvolution' debe estar definida en el módulo de utilidades
    const agentesActivos = getActiveAgentsFromSheet(); 
    const evolution = calculateEvolution(); 

    const response = { 
      agentes_activos: agentesActivos, 
      evolucion_data: evolution.rawEvents 
    };

    // 3. Guardar en caché (TTL: 900 segundos)
    cache.put(CACHE_KEY, JSON.stringify(response), 900);

    return jsonResponse(response);
  } catch (e) { 
    console.error("Dashboard Error: " + e.toString());
    return jsonResponse({ error: e.toString() }); 
  }
}

// ==========================================
// INTEGRACIÓN CON IA (GEMINI API)
// ==========================================

/**
 * Consulta a la API de Gemini para análisis de datos en lenguaje natural.
 * Utiliza técnica RAG (Retrieval-Augmented Generation) inyectando el contexto de datos.
 */
function consultarIA(pregunta) {
  if (!pregunta) return jsonResponse({ answer: "Analista listo. ¿Qué revisamos hoy?" });
  
  // Obtenemos los datos crudos para dárselos a la IA
  const evolution = calculateEvolution();
  const data = evolution.rawEvents;

  // Construcción del Contexto (Data Injection)
  let contextBrief = "MÉTRICAS DETALLADAS (FECHA | AGENTE | ACCIÓN | CANTIDAD):\n";
  data.forEach(d => {
    contextBrief += `${d.fecha} | ${d.agente} | ${d.accion} | ${d.cantidad}\n`;
  });

  // Prompt Engineering: Definición de rol y restricciones
  const prompt = `
      Rol: Analista Senior de Datos Inmobiliarios.
      Contexto: Tienes los siguientes datos detallados por fecha (YYYY-MM-DD):
      ${contextBrief}
      
      Instrucciones:
      1. Identifica tendencias comparando periodos recientes.
      2. Si preguntan por tasas, calcula porcentajes reales basados en los datos.
      3. Sé breve y profesional.
      
      Pregunta del Usuario: "${pregunta}"
    `;
    
  try {
    // Llamada REST a la API de Vertex AI / Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.API_KEYS.GEMINI}`;
    
    const resp = UrlFetchApp.fetch(url, { 
      method: 'post', 
      contentType: 'application/json', 
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) 
    });
    
    const answer = JSON.parse(resp.getContentText()).candidates[0].content.parts[0].text;
    return jsonResponse({ answer: answer });
  } catch (e) { 
    return jsonResponse({ answer: "El servicio de IA está experimentando alta latencia. Intenta nuevamente." }); 
  }
}

function borrarCache() {
  CacheService.getScriptCache().remove("DASHBOARD_DATA_V1");
  console.log("Caché invalidado manualmente.");
}


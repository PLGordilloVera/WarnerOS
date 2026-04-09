// ==========================================
// 4. MÓDULO CRM, IA Y DASHBOARD
// ==========================================

function handleGetData(agenteNombre) {
  const crmData = [];
  let inputName = agenteNombre ? String(agenteNombre).trim().toUpperCase() : null;
  let nombreParaFiltrar = inputName;
  if (inputName && NOMBRES_CRM[inputName]) nombreParaFiltrar = NOMBRES_CRM[inputName];

  const agenteSolicitante = nombreParaFiltrar ? nombreParaFiltrar.toUpperCase() : null;

  const leerHoja = (id, tipo, idx) => {
    try {
      const rows = getSheetData(id, CONFIG.SHEETS.CRM_GENERICO);
      if (!rows || rows.length <= 1) return;

      for (let i = 1; i < rows.length; i++) {
        let r = rows[i];
        if (!r[0]) continue;

        let nombreAgenteEnFila = String(r[idx.AG] || "").trim().toUpperCase();
        
        if (agenteSolicitante && !nombreAgenteEnFila.includes(agenteSolicitante) && !agenteSolicitante.includes(nombreAgenteEnFila)) {
          continue;
        }

        let op = String(r[idx.OP] || "").toUpperCase();
        let cat = (tipo === 'CLI') ?
                  (op.includes("ALQUILER") ? "INQUILINO" : "COMPRADOR") :
                  (op.includes("ALQUILER") ? "PROPIETARIO" : "VENDEDOR");
        
        let timeId = (r[0] instanceof Date) ? r[0].toISOString() : String(r[0]);
        
        crmData.push({
          id: `${tipo}||${timeId}`,
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
    } catch(e) { console.error("Error en leerHoja: " + e.toString()); }
  };

  leerHoja(CONFIG.IDS.COMPRADORES, "CLI", CRM_INDICES.CLI);
  leerHoja(CONFIG.IDS.VENDEDORES, "VEN", CRM_INDICES.VEN);
  return jsonResponse(crmData);
}

function handleUpdateClient(jsonString) {
  try {
    // 1. Parseo robusto del JSON
    const p = (typeof jsonString === 'string') ? JSON.parse(jsonString) : jsonString;
    
    // 2. Validación del ID (Debe venir como "CLI||ISO_DATE" o "VEN||ISO_DATE")
    if (!p.id || !p.id.includes('||')) {
      return jsonResponse({success: false, error: "Formato de ID inválido: " + p.id});
    }

    const [type, targetIso] = p.id.split('||');
    const isCli = (type === 'CLI');
    
    // 3. Selección de la hoja correcta
    const ss = SpreadsheetApp.openById(isCli ? CONFIG.IDS.COMPRADORES : CONFIG.IDS.VENDEDORES);
    const sheet = getSheetSmart(ss, CONFIG.SHEETS.CRM_GENERICO);
    const data = sheet.getDataRange().getValues();
    const indices = isCli ? CRM_INDICES.CLI : CRM_INDICES.VEN;
    
    // 4. Búsqueda exacta de la fila por Timestamp (ISO String)
    let rowIdx = -1;
    for(let i=1; i<data.length; i++) {
      let cellValue = data[i][0];
      let cellIso = (cellValue instanceof Date) ? cellValue.toISOString() : String(cellValue);
      if(cellIso === targetIso) { 
        rowIdx = i + 1; 
        break; 
      }
    }

    if (rowIdx === -1) return jsonResponse({success: false, error: "No se encontró el registro con ID: " + targetIso});

    // 5. Aplicación de cambios en las columnas correspondientes
    if (p.etapa) sheet.getRange(rowIdx, indices.ETAPA + 1).setValue(p.etapa.toUpperCase());
    
    if (p.agenda) {
      sheet.getRange(rowIdx, indices.AGENDA + 1).setValue(new Date(p.agenda));
    }
    
    if (p.nota && p.nota.trim() !== "") {
      const cell = sheet.getRange(rowIdx, indices.NOTAS + 1);
      const oldNotes = cell.getValue();
      const fechaActual = new Date().toLocaleDateString('es-AR');
      // Insertar la nota nueva arriba del historial
      cell.setValue(`[${fechaActual}] ${p.nota}\n${oldNotes || ""}`);
    }

    return jsonResponse({success: true, message: "Sheet actualizada correctamente"});
  } catch (e) { 
    return jsonResponse({success: false, error: e.toString()}); 
  }
}

// --- FUNCIÓN NUEVA PARA CARGAR LEAD ---
function handleCreateClient(dataInput) {
  try {
    const data = (typeof dataInput === 'string') ? JSON.parse(dataInput) : dataInput;
    const isComprador = (data.categoria === 'COMPRADOR' || data.categoria === 'INQUILINO');
    
    const ss = SpreadsheetApp.openById(isComprador ? CONFIG.IDS.COMPRADORES : CONFIG.IDS.VENDEDORES);
    const sheet = getSheetSmart(ss, CONFIG.SHEETS.CRM_GENERICO);
    
    // Obtenemos índices correctos
    const idx = isComprador ? CRM_INDICES.CLI : CRM_INDICES.VEN;
    
    // Creamos una fila vacía del tamaño de la hoja
    const lastCol = sheet.getLastColumn();
    // Aseguramos un tamaño mínimo basado en el índice más alto que usamos
    const minSize = Math.max(idx.NOTAS, lastCol) + 1;
    const newRow = new Array(minSize).fill("");

    // Llenamos datos
    newRow[0] = new Date(); // Timestamp
    newRow[idx.AG] = data.asignado || "";
    newRow[idx.NOM] = data.nombre || "";
    newRow[idx.TEL] = data.telefono || "";
    newRow[idx.PROP] = data.propiedad || ""; // Interés/Propiedad
    newRow[idx.ETAPA] = "INGRESO"; // Default stage
    
    sheet.appendRow(newRow);
    return jsonResponse({ status: 'success', message: 'Lead creado exitosamente' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

function handleGetDashboardData() {
  const cache = CacheService.getScriptCache();
  const CACHE_KEY = "DASHBOARD_V10_FINAL";
  const cached = cache.get(CACHE_KEY);
  if (cached) return jsonResponse(JSON.parse(cached));

  try {
    const agentesActivos = getActiveAgentsFromSheet();
    const evolution = calculateEvolution();
    const response = { agentes_activos: agentesActivos, evolucion_data: evolution.rawEvents };
    cache.put(CACHE_KEY, JSON.stringify(response), 900);
    return jsonResponse(response);
  } catch (e) { return jsonResponse({ error: e.toString() }); }
}

function consultarIA(pregunta) {
  if (!pregunta) return jsonResponse({ answer: "Analista listo. ¿Qué revisamos hoy?" });
  const evolution = calculateEvolution();
  const data = evolution.rawEvents;
  let contextBrief = "MÉTRICAS (FECHA | AGENTE | ACCIÓN | CANTIDAD):\n";
  // Limitamos a 400 líneas para no romper el límite de tokens
  data.slice(0, 400).forEach(d => { contextBrief += `${d.fecha}|${d.agente}|${d.accion}|${d.cantidad}\n`; });

  const prompt = `Analista Warner. Datos:\n${contextBrief}\nPregunta: "${pregunta}"\nResponde tendencias.`;
    
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${CONFIG.API_KEYS.GEMINI}`;
    const resp = UrlFetchApp.fetch(url, {
      method: 'post', contentType: 'application/json',
      payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const answer = JSON.parse(resp.getContentText()).candidates[0].content.parts[0].text;
    return jsonResponse({ answer: answer });
  } catch (e) { return jsonResponse({ answer: "IA no disponible." }); }
}
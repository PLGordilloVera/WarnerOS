/**
 * 07_Utils.gs - SISTEMA WARNER OS
 */

function calculateEvolution() {
  const hoy = new Date();
  const minDate = new Date(hoy.getFullYear() - 1, 0, 1);
  const rawEvents = [];
  const validAgents = getActiveAgentsFromSheet();
  const agentsSet = new Set(validAgents);

  const procesarHoja = (idSpreadsheet, nombreHoja, nombreColumnaAgente, nombreAccion, filtroExtraFn) => {
    try {
      const data = getSheetData(idSpreadsheet, nombreHoja);
      if (!data || data.length <= 1) return;

      const headers = data[0].map(h => String(h).toUpperCase().trim());
      const idxAgente = headers.findIndex(h => h === nombreColumnaAgente.toUpperCase() || h.includes("AGENTE"));
      const idxFecha = headers.findIndex(h => h.includes("MARCA TEMPORAL") || h.includes("FECHA"));

      if (idxAgente === -1 || idxFecha === -1) return;

      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        let nombreRaw = String(row[idxAgente] || "");
        let nombreOficial = normalizeName(nombreRaw);
        
        if (!nombreOficial || !agentsSet.has(nombreOficial)) continue;

        let fecha = parseDate(row[idxFecha]);
        if (!fecha || fecha < minDate) continue;
        if (filtroExtraFn && !filtroExtraFn(row, headers)) continue;

        rawEvents.push({
          agente: nombreOficial,
          accion: nombreAccion,
          fecha: fecha.toISOString().split('T')[0],
          cantidad: 1
        });
      }
    } catch (e) { console.error(`Error en ${nombreAccion}: ` + e.toString()); }
  };

  procesarHoja(CONFIG.IDS.VENDEDORES, CONFIG.SHEETS.TAB_VENDEDORES, "AGENTE INMOBILIARIO", "CLIENTES VENDEDORES");
  procesarHoja(CONFIG.IDS.COMPRADORES, CONFIG.SHEETS.TAB_COMPRADORES, "AGENTE INMOBILIARIO", "CLIENTES");
  procesarHoja(CONFIG.IDS.CARTELES, CONFIG.SHEETS.CARTELES, "AGENTE INMOBILIARIO", "CARTELES");
  procesarHoja(CONFIG.IDS.REGISTRO_VISITAS, CONFIG.SHEETS.TAB_VISITAS, "AGENTE INMOBILIARIO", "VISITAS");
  procesarHoja(CONFIG.IDS.VALUACION, CONFIG.SHEETS.TAB_VALUACION, "AGENTE INMOBILIARIO", "VALUACIONES");
  procesarHoja(CONFIG.IDS.RESERVAS, CONFIG.SHEETS.TAB_RESERVAS, "AGENTE INMOBILIARIO", "RESERVAS");
  procesarHoja(CONFIG.IDS.RESENAS, CONFIG.SHEETS.TAB_RESENAS, "AGENTE INMOBILIARIO", "RESEÑAS");
  procesarHoja(CONFIG.IDS.CARTERA_INMUEBLES, CONFIG.SHEETS.TAB_CARTERA, "AGENTE_CAPTADOR", "CAPTACIONES", (row, headers) => {
    const idxEstado = headers.indexOf("ESTADO");
    return idxEstado === -1 ? true : String(row[idxEstado]).toUpperCase().trim() === "CAPTADO";
  });

  return { rawEvents, agentes_activos: validAgents };
}

function normalizeName(name) {
  if (!name) return "";
  let clean = String(name).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, ' ').trim();
  return MAPEO_IDENTIDADES[clean] || clean;
}

function getActiveAgentsFromSheet() {
  try {
    const data = getSheetData(CONFIG.IDS.PERSONAL, CONFIG.SHEETS.PERSONAL);
    if (!data) return [];
    return data.slice(1)
      .filter(row => {
        const nombre = String(row[1] || "").trim();
        const depto = String(row[10] || "").toUpperCase().trim();
        const estado = String(row[15] || "").toUpperCase().trim();
        return nombre !== "" && estado === "ACTIVO" && depto === "VENTAS";
      })
      .map(row => normalizeName(row[1]));
  } catch (e) { return []; }
}

function parseDate(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  return isNaN(d.getTime()) ? null : d;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheetData(id, name) {
  try {
    const ss = SpreadsheetApp.openById(id);
    const sheet = name ? ss.getSheetByName(name) : ss.getSheets()[0];
    return sheet.getDataRange().getValues();
  } catch(e) { return null; }
}

function getSheetSmart(ss, name) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.getSheets()[0];
    return sheet;
}

function uploadToDrive(base64Data, mimeType, fileName, folderId) {
  try {
    const splitBase = base64Data.split(',');
    const blob = Utilities.newBlob(Utilities.base64Decode(splitBase[1] || splitBase[0]), mimeType, fileName);
    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) { return "Error subiendo foto: " + e.toString(); }
}
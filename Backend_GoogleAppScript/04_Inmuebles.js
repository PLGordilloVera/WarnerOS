/**
 * 04_Inmuebles.js
 * * Módulo de Gestión de Inventario (Inmuebles).
 * Permite consultar el estado de la cartera de propiedades en tiempo real desde Google Sheets.
 * Incluye lógica para filtrar propiedades aptas para cartelería o reservas.
 */

/**
 * Obtiene la lista de inmuebles disponibles.
 * Puede filtrar aquellos que ya tienen cartel si se solicita para la gestión de cartelería.
 * @param {Object} params - Parámetros de filtro (ej: filtro_carteles='true')
 */
function handleGetInmuebles(params) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    const data = sheet.getDataRange().getValues();
    
    // Normalización de cabeceras para búsqueda dinámica de columnas
    const headers = data[0].map(h => String(h).toUpperCase().trim());

    // Índices dinámicos: Robustez ante cambios de columnas en la Sheet
    const idxEstado = headers.indexOf('ESTADO');
    const idxCartel = headers.findIndex(h => h.includes('CARTEL'));
    const idxCalle = headers.indexOf('CALLE');
    const idxNum = headers.indexOf('NUMERO');
    const idxPadron = headers.indexOf('PADRON_CATASTRAL');

    // Validación de integridad de la base de datos
    if (idxEstado === -1 || idxCalle === -1 || idxPadron === -1) {
      return jsonResponse({ error: "Error de Estructura: Faltan columnas críticas en la base de datos." });
    }

    const inmuebles = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const esCaptado = String(row[idxEstado]).toUpperCase().trim() === 'CAPTADO';
      const yaTieneCartel = idxCartel !== -1 && String(row[idxCartel]).toUpperCase().trim() === 'SI';
      
      // Lógica de Negocio:
      // Si el filtro de carteles está activo, excluimos las que ya tienen cartel (yaTieneCartel == true).
      // Si no hay filtro, traemos todas las captadas.
      if (esCaptado && !(params.filtro_carteles === 'true' && yaTieneCartel)) {
        inmuebles.push({
          direccion: `${row[idxCalle] || ''} ${row[idxNum] || ''}`.trim(),
          padron: row[idxPadron] || 'S/N'
        });
      }
    }
    
    // Retorna ordenado alfabéticamente por dirección para mejor UX en el selector
    return jsonResponse(inmuebles.sort((a, b) => a.direccion.localeCompare(b.direccion)));
  } catch (e) { 
    return jsonResponse({ error: e.toString() }); 
  }
}

/**
 * Endpoint específico para el formulario de Reservas.
 * Solo devuelve inmuebles con estado 'CAPTADO', asegurando que no se reserve algo vendido.
 */
function handleGetInmueblesReservas(params) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).toUpperCase().trim());
    
    const idxEstado = headers.indexOf('ESTADO');
    const idxCalle = headers.indexOf('CALLE');
    const idxNum = headers.indexOf('NUMERO');
    const idxPadron = headers.indexOf('PADRON_CATASTRAL');

    const inmuebles = [];
    for (let i = 1; i < data.length; i++) {
      // Filtro estricto: Solo propiedades activas en cartera
      if (String(data[i][idxEstado]).toUpperCase().trim() === 'CAPTADO') {
        inmuebles.push({
          direccion: `${data[i][idxCalle] || ''} ${data[i][idxNum] || ''}`.trim(),
          padron: data[i][idxPadron] || 'S/N'
        });
      }
    }
    return jsonResponse(inmuebles.sort((a, b) => a.direccion.localeCompare(b.direccion)));
  } catch (e) { return jsonResponse({ error: e.toString() }); }
}
function handleGetInmuebles(params) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).toUpperCase().trim());

    const idxEstado = headers.indexOf('ESTADO');
    const idxCartel = headers.findIndex(h => h.includes('CARTEL'));
    const idxCalle = headers.indexOf('CALLE');
    const idxNum = headers.indexOf('NUMERO');
    const idxPadron = headers.indexOf('PADRON_CATASTRAL');

    if (idxEstado === -1 || idxCalle === -1 || idxPadron === -1) {
      return jsonResponse({ error: "Faltan columnas en Cartera" });
    }

    const inmuebles = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const esCaptado = String(row[idxEstado]).toUpperCase().trim() === 'CAPTADO';
      const yaTieneCartel = idxCartel !== -1 && String(row[idxCartel]).toUpperCase().trim() === 'SI';
      
      if (esCaptado && !(params.filtro_carteles === 'true' && yaTieneCartel)) {
        inmuebles.push({
          direccion: `${row[idxCalle] || ''} ${row[idxNum] || ''}`.trim(),
          padron: row[idxPadron] || 'S/N'
        });
      }
    }
    return jsonResponse(inmuebles.sort((a, b) => a.direccion.localeCompare(b.direccion)));
  } catch (e) { return jsonResponse({ error: e.toString() }); }
}

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
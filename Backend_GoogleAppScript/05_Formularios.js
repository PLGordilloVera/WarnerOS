// --- HANDLERS DE FORMULARIOS ---

function handleAddCartera(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    if (!sheet) return jsonResponse({ status: 'error', message: 'Hoja Cartera no encontrada' });

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nuevaFila = headers.map(header => {
      if (header === "Marca temporal") return new Date();
      const key = String(header).trim();
      return data[key] !== undefined ? data[key] : "";
    });

    sheet.appendRow(nuevaFila);
    return jsonResponse({ status: 'success', message: 'Inmueble guardado' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

function handleAddResena(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.RESENAS);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_RESENAS);
    sheet.appendRow([new Date(), data.link, data.agente, data.mencion]);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

function handleAddValuacion(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.VALUACION);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_VALUACION);
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nuevaFila = headers.map(header => {
      if (header === "Marca temporal") return new Date();
      return data[header] !== undefined ? data[header] : "";
    });
    sheet.appendRow(nuevaFila);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

function handleAddReserva(data) {
  try {
    const ssReservas = SpreadsheetApp.openById(CONFIG.IDS.RESERVAS);
    ssReservas.getSheetByName(CONFIG.SHEETS.TAB_RESERVAS).appendRow([new Date(), data.padron, data.direccion, data.agente, data.valor, data.moneda, data.operacion]);

    const ssCartera = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheetCartera = ssCartera.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    const dataCartera = sheetCartera.getDataRange().getValues();
    const idxPadron = dataCartera[0].indexOf('PADRON_CATASTRAL');
    const idxEstado = dataCartera[0].indexOf('ESTADO');

    if (idxPadron > -1 && idxEstado > -1) {
       for (let i = 1; i < dataCartera.length; i++) {
        if (String(dataCartera[i][idxPadron]).trim() === String(data.padron).trim()) {
          sheetCartera.getRange(i + 1, idxEstado + 1).setValue('RESERVADO');
          break;
        }
      }
    }
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

function handleAddCartel(data) {
  try {
    let fotoUrl = "";
    if (data.foto_cartel && data.foto_cartel.data) {
       fotoUrl = uploadToDrive(data.foto_cartel.data, data.foto_cartel.mimeType, data.foto_cartel.fileName, CONFIG.IDS.CARTELES_FOTO_FOLDER);
    }
    SpreadsheetApp.openById(CONFIG.IDS.CARTELES).getSheetByName(CONFIG.SHEETS.CARTELES).appendRow([new Date(), data.padron_catastral, data.agente, fotoUrl]);
    updateCarteraCartel(data.padron_catastral);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error', message: e.toString() }); }
}

function updateCarteraCartel(padronBuscado) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.CARTERA_INMUEBLES);
    const sheet = ss.getSheetByName(CONFIG.SHEETS.TAB_CARTERA);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const idxPadron = headers.indexOf('PADRON_CATASTRAL');
    const idxCartel = headers.findIndex(h => h.toString().toUpperCase().includes('CARTEL'));
    
    if (idxPadron > -1 && idxCartel > -1) {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idxPadron]).trim() === String(padronBuscado).trim()) {
          sheet.getRange(i + 1, idxCartel + 1).setValue("SI");
          break;
        }
      }
    }
  } catch(e) { console.log(e); }
}

function handleAddVisita(formData) {
  try {
    SpreadsheetApp.openById(CONFIG.IDS.REGISTRO_VISITAS).getSheetByName(CONFIG.SHEETS.TAB_VISITAS).appendRow([new Date(), formData.celular || '', '', formData.padron || '', formData.direccion_manual || '', '', formData.agente || '', formData.humedad || '']);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error' }); }
}

function handleAddVendedor(data) {
  try {
    SpreadsheetApp.openById(CONFIG.IDS.VENDEDORES).getSheets()[0].appendRow([new Date(), data.agente, data.origen, data.telefono, data.email, data.operacion, data.tipo_inmueble, data.observaciones, data.nombre_cliente]);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error' }); }
}

function handleAddComprador(data) {
  try {
    SpreadsheetApp.openById(CONFIG.IDS.COMPRADORES).getSheets()[0].appendRow([new Date(), data.agente, data.origen, data.nombre_cliente, data.telefono, data.email, data.operacion, data.tipo_inmueble, data.ambientes, data.cochera, data.presupuesto, data.moneda, data.credito, data.piso, data.zona, data.observaciones]);
    return jsonResponse({ status: 'success' });
  } catch (e) { return jsonResponse({ status: 'error' }); }
}
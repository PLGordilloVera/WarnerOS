function handleLogin(email, dni) {
  try {
    const rows = getSheetData(CONFIG.IDS.PERSONAL, CONFIG.SHEETS.PERSONAL);
    const inputEmail = String(email || "").trim().toLowerCase();
    const inputDni = String(dni || "").trim().replace(/\./g, '').replace(/\s/g, '');

    for (let i = 1; i < rows.length; i++) {
      let row = rows[i];
      let dbDni = String(row[2] || "").trim().replace(/\./g, '').replace(/\s/g, '');
      let dbEmail = String(row[4] || "").trim().toLowerCase();
      let estado = String(row[15] || "").toUpperCase();

      if (dbEmail === inputEmail && dbDni === inputDni) {
        if (estado.includes("INACTIVO")) {
           return jsonResponse({auth: false, message: "Usuario inactivo/baja"});
        }
        return jsonResponse({
          auth: true,
          name: normalizeName(row[1]),
          email: dbEmail,
          telefono: row[5],
          cargo: row[9],
          departamento: row[10],
          fechaIngreso: row[11],
          avatar: row[20] || null,
          role: String(row[9]).toLowerCase().includes("agente") ? 'AGENTE' : 'ADMIN'
        });
      }
    }
    return jsonResponse({auth: false, message: "Credenciales inválidas"});
  } catch (e) { return jsonResponse({auth: false, error: e.toString()}); }
}

function handleGetAgentsEndpoint() {
  return jsonResponse(getActiveAgentsFromSheet());
}

function handleUploadAvatar(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.PERSONAL);
    const sheet = getSheetSmart(ss, CONFIG.SHEETS.PERSONAL);
    const rows = sheet.getDataRange().getValues();
    const url = uploadToDrive(data.image, data.mimeType, "avatar_" + data.email, CONFIG.IDS.AVATARS_FOLDER);
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][4]).toLowerCase() === String(data.email).toLowerCase()) {
        sheet.getRange(i + 1, 21).setValue(url);
        return jsonResponse({ success: true, url: url });
      }
    }
    return jsonResponse({ success: false, error: "Usuario no encontrado" });
  } catch (e) { return jsonResponse({ success: false, error: e.toString() }); }
}
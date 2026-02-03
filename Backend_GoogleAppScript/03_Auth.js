/**
 * 03_Auth.js
 * * Módulo de Autenticación y Gestión de Usuarios.
 * Maneja el inicio de sesión, verificación de estado (Activo/Inactivo)
 * y la subida de avatares a Google Drive.
 */

/**
 * Verifica credenciales contra la base de datos de Personal.
 * NOTA: En este sistema MVP se utiliza el DNI como contraseña simplificada.
 * En un entorno de producción estricto, se recomienda implementar hashing (bcrypt).
 * * @param {string} email - Correo corporativo
 * @param {string} dni - Documento de identidad (actúa como password)
 */
function handleLogin(email, dni) {
  try {
    const rows = getSheetData(CONFIG.IDS.PERSONAL, CONFIG.SHEETS.PERSONAL);
    const inputEmail = String(email || "").trim().toLowerCase();
    // Normaliza el DNI quitando puntos y espacios
    const inputDni = String(dni || "").trim().replace(/\./g, '').replace(/\s/g, ''); 

    // Bucle de búsqueda lineal (O(n))
    for (let i = 1; i < rows.length; i++) {
      let row = rows[i];
      // Mapeo de Columnas (Indices basados en 0):
      // [2]: DNI, [4]: Email, [15]: Estado, [1]: Nombre
      let dbDni = String(row[2] || "").trim().replace(/\./g, '').replace(/\s/g, ''); 
      let dbEmail = String(row[4] || "").trim().toLowerCase(); 
      let estado = String(row[15] || "").toUpperCase();

      if (dbEmail === inputEmail && dbDni === inputDni) {
        // Verificación de baja lógica
        if (estado.includes("INACTIVO")) {
           return jsonResponse({auth: false, message: "Usuario inactivo/baja"});
        }
        
        // Login Exitoso: Retorna payload con datos del usuario
        return jsonResponse({
          auth: true, 
          name: normalizeName(row[1]), 
          email: dbEmail, 
          telefono: row[5], 
          cargo: row[9], 
          departamento: row[10], 
          fechaIngreso: row[11], 
          avatar: row[20] || null, // URL de la foto en Drive
          role: String(row[9]).toLowerCase().includes("agente") ? 'AGENTE' : 'ADMIN'
        });
      }
    }
    return jsonResponse({auth: false, message: "Credenciales inválidas"});
  } catch (e) { 
    return jsonResponse({auth: false, error: e.toString()}); 
  }
}

/**
 * Endpoint para obtener la lista de agentes activos (para filtros del Dashboard).
 */
function handleGetAgentsEndpoint() { 
  return jsonResponse(getActiveAgentsFromSheet()); 
}

/**
 * Helper: Extrae solo los nombres de agentes del departamento de VENTAS que estén ACTIVOS.
 */
function getActiveAgentsFromSheet() {
  try {
    const rows = getSheetData(CONFIG.IDS.PERSONAL, CONFIG.SHEETS.PERSONAL);
    const agentes = [];
    
    for (let i = 1; i < rows.length; i++) {
       let nombre = String(rows[i][1] || "").trim().toUpperCase();
       let depto = String(rows[i][10] || "").toUpperCase();
       let estado = String(rows[i][15] || "").toUpperCase();
       
       if (depto.includes("VENTAS") && estado === "ACTIVO") {
         if (nombre) agentes.push(nombre);
       }
    }
    // Retorna lista única y ordenada alfabéticamente
    return [...new Set(agentes)].sort();
  } catch (e) { return []; }
}

/**
 * Sube una nueva foto de perfil a Drive y actualiza la URL en la hoja de Personal.
 * @param {Object} data - { email, image (base64), mimeType }
 */
function handleUploadAvatar(data) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.IDS.PERSONAL);
    const sheet = getSheetSmart(ss, CONFIG.SHEETS.PERSONAL);
    const rows = sheet.getDataRange().getValues();
    
    // 1. Subir archivo a la carpeta de Drive configurada
    const url = uploadToDrive(data.image, data.mimeType, "avatar_" + data.email, CONFIG.IDS.AVATARS_FOLDER);
    
    // 2. Buscar al usuario y actualizar la columna U (índice 20) con el link
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][4]).toLowerCase() === String(data.email).toLowerCase()) {
        sheet.getRange(i + 1, 21).setValue(url); 
        return jsonResponse({ success: true, url: url });
      }
    }
    return jsonResponse({ success: false, error: "Usuario no encontrado para actualizar avatar" });
  } catch (e) { 
    return jsonResponse({ success: false, error: e.toString() }); 
  }
}
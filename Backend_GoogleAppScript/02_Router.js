/**
 * 02_Router.js
 * * Punto de entrada principal para la API (Dispatcher).
 * * Este archivo maneja las solicitudes HTTP GET y POST provenientes del Frontend (React).
 * Implementa el patrón "Front Controller" para centralizar el manejo de CORS,
 * el parsing de JSON y el enrutamiento de acciones.
 */

// Puntos de entrada estándar de Google Apps Script
function doGet(e) { return router(e); }
function doPost(e) { return router(e); }

/**
 * Maneja las peticiones preflight de CORS (Cross-Origin Resource Sharing).
 * Necesario para que el navegador permita las conexiones desde Vercel/Localhost.
 */
function doOptions(e) {
  // En una implementación completa, aquí se añadirían los headers Access-Control-Allow-Origin
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Función principal de enrutamiento.
 * Decodifica la petición y despacha la acción correspondiente al controlador.
 * * @param {Object} e - Objeto de evento de Apps Script
 * @returns {TextOutput} Respuesta JSON estandarizada
 */
function router(e) {
  // 1. Manejo de CORS para navegadores (Preflight Check)
  if (e && e.httpMethod === "OPTIONS") return doOptions();

  try {
    // 2. Validación de seguridad básica
    if (!e) return jsonResponse({ error: "No event object received" });

    // 3. Extracción unificada de datos (Payload)
    // Soporta tanto parámetros de URL (?action=xyz) como Body JSON ({ "action": "xyz" })
    let payload = {};
    
    // Intenta parsear el cuerpo del POST si existe
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        console.warn("El cuerpo del request no es un JSON válido, se continuará solo con parámetros.");
      }
    }

    // Combina parámetros de URL y Payload JSON
    const params = e.parameter || {};
    const action = params.action || payload.action;

    // Health Check (Ping)
    if (!action) {
      return jsonResponse({ 
        status: "Warner Server Online", 
        version: "v17.5-stable",
        message: "System Ready" 
      });
    }

    // 4. Despachador de acciones (Switch Controller)
    // Dirige el tráfico a las funciones controladoras específicas (ubicadas en otros archivos)
    switch (action) {
      
      // --- MÓDULO: AUTENTICACIÓN Y USUARIOS ---
      case "login": 
        return handleLogin(params.user || payload.user, params.pass || payload.pass);
      
      case "getAgents": 
        return handleGetAgentsEndpoint();
      
      case "uploadAvatar": 
        return handleUploadAvatar(payload);
      
      // --- MÓDULO: DASHBOARD E INTELIGENCIA ARTIFICIAL ---
      case "getDashboard": 
        return handleGetDashboardData();
      
      case "chatAI": 
        // Conexión con Gemini API
        return consultarIA(payload.question || params.question);
      
      // --- MÓDULO: CRM (Gestión de Clientes) ---
      case "getData": 
        // userRequested se usa para filtrar datos según permisos del agente
        const userRequested = params.userRequested || payload.userRequested;
        return handleGetData(userRequested);

      case "updateClient": 
        const clientData = params.data || JSON.stringify(payload);
        return handleUpdateClient(clientData);

      case "createClient": 
        const newClientData = params.data || JSON.stringify(payload);
        return handleCreateClient(newClientData);
      
      // --- MÓDULO: OPERACIONES (Formularios de Campo) ---
      case "addCartel": 
        return handleAddCartel(payload);
      
      case "getInmuebles": 
        // Filtra inmuebles según si es para cartelería o listado general
        return handleGetInmuebles(params.filtro_carteles ? params : payload);
      
      case "addVisita": 
        return handleAddVisita(payload);
      
      case "addComprador": 
        return handleAddComprador(payload);
      
      case "addVendedor": 
        return handleAddVendedor(payload);
      
      case "addCartera": 
        return handleAddCartera(payload); 
      
      // --- MÓDULO: RESERVAS Y CIERRES ---
      case "getInmueblesReservas": 
        return handleGetInmueblesReservas(params);
      
      case "addReserva": 
        return handleAddReserva(payload);

      // --- MÓDULO: VALUACIONES TÉCNICAS ---
      case "addValuacion": 
        return handleAddValuacion(payload);

      // --- MÓDULO: CALIDAD (Reseñas) ---
      case "addResena": 
        return handleAddResena(payload);

      // Default: Error 404 lógico
      default: 
        return jsonResponse({ error: "Acción desconocida o no implementada: " + action });
    }

  } catch (globalError) {
    // Captura de errores globales para evitar que el servidor se cuelgue silenciosamente
    console.error("Critical Router Error: " + globalError.toString());
    return jsonResponse({ 
      error: "Internal Server Error", 
      details: globalError.toString() 
    });
  }
}
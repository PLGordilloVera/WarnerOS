function doGet(e) { return router(e); }
function doPost(e) { return router(e); }

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function router(e) {
  if (e && e.parameter && e.parameter.method === "OPTIONS") return doOptions();

  try {
    if (!e) return jsonResponse({ error: "No event object received" });

    let payload = {};
    if (e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (err) {}
    }

    const params = e.parameter || {};
    const action = params.action || payload.action;

    if (!action) return jsonResponse({ status: "Warner Server Online v17.5", message: "Ready" });

    switch (action) {
      // --- AUTH & AGENTES ---
      case "login": return handleLogin(params.user || payload.user, params.pass || payload.pass);
      case "getAgents": return handleGetAgentsEndpoint();
      case "uploadAvatar": return handleUploadAvatar(payload);
      
      // --- DASHBOARD & IA ---
      case "getDashboard": return handleGetDashboardData();
      case "chatAI": return consultarIA(payload.question || params.question);
      
      // --- CRM ---
      case "getData": return handleGetData(params.userRequested || payload.userRequested);
      case "updateClient": return handleUpdateClient(params.data || JSON.stringify(payload));
      case "createClient": return handleCreateClient(params.data || payload); // <--- ESTE ES EL NUEVO
      
      // --- FORMULARIOS ---
      case "addCartel": return handleAddCartel(payload);
      case "getInmuebles": return handleGetInmuebles(params.filtro_carteles ? params : payload);
      case "addVisita": return handleAddVisita(payload);
      case "addComprador": return handleAddComprador(payload);
      case "addVendedor": return handleAddVendedor(payload);
      case "addCartera": return handleAddCartera(payload);
      
      // --- RESERVAS & OTROS ---
      case "getInmueblesReservas": return handleGetInmueblesReservas(params);
      case "addReserva": return handleAddReserva(payload);
      case "addValuacion": return handleAddValuacion(payload);
      case "addResena": return handleAddResena(payload);

      default: return jsonResponse({ error: "Acción desconocida: " + action });
    }
  } catch (globalError) {
    return jsonResponse({ error: "Internal Server Error", details: globalError.toString() });
  }
}
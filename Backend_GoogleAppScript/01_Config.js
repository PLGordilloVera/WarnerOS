/**
 * 01_Config.js
 * * Configuración centralizada del sistema Warner OS.
 * NOTA DE SEGURIDAD:
 * Este archivo ha sido sanitizado para el repositorio público.
 * En el entorno de producción, las claves y IDs se manejan a través de 
 * 'Script Properties' de Google Apps Script para garantizar la seguridad.
 */

// Función helper para obtener variables de entorno en Apps Script
function getProperty(propertyName) {
  // En producción retorna: PropertiesService.getScriptProperties().getProperty(propertyName)
  return PropertiesService.getScriptProperties().getProperty(propertyName) || `[PENDIENTE: ${propertyName}]`;
}

// ==========================================
// 1. CONFIGURACIÓN CENTRALIZADA
// ==========================================
const CONFIG = {
  IDS: {
    // Bases de Datos (Google Sheets)
    PERSONAL:           getProperty("ID_SS_PERSONAL"),
    VENDEDORES:         getProperty("ID_SS_VENDEDORES"),
    COMPRADORES:        getProperty("ID_SS_COMPRADORES"),
    METRICAS:           getProperty("ID_SS_METRICAS"),
    CARTELES:           getProperty("ID_SS_CARTELES"),
    REGISTRO_VISITAS:   getProperty("ID_SS_VISITAS"),
    CARTERA_INMUEBLES:  getProperty("ID_SS_CARTERA"),
    RESERVAS:           getProperty("ID_SS_RESERVAS"),
    VALUACION:          getProperty("ID_SS_VALUACION"),
    RESENAS:            getProperty("ID_SS_RESENAS"),
    
    // Carpetas de Google Drive (Almacenamiento de imágenes)
    AVATARS_FOLDER:       getProperty("ID_FOLDER_AVATARS"),
    CARTELES_FOTO_FOLDER: getProperty("ID_FOLDER_FOTOS_CARTELES"),
    CARTELES_NOTA_FOLDER: getProperty("ID_FOLDER_NOTAS_CARTELES")
  },
  
  SHEETS: {
    // Nombres de las pestañas en los Sheets
    PERSONAL:        "Hoja 1",
    CARTELES:        "Respuestas de formulario 3",
    CRM_GENERICO:    "Respuestas de formulario 1",
    TAB_VISITAS:     "Respuestas de formulario 1",
    TAB_CARTERA:     "Respuestas de formulario 1",
    TAB_COMPRADORES: "Respuestas de formulario 1",
    TAB_VENDEDORES:  "Respuestas de formulario 1",
    TAB_RESERVAS:    "Respuestas de formulario 1",
    TAB_VALUACION:   "Respuestas de formulario 1",
    TAB_RESENAS:     "Respuestas de formulario 1"
  },
  
  API_KEYS: {
    // Inteligencia Artificial
    GEMINI: getProperty("GEMINI_API_KEY")
  }
};

/**
 * Normalización de Nombres
 * Objeto para mapear nombres completos a nombres cortos para la UI.
 * (Datos anonimizados para el repositorio público)
 */
const NOMBRES_CRM = {
  "AGENTE UNO COMPLETO": "AGENTE UNO",
  "AGENTE DOS COMPLETO": "AGENTE DOS",
  "AGENTE TRES COMPLETO": "AGENTE TRES",
  "AGENTE CUATRO COMPLETO": "AGENTE CUATRO"
};

/**
 * Mapeo Inverso
 * Utilizado para reportes formales donde se requiere el nombre legal.
 */
const MAPEO_NOMBRES = {
  "AGENTE UNO": "AGENTE UNO COMPLETO",
  "AGENTE DOS": "AGENTE DOS COMPLETO",
  "AGENTE TRES": "AGENTE TRES COMPLETO",
  "AGENTE CUATRO": "AGENTE CUATRO COMPLETO"
};

// Índices de columnas en la base de datos (Estructura de Sheets)
// AG: Agente, NOM: Nombre, TEL: Teléfono, etc.
const CRM_INDICES = {
  CLI: { AG:1, NOM:3, TEL:4, MAIL:5, OP:6, PROP:7, PRE:10, ZONA:14, ETAPA:18, AGENDA:19, NOTAS:20 },
  VEN: { AG:1, NOM:8, TEL:3, MAIL:4, OP:5, PROP:6, PRE:7, ZONA:8, ETAPA:9, AGENDA:10, NOTAS:11 }
};
// ==========================================
// 1. CONFIGURACIÓN CENTRALIZADA
// ==========================================
const CONFIG = {
  IDS: {
    PERSONAL: "1cRcK7LD0tJ0tdEX73p3OJkjO4i8ckhnLuQWk3DNx1PY",
    VENDEDORES: "1bUv0yNbE9d2tX1ojYSGc7T-6MEeE60UAmFjs56vwx44",
    COMPRADORES: "18pRQM5NbZ0oOqQjFTY_lJD5J6bCWVccZGOuc78-XIWM",
    METRICAS: "1tBFlEmmrfF1C7TjXDY7ZKmhH0EeL8LB5AS6BJPkxKag",
    CARTELES: "1y1Ten0vMXceRXGzZELn63msgmtrluJltPnaBfIFWQdg",
    REGISTRO_VISITAS: "1-IUCSxz3Rh9vmajMxunfWEXcVjW2OjkBmtQ_B03Cn7k",
    CARTERA_INMUEBLES: "1Y80pLiAlu7RBZApq6KyOYIHBgCMYPKB76NpjpbhC-7w",
    RESERVAS: "14E0ro8PNYr8VkWsblpGV1tYPcmoGVjAYDE06du65l54",
    VALUACION: "1SDUb-IJjsTxbMKj6ZOy1rLxjZRrNO5Eh-vUaWYNFFNs",
    RESENAS: "134NRMjC-CJH9Aeipa3D9XE_4XhfLd7nO6b1j-sQfX2U",
    
    // CARPETAS DRIVE
    AVATARS_FOLDER: "1AXKQuzeHBM2ygAmT62yFmnppFBqbhis_",
    CARTELES_FOTO_FOLDER: "1aTaXl78fYYwaSNaVoCfYEQPIpHFS-2bVi1TLBwBXwXYDgcjGsCBnuBEhJf2egC-NTWm_An5b",
    CARTELES_NOTA_FOLDER: "1l-OqkM-99GrLgt_wx1viwRh6rv-KVPbHahlPcbd1XsFL7RzSigVtXCuGgw5TunZ3fvK3V9m5"
  },
  SHEETS: {
    PERSONAL: "Hoja 1",
    CARTELES: "Respuestas de formulario 3",
    CRM_GENERICO: "Respuestas de formulario 1",
    TAB_VISITAS: "Respuestas de formulario 1",
    TAB_CARTERA: "Respuestas de formulario 1",
    TAB_COMPRADORES: "Respuestas de formulario 1",
    TAB_VENDEDORES: "Respuestas de formulario 1",
    TAB_RESERVAS: "Respuestas de formulario 1",
    TAB_VALUACION: "Respuestas de formulario 1",
    TAB_RESENAS: "Respuestas de formulario 1"
  },
  API_KEYS: {
    GEMINI: "AIzaSyAPeUnnbRL7kRHY9h9NDoYhhJ_SSPbyzkE"
  }
};

const NOMBRES_CRM = {
  "AGUSTIN ISAIAS REYNOSO": "AGUSTIN REYNOSO",
  "ALEXIA RIVAS BORQUE": "ALEXIA RIVAS",
  "ALONSO CASTAÑO SEPULVEDA": "ALONSO CASTAÑO",
  "ANGEL MARIANO HERRERA": "ANGEL HERRERA"
};

// Mapeo inverso para métricas
const MAPEO_IDENTIDADES = {
  "AGUSTIN REYNOSO": "AGUSTIN ISAIAS REYNOSO",
  "ALEXIA RIVAS": "ALEXIA RIVAS BORQUE",
  "ALONSO CASTAÑO": "ALONSO CASTAÑO SEPULVEDA",
  "ANGEL HERRERA": "ANGEL MARIANO HERRERA"
};

const CRM_INDICES = {
  CLI: { AG:1, NOM:3, TEL:4, MAIL:5, OP:6, PROP:7, PRE:10, ZONA:14, ETAPA:18, AGENDA:19, NOTAS:20 },
  VEN: { AG:1, NOM:8, TEL:3, MAIL:4, OP:5, PROP:6, PRE:7, ZONA:8, ETAPA:9, AGENDA:10, NOTAS:11 }
};
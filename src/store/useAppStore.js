import { create } from 'zustand';

/**
 * Gestor de estado global de la aplicación.
 * Implementación del patrón Store utilizando Zustand.
 */
export const useAppStore = create((set) => ({
  // --- Estado Global ---
  // Intentamos recuperar del almacenamiento local para que no te saque al dar F5
  user: JSON.parse(localStorage.getItem('warner_user')) || null,
  
  // ¡ESTA ES LA CLAVE! Verificamos si hay usuario guardado para poner esto en TRUE
  isAuthenticated: !!localStorage.getItem('warner_user'),
  
  clients: [], // Caché local de la base de datos de clientes

  // --- Mutadores de Estado (Acciones) ---
  
  // Establece la sesión activa del usuario
  login: (userData) => {
    // 1. Guardamos en el navegador para persistencia
    localStorage.setItem('warner_user', JSON.stringify(userData));
    
    // 2. Actualizamos el estado (Tu código original)
    set({ 
      user: userData, 
      isAuthenticated: true // <--- ESTO ES LO QUE HACE QUE EL ROUTER TE DEJE PASAR
    });
  },

  // Purga los datos de sesión y restringe el acceso
  logout: () => {
    localStorage.removeItem('warner_user');
    set({ 
      user: null, 
      isAuthenticated: false, 
      clients: [] 
    });
  },

  // Actualiza la caché local de clientes
  setClients: (newClients) => set({ 
    clients: newClients 
  })
}));
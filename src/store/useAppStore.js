import { create } from 'zustand';

/**
 * Gestor de estado global de la aplicación.
 * Implementación del patrón Store utilizando Zustand.
 */
export const useAppStore = create((set) => ({
  // --- Estado Global ---
  user: JSON.parse(localStorage.getItem('warner_user')) || null,
  token: localStorage.getItem('warner_token') || null,
  userEmail: JSON.parse(localStorage.getItem('warner_user'))?.email || null,
  
  // Verificamos si hay token guardado para permitir el acceso
  isAuthenticated: !!localStorage.getItem('warner_token'),
  
  clients: [], // Caché local de la base de datos de clientes

  // --- Mutadores de Estado (Acciones) ---
  
  // Establece la sesión activa del usuario
  login: (userData, token) => {
    // 1. Guardamos en el navegador para persistencia
    localStorage.setItem('warner_user', JSON.stringify(userData));
    localStorage.setItem('warner_token', token);
    
    // 2. Actualizamos el estado
    set({ 
      user: userData, 
      token: token,
      userEmail: userData.email,
      isAuthenticated: true 
    });
  },

  // Purga los datos de sesión y restringe el acceso
  logout: () => {
    localStorage.removeItem('warner_user');
    localStorage.removeItem('warner_token');
    set({ 
      user: null, 
      token: null,
      userEmail: null,
      isAuthenticated: false, 
      clients: [] 
    });
  },

  // Actualiza la caché local de clientes
  setClients: (newClients) => set({ 
    clients: Array.isArray(newClients) ? newClients : [] 
  })
}));

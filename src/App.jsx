import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';

// --- IMPORTACIÓN DE VISTAS ---
import Login from './pages/Login';
import Dashboard from "./pages/Dashboard";
import Agente from './pages/Agente';


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        {/* Ruta de Perfil (Editar foto, etc) */}
        <Route path="/agente" element={
          <ProtectedRoute>
            <Agente />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
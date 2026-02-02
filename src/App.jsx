import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';

// --- IMPORTACIÓN DE VISTAS ---
import Login from './pages/Login';
import Dashboard from "./pages/Dashboard";
import Agente from './pages/Agente';
import Carteles from './components/Carteles'; 
import Visitas from './components/Visitas';
import Compradores from './components/Compradores';
import Vendedores from './components/Vendedores';
import Cartera from './components/Cartera';
import Reservas from './components/Reservas';
import Valuacion from './components/Valuacion';
import Resenas from './components/Resenas';

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

        <Route path="/agente" element={
          <ProtectedRoute>
            <Agente />
          </ProtectedRoute>
        } />

        <Route path="/carteles" element={
          <ProtectedRoute>
            <Carteles />
          </ProtectedRoute>
        } />


        <Route path="/visitas" element={
          <ProtectedRoute>
            <Visitas />
          </ProtectedRoute>
        } />

        <Route path="/compradores" element={
          <ProtectedRoute>
            <Compradores />
          </ProtectedRoute>
        } />

        <Route path="/vendedores" element={
          <ProtectedRoute>
            <Vendedores />
          </ProtectedRoute>
        } />

        <Route path="/cartera" element={
          <ProtectedRoute>
            <Cartera />
          </ProtectedRoute>
        } />

        <Route path="/reservas" element={
          <ProtectedRoute>
            <Reservas />
          </ProtectedRoute>
        } />

        <Route path="/valuacion" element={
          <ProtectedRoute>
            <Valuacion />
          </ProtectedRoute>
        } />
 
         <Route path="/resenas" element={
          <ProtectedRoute>
            <Resenas />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
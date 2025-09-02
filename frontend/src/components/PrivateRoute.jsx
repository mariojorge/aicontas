import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Login } from '../pages/Login';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#6B7280'
      }}>
        Carregando...
      </div>
    );
  }

  // Se não autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Se autenticado, mostrar o conteúdo
  return children;
};
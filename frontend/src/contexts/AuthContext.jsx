import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar token do localStorage na inicialização
  useEffect(() => {
    const storedToken = localStorage.getItem('@finance:token');
    const storedUser = localStorage.getItem('@finance:user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro no login');
      }

      const { user: userData, token: userToken } = data.data;

      setUser(userData);
      setToken(userToken);

      // Salvar no localStorage
      localStorage.setItem('@finance:token', userToken);
      localStorage.setItem('@finance:user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: error.message };
    }
  };

  // Função de registro
  const register = async (nome, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro no registro');
      }

      const { user: userData, token: userToken } = data.data;

      setUser(userData);
      setToken(userToken);

      // Salvar no localStorage
      localStorage.setItem('@finance:token', userToken);
      localStorage.setItem('@finance:user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: error.message };
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@finance:token');
    localStorage.removeItem('@finance:user');
  };

  // Função para validar token
  const validateToken = async () => {
    if (!token) return false;

    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        logout(); // Token inválido, fazer logout
        return false;
      }

      // Atualizar dados do usuário se necessário
      if (data.data) {
        setUser(data.data);
        localStorage.setItem('@finance:user', JSON.stringify(data.data));
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar token:', error);
      logout();
      return false;
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Erro ao atualizar perfil');
      }

      setUser(data.data);
      localStorage.setItem('@finance:user', JSON.stringify(data.data));

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    validateToken,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
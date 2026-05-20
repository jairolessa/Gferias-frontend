import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (cpf, password) => {
    const authData = await loginRequest(cpf, password);

    localStorage.setItem('token', authData.token);
    localStorage.setItem('authType', authData.type || 'Bearer');
    localStorage.setItem('user', JSON.stringify({ cpf }));
    setToken(authData.token);
    setUser({ cpf });

    return authData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authType');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};

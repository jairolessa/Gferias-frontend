import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginRequest } from '../api/authApi';

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

const getRoleFromToken = (token) => {
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  if (payload.role) return payload.role;

  const authorities = payload.authorities ?? payload.roles;
  if (Array.isArray(authorities)) {
    return authorities.find((entry) => entry.startsWith('ROLE_')) || authorities[0] || null;
  }

  if (typeof authorities === 'string') {
    return authorities.split(',').map((entry) => entry.trim()).find((entry) => entry.startsWith('ROLE_')) || authorities;
  }

  return null;
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (cpf, password) => {
    const authData = await loginRequest(cpf, password);
    const role = getRoleFromToken(authData.token);

    localStorage.setItem('token', authData.token);
    localStorage.setItem('authType', authData.type || 'Bearer');
    localStorage.setItem('user', JSON.stringify({ cpf, role }));
    setToken(authData.token);
    setUser({ cpf, role });

    return { ...authData, role, isAdmin: role === 'ROLE_ADMIN' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authType');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const role = useMemo(() => (token ? getRoleFromToken(token) : null), [token]);
  const isAdmin = role === 'ROLE_ADMIN';

  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAdmin,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token, role, isAdmin],
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

import { createContext, useContext, useState } from 'react';
import { api } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem('coul_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, mot_de_passe) => {
    const data = await api.login(email, mot_de_passe);
    localStorage.setItem('coul_admin_token', data.token);
    localStorage.setItem('coul_admin_user', JSON.stringify(data.admin));
    setAdmin(data.admin);
    return data.admin;
  };

  const logout = () => {
    localStorage.removeItem('coul_admin_token');
    localStorage.removeItem('coul_admin_user');
    setAdmin(null);
  };

  const isAuthenticated = !!admin;

  return (
    <AuthContext.Provider value={{ admin, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, csrfCookie } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    await csrfCookie();
    const response = await api('/api/auth/login', { method: 'POST', body: credentials });
    setUser(response.data);
    return response.data;
  }

  async function logout() {
    try { await api('/api/auth/logout', { method: 'POST' }); }
    finally { setUser(null); }
  }

  async function refreshUser() {
    const response = await api('/api/auth/me');
    setUser(response.data);
    return response.data;
  }

  const value = useMemo(() => ({ user, loading, login, logout, refreshUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return context;
}

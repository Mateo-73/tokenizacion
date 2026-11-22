import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'siembra.investor';
const DEMO_INVESTOR = { name: 'Inversionista demo', email: 'demo@siembra.bo' };

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function save(investor) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(investor));
  } catch {}
}

function clear() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function AuthProvider({ children }) {
  const [investor, setInvestor] = useState(load);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async () => {
    setLoading(true);
    try {
      const { investorId, name, publicKey } = await api.createDemoInvestor(DEMO_INVESTOR);
      const session = { investorId, name, publicKey };
      save(session);
      setInvestor(session);
      return session;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clear();
    setInvestor(null);
  }, []);

  const value = useMemo(() => ({ investor, loading, login, logout }), [investor, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

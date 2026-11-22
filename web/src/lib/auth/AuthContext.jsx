import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
const STORAGE_KEY = 'siembra.investor';
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } }
function save(investor) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(investor)); } catch {} }
function clear() { try { localStorage.removeItem(STORAGE_KEY); } catch {} }
export function AuthProvider({ children }) {
  const [investor, setInvestor] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { setInvestor(load()); setLoading(false); }, []);
  const value = useMemo(() => ({ investor, loading, async login() { const result = await api.createDemoInvestor({ name: 'Inversionista demo', email: 'demo@siembra.bo' }); const session = { investorId: result.investorId, name: result.name, publicKey: result.publicKey }; save(session); setInvestor(session); return session; }, logout() { clear(); setInvestor(null); } }), [investor, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }

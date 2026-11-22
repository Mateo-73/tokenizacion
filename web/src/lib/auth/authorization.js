import { useCallback, useState } from 'react';
import { api } from '../api.js';

const STORAGE_KEY = 'siembra.verifiedAssets';

function readAll() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return stored && typeof stored === 'object' ? stored : {};
  } catch {
    return {};
  }
}

function isVerified(investorId, assetId) {
  if (!investorId || !assetId) return false;
  const ids = readAll()[investorId];
  return Array.isArray(ids) && ids.includes(assetId);
}

function writeVerified(investorId, assetId, verified) {
  try {
    const stored = readAll();
    const ids = new Set(Array.isArray(stored[investorId]) ? stored[investorId] : []);
    if (verified) ids.add(assetId);
    else ids.delete(assetId);
    if (ids.size) stored[investorId] = [...ids];
    else delete stored[investorId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
}

export function useAuthorization(investorId, assetId) {
  const key = `${investorId}:${assetId}`;
  const [state, setState] = useState(() => ({ key, authorized: isVerified(investorId, assetId), result: null }));
  const current = state.key === key ? state : { key, authorized: isVerified(investorId, assetId), result: null };
  if (current !== state) setState(current);

  const verify = useCallback(async () => {
    const result = await api.authorize({ investorId, assetId });
    writeVerified(investorId, assetId, true);
    setState({ key, authorized: true, result });
  }, [investorId, assetId, key]);

  const clear = useCallback(() => {
    if (investorId) writeVerified(investorId, assetId, false);
    setState({ key, authorized: false, result: null });
  }, [investorId, assetId, key]);

  return { authorized: current.authorized, verificationResult: current.result, verify, clear };
}

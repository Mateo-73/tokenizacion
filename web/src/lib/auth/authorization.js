import { useEffect, useState } from 'react';
import { api } from '../api.js';

const STORAGE_KEY = 'siembra.verifiedAssets';
function readVerified(investorId) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return Array.isArray(stored[investorId]) ? stored[investorId] : [];
  } catch { return []; }
}
function writeVerified(investorId, assetId, verified) {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const ids = new Set(Array.isArray(stored[investorId]) ? stored[investorId] : []);
    if (verified) ids.add(assetId); else ids.delete(assetId);
    if (ids.size) stored[investorId] = [...ids]; else delete stored[investorId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {}
}
export function useAuthorization(investorId, assetId) {
  const [authorized, setAuthorized] = useState(() => Boolean(investorId && assetId && readVerified(investorId).includes(assetId)));
  const [verificationResult, setVerificationResult] = useState(null);
  useEffect(() => { setAuthorized(Boolean(investorId && readVerified(investorId).includes(assetId))); setVerificationResult(null); }, [investorId, assetId]);
  const verify = async () => {
    const result = await api.authorize({ investorId, assetId });
    writeVerified(investorId, assetId, true);
    setVerificationResult(result);
    setAuthorized(true);
  };
  const clear = () => { if (investorId) writeVerified(investorId, assetId, false); setAuthorized(false); setVerificationResult(null); };
  return { authorized, verificationResult, verify, clear };
}

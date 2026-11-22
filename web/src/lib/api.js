import { mockApi } from '../mocks/index.js';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

async function request(path, { method = 'GET', body, adminKey } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const e = new Error('Sin conexión con el servidor');
    e.code = 'NETWORK';
    throw e;
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new Error(data?.error?.message ?? 'Error del servidor');
    e.code = data?.error?.code ?? 'UNKNOWN';
    throw e;
  }
  return data;
}

const id = (value) => encodeURIComponent(value);

const real = {
  getAssets: () => request('/assets'),
  getAsset: (assetId) => request(`/assets/${id(assetId)}`),
  createDemoInvestor: (body) => request('/investors/demo', { method: 'POST', body }),
  authorize: (body) => request('/authorize', { method: 'POST', body }),
  buy: (body) => request('/buy', { method: 'POST', body }),
  getPortfolio: (investorId) => request(`/portfolio/${id(investorId)}`),
  distribute: (body, adminKey) => request('/distribute', { method: 'POST', body, adminKey }),
  getTrace: (assetId) => request(`/trace/${id(assetId)}`),
  addTrace: (body, adminKey) => request('/trace', { method: 'POST', body, adminKey }),
};

export const api = USE_MOCKS ? mockApi : real;

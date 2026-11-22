import { mockApi } from '../mocks/index.js';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

async function request(path, { method = 'GET', body, adminKey } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, { method, headers: { 'content-type': 'application/json', ...(adminKey ? { 'x-admin-key': adminKey } : {}) }, body: body ? JSON.stringify(body) : undefined });
  } catch { const error = new Error('Sin conexión con el servidor'); error.code = 'NETWORK'; throw error; }
  const data = await response.json().catch(() => null);
  if (!response.ok) { const error = new Error(data?.error?.message ?? 'Error del servidor'); error.code = data?.error?.code ?? 'UNKNOWN'; throw error; }
  return data;
}

const real = {
  getAssets: () => request('/assets'), getAsset: (id) => request(`/assets/${id}`),
  createDemoInvestor: (body) => request('/investors/demo', { method: 'POST', body }),
  authorize: (body) => request('/authorize', { method: 'POST', body }), buy: (body) => request('/buy', { method: 'POST', body }),
  getPortfolio: (id) => request(`/portfolio/${id}`), distribute: (body, adminKey) => request('/distribute', { method: 'POST', body, adminKey }),
  getTrace: (id) => request(`/trace/${id}`), addTrace: (body, adminKey) => request('/trace', { method: 'POST', body, adminKey }),
};
export const api = USE_MOCKS ? mockApi : real;

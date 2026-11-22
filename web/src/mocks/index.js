const SCALE = 10_000_000n;
const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TRACE_TYPES = ['siembra', 'insumos', 'cosecha', 'almacenaje', 'venta'];
const INITIAL_USDC = '1000.0000000';

export const MOCK_ADMIN_KEY = 'siembra-demo';

function randomBytes(length) {
  return crypto.getRandomValues(new Uint8Array(length));
}

const fakeHash = () => Array.from(randomBytes(32), (byte) => byte.toString(16).padStart(2, '0')).join('');
const fakeKey = () => `G${Array.from(randomBytes(55), (byte) => BASE32[byte % 32]).join('')}`;

function toUnits(value) {
  const match = /^(\d+)(?:\.(\d{1,7}))?$/.exec(String(value).trim());
  if (!match) return null;
  return BigInt(match[1]) * SCALE + BigInt((match[2] ?? '').padEnd(7, '0'));
}

function fromUnits(units) {
  return `${units / SCALE}.${(units % SCALE).toString().padStart(7, '0')}`;
}

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 300 + Math.floor(Math.random() * 301)));
const clone = (value) => structuredClone(value);
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ISSUER = fakeKey();

const assets = [
  {
    id: 'SILO01',
    name: 'Silo de acopio, Santa Cruz (ejemplo)',
    type: 'silo',
    vertical: 'agro',
    description: 'Infraestructura de acopio de granos. Datos de ejemplo.',
    location: 'Santa Cruz, Bolivia',
    imageUrl: null,
    totalFractions: 1000,
    soldFractions: 120,
    availableFractions: 880,
    pricePerFraction: '50.0000000',
    returnLabelSimulated: 'Renta de almacenaje simulada, pago periódico',
    status: 'active',
    issuer: ISSUER,
    simulated: true,
  },
  {
    id: 'SOYA01',
    name: 'Campaña de soya verano 2026/27, 200 ha (ejemplo)',
    type: 'campaign',
    vertical: 'agro',
    description: 'Financiamiento de una campaña de soya. Datos de ejemplo.',
    location: 'Santa Cruz, Bolivia',
    imageUrl: null,
    totalFractions: 2000,
    soldFractions: 640,
    availableFractions: 1360,
    pricePerFraction: '25.0000000',
    returnLabelSimulated: 'Pago único simulado al vender la cosecha',
    status: 'active',
    issuer: ISSUER,
    simulated: true,
  },
];

const trace = [
  { assetId: 'SOYA01', order: 1, type: 'siembra', title: 'Siembra completada', date: '2026-11-10', description: '200 ha sembradas. Dato de ejemplo.' },
  { assetId: 'SOYA01', order: 2, type: 'insumos', title: 'Insumos aplicados', date: '2026-11-25', description: 'Fertilización y control de plagas. Dato de ejemplo.' },
  { assetId: 'SILO01', order: 1, type: 'almacenaje', title: 'Ingreso de grano al silo', date: '2026-11-15', description: 'Primer lote almacenado. Dato de ejemplo.' },
].map((milestone, index) => ({
  id: `tr_${String(index + 1).padStart(3, '0')}`,
  ...milestone,
  hash: fakeHash(),
  txHash: fakeHash(),
  explorerUrl: null,
  verified: true,
  simulated: true,
}));

const investors = new Map();
const authorizations = new Set();
const holdings = new Map();
const returns = [];
let investorSequence = 1;

const findAsset = (assetId) => assets.find((asset) => asset.id === assetId);

function requireAsset(assetId) {
  return findAsset(assetId) ?? fail('NOT_FOUND', `El activo ${assetId} no existe.`);
}

function requireInvestor(investorId) {
  return investors.get(investorId) ?? fail('NOT_FOUND', `El inversionista ${investorId} no existe.`);
}

function requireAdmin(adminKey) {
  if (adminKey !== MOCK_ADMIN_KEY) fail('FORBIDDEN', 'Falta o es inválido el header x-admin-key.');
}

const holdingKey = (investorId, assetId) => `${investorId}:${assetId}`;

const publicInvestor = ({ investorId, name, publicKey, usdcBalance }) => ({
  investorId,
  name,
  publicKey,
  usdcBalance: fromUnits(usdcBalance),
});

export const mockApi = {
  async getAssets() {
    await wait();
    return clone(assets);
  },

  async getAsset(assetId) {
    await wait();
    const asset = requireAsset(assetId);
    return { ...clone(asset), traceCount: trace.filter((item) => item.assetId === asset.id).length };
  },

  async createDemoInvestor({ name, email } = {}) {
    await wait();
    if (!isText(name) || name.trim().length > 100) fail('VALIDATION', '"name" es obligatorio y debe ser texto.');
    if (!isText(email) || email.trim().length > 254 || !EMAIL.test(email.trim())) fail('VALIDATION', '"email" no es un correo válido.');
    const normalizedEmail = email.trim().toLowerCase();
    let investor = [...investors.values()].find((item) => item.email === normalizedEmail);
    if (!investor) {
      investor = {
        investorId: `inv_${String(investorSequence++).padStart(3, '0')}`,
        name: name.trim(),
        email: normalizedEmail,
        publicKey: fakeKey(),
        usdcBalance: toUnits(INITIAL_USDC),
      };
      investors.set(investor.investorId, investor);
    }
    return publicInvestor(investor);
  },

  async authorize({ investorId, assetId } = {}) {
    await wait();
    if (!isText(investorId) || !isText(assetId)) fail('VALIDATION', 'investorId y assetId son obligatorios.');
    const asset = requireAsset(assetId);
    const investor = requireInvestor(investorId);
    authorizations.add(holdingKey(investor.investorId, asset.id));
    return { authorized: true, assetId: asset.id, txHash: fakeHash(), explorerUrl: null, simulatedKyc: true };
  },

  async buy({ investorId, assetId, fractions } = {}) {
    await wait();
    if (!isText(investorId) || !isText(assetId)) fail('VALIDATION', 'investorId y assetId son obligatorios.');
    if (!Number.isInteger(fractions) || fractions < 1) fail('VALIDATION', 'fractions debe ser un entero mayor o igual a 1.');
    const asset = requireAsset(assetId);
    const investor = requireInvestor(investorId);
    if (fractions > asset.availableFractions) {
      fail('INSUFFICIENT_FRACTIONS', `Solo quedan ${asset.availableFractions} fracciones disponibles de ${asset.id}.`);
    }
    const key = holdingKey(investor.investorId, asset.id);
    if (!authorizations.has(key)) fail('NOT_AUTHORIZED', 'La wallet no está verificada para este activo.');
    const total = toUnits(asset.pricePerFraction) * BigInt(fractions);
    if (total > investor.usdcBalance) fail('INSUFFICIENT_USDC', 'Saldo de USDC insuficiente.');
    investor.usdcBalance -= total;
    asset.soldFractions += fractions;
    asset.availableFractions -= fractions;
    holdings.set(key, (holdings.get(key) ?? 0) + fractions);
    return { assetId: asset.id, fractions, totalUsdc: fromUnits(total), txHash: fakeHash(), explorerUrl: null };
  },

  async getPortfolio(investorId) {
    await wait();
    const investor = requireInvestor(investorId);
    const own = returns.filter((item) => item.investorId === investor.investorId);
    const owned = assets
      .filter((asset) => holdings.get(holdingKey(investor.investorId, asset.id)))
      .map((asset) => {
        const quantity = holdings.get(holdingKey(investor.investorId, asset.id));
        const received = own.filter((item) => item.assetId === asset.id).reduce((sum, item) => sum + toUnits(item.usdc), 0n);
        return {
          assetId: asset.id,
          name: asset.name,
          fractions: quantity,
          pricePerFraction: asset.pricePerFraction,
          valueUsdc: fromUnits(toUnits(asset.pricePerFraction) * BigInt(quantity)),
          returnsReceivedUsdc: fromUnits(received),
        };
      });
    return {
      investorId: investor.investorId,
      publicKey: investor.publicKey,
      usdcBalance: fromUnits(investor.usdcBalance),
      holdings: owned,
      returns: own.map(({ assetId, period, usdc, txHash }) => ({ assetId, period, usdc, txHash, explorerUrl: null })),
    };
  },

  async distribute({ assetId, totalUsdc, period } = {}, adminKey) {
    await wait();
    requireAdmin(adminKey);
    const total = toUnits(totalUsdc ?? '');
    if (!isText(assetId) || !total || total <= 0n || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period ?? '')) {
      fail('VALIDATION', 'Revisa activo, monto y período (AAAA-MM).');
    }
    const asset = requireAsset(assetId);
    const txHash = fakeHash();
    const payouts = [...investors.values()]
      .map((investor) => ({ investor, quantity: holdings.get(holdingKey(investor.investorId, asset.id)) ?? 0 }))
      .filter(({ quantity }) => quantity > 0)
      .map(({ investor, quantity }) => {
        const share = (total * BigInt(quantity)) / BigInt(asset.totalFractions);
        investor.usdcBalance += share;
        returns.push({ investorId: investor.investorId, assetId: asset.id, period, usdc: fromUnits(share), txHash });
        return { investorId: investor.investorId, publicKey: investor.publicKey, fractions: quantity, usdc: fromUnits(share) };
      });
    const txHashes = payouts.length ? [txHash] : [];
    return {
      assetId: asset.id,
      period,
      totalUsdc: fromUnits(total),
      simulated: true,
      payouts,
      txHashes,
      explorerUrls: txHashes.map(() => null),
    };
  },

  async getTrace(assetId) {
    await wait();
    const asset = requireAsset(assetId);
    return clone(trace.filter((item) => item.assetId === asset.id).sort((a, b) => a.order - b.order));
  },

  async addTrace({ assetId, type, title, date, description } = {}, adminKey) {
    await wait();
    requireAdmin(adminKey);
    if (!isText(assetId) || !TRACE_TYPES.includes(type) || !isText(title) || !isText(description) || !/^\d{4}-\d{2}-\d{2}$/.test(date ?? '')) {
      fail('VALIDATION', 'Revisa los datos del hito.');
    }
    const asset = requireAsset(assetId);
    const existing = trace.filter((item) => item.assetId === asset.id);
    const milestone = {
      id: `tr_${String(trace.length + 1).padStart(3, '0')}`,
      assetId: asset.id,
      type,
      title: title.trim(),
      date,
      description: description.trim(),
      order: (existing.at(-1)?.order ?? 0) + 1,
      hash: fakeHash(),
      txHash: fakeHash(),
      explorerUrl: null,
      verified: true,
      simulated: true,
    };
    trace.push(milestone);
    return clone(milestone);
  },
};

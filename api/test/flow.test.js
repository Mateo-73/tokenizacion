import assert from 'node:assert/strict';

import { after, before, describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { createRuntime } from '../src/bootstrap.js';
import { loadConfig } from '../src/config.js';

const ADMIN = { 'x-admin-key': 'test-admin-key' };
let base = '';
let close = () => {};

async function call(method, path, body, headers = {}) {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, json: await res.json() };
}

before(async () => {
  const config = loadConfig({ MOCK_MODE: 'true', ADMIN_KEY: 'test-admin-key' });
  const { services } = await createRuntime(config);
  const server = createApp(config, services).listen(0);
  base = `http://localhost:${server.address().port}`;
  close = () => server.close();
});
after(() => close());

describe('API en modo mock (docs/04-api-contrato.md)', () => {
  let investorId = '';

  it('GET /health', async () => {
    const r = await call('GET', '/health');
    assert.deepEqual(r.json, { ok: true, mock: true });
  });

  it('GET /assets lista SILO01 y SOYA01 con fracciones vendidas', async () => {
    const r = await call('GET', '/assets');
    assert.equal(r.status, 200);
    const silo = r.json.find((a) => a.id === 'SILO01');
    assert.equal(silo.totalFractions, 1000);
    assert.equal(silo.soldFractions, 120);
    assert.equal(silo.availableFractions, 880);
    assert.equal(silo.simulated, true);
    assert.ok(r.json.some((a) => a.id === 'SOYA01'));
  });

  it('GET /assets/:id devuelve traceCount y 404 si no existe', async () => {
    assert.equal((await call('GET', '/assets/SOYA01')).json.traceCount, 2);
    const missing = await call('GET', '/assets/NOPE');
    assert.equal(missing.status, 404);
    assert.equal(missing.json.error.code, 'NOT_FOUND');
  });

  it('POST /investors/demo crea (201), recupera por email (200) y valida', async () => {
    const created = await call('POST', '/investors/demo', {
      name: 'Ana',
      email: 'ana@ejemplo.com',
    });
    assert.equal(created.status, 201);
    assert.equal(created.json.investorId, 'inv_001');
    assert.equal(created.json.usdcBalance, '1000.0000000');
    assert.equal(created.json.secret, undefined);
    investorId = created.json.investorId;

    const again = await call('POST', '/investors/demo', { name: 'Ana', email: 'ANA@ejemplo.com' });
    assert.equal(again.status, 200);
    assert.equal(again.json.investorId, investorId);

    const invalid = await call('POST', '/investors/demo', { name: 'Ana', email: 'no-es-correo' });
    assert.equal(invalid.status, 400);
    assert.equal(invalid.json.error.code, 'VALIDATION');
  });

  it('POST /buy sin verificar falla con NOT_AUTHORIZED', async () => {
    const r = await call('POST', '/buy', { investorId, assetId: 'SILO01', fractions: 10 });
    assert.equal(r.status, 403);
    assert.equal(r.json.error.code, 'NOT_AUTHORIZED');
  });

  it('POST /authorize (KYC simulado) y POST /buy compran fracciones', async () => {
    const auth = await call('POST', '/authorize', { investorId, assetId: 'SILO01' });
    assert.equal(auth.status, 200);
    assert.equal(auth.json.authorized, true);
    assert.equal(auth.json.simulatedKyc, true);
    assert.equal(auth.json.explorerUrl, null);

    const buy = await call('POST', '/buy', { investorId, assetId: 'SILO01', fractions: 10 });
    assert.equal(buy.status, 200);
    assert.equal(buy.json.totalUsdc, '500.0000000');
    assert.match(buy.json.txHash, /^[0-9a-f]{64}$/);
  });

  it('POST /buy valida fracciones, saldo y disponibilidad', async () => {
    const decimals = await call('POST', '/buy', { investorId, assetId: 'SILO01', fractions: 1.5 });
    assert.equal(decimals.json.error.code, 'VALIDATION');

    const noMoney = await call('POST', '/buy', { investorId, assetId: 'SILO01', fractions: 100 });
    assert.equal(noMoney.status, 400);
    assert.equal(noMoney.json.error.code, 'INSUFFICIENT_USDC');

    const soldOut = await call('POST', '/buy', { investorId, assetId: 'SILO01', fractions: 5000 });
    assert.equal(soldOut.status, 400);
    assert.equal(soldOut.json.error.code, 'INSUFFICIENT_FRACTIONS');
  });

  it('GET /portfolio refleja la compra', async () => {
    const r = await call('GET', `/portfolio/${investorId}`);
    assert.equal(r.status, 200);
    assert.equal(r.json.usdcBalance, '500.0000000');
    assert.equal(r.json.holdings.length, 1);
    assert.equal(r.json.holdings[0].fractions, 10);
    assert.equal(r.json.holdings[0].valueUsdc, '500.0000000');
    assert.equal(r.json.holdings[0].returnsReceivedUsdc, '0.0000000');
    assert.equal((await call('GET', '/portfolio/inv_999')).status, 404);
  });

  it('POST /distribute exige admin y reparte proporcional al total del activo', async () => {
    const body = { assetId: 'SILO01', totalUsdc: '2000', period: '2026-12' };
    const denied = await call('POST', '/distribute', body);
    assert.equal(denied.status, 403);
    assert.equal(denied.json.error.code, 'FORBIDDEN');

    const r = await call('POST', '/distribute', body, ADMIN);
    assert.equal(r.status, 200);
    assert.equal(r.json.simulated, true);
    assert.equal(r.json.totalUsdc, '2000.0000000');
    // Ana tiene 10 de 1000 fracciones -> 20 USDC; el inversionista de ejemplo, 120 -> 240 USDC.
    const ana = r.json.payouts.find((p) => p.investorId === investorId);
    assert.equal(ana.usdc, '20.0000000');
    const seed = r.json.payouts.find((p) => p.investorId === 'inv_ejemplo');
    assert.equal(seed.usdc, '240.0000000');

    const portfolio = await call('GET', `/portfolio/${investorId}`);
    assert.equal(portfolio.json.holdings[0].returnsReceivedUsdc, '20.0000000');
    assert.equal(portfolio.json.returns[0].period, '2026-12');
    assert.equal(portfolio.json.usdcBalance, '520.0000000');
  });

  it('POST /distribute valida el monto y el período', async () => {
    const badAmount = await call(
      'POST',
      '/distribute',
      { assetId: 'SILO01', totalUsdc: -5, period: '2026-12' },
      ADMIN,
    );
    assert.equal(badAmount.json.error.code, 'VALIDATION');
    const badPeriod = await call(
      'POST',
      '/distribute',
      { assetId: 'SILO01', totalUsdc: '10', period: '2026-13' },
      ADMIN,
    );
    assert.equal(badPeriod.json.error.code, 'VALIDATION');
  });

  it('GET /trace lista hitos verificados y POST /trace agrega uno con hash', async () => {
    const list = await call('GET', '/trace/SOYA01');
    assert.deepEqual(
      list.json.map((m) => m.order),
      [1, 2],
    );
    assert.ok(list.json.every((m) => m.verified === true && /^[0-9a-f]{64}$/.test(m.hash)));

    const input = {
      assetId: 'SOYA01',
      type: 'cosecha',
      title: 'Cosecha iniciada',
      date: '2027-03-15',
      description: 'Dato de ejemplo.',
    };
    assert.equal((await call('POST', '/trace', input)).status, 403);

    const added = await call('POST', '/trace', input, ADMIN);
    assert.equal(added.status, 201);
    assert.equal(added.json.order, 3);
    assert.equal(added.json.verified, true);
    assert.equal(added.json.simulated, true);

    const invalid = await call(
      'POST',
      '/trace',
      { ...input, type: 'otro', date: '2027-02-30' },
      ADMIN,
    );
    assert.equal(invalid.status, 400);
    assert.equal((await call('GET', '/trace/NOPE')).status, 404);
  });

  it('rutas inexistentes y JSON inválido devuelven el error uniforme', async () => {
    const missing = await call('GET', '/no-existe');
    assert.equal(missing.status, 404);
    assert.equal(missing.json.error.code, 'NOT_FOUND');

    const res = await fetch(`${base}/api/buy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{roto',
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'VALIDATION');
  });
});

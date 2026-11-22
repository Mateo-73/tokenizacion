import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { createStore, readSeed } from '../src/data/db.js';
import { seedStellar } from '../src/seed.js';
import { createMockStellar } from '../src/services/mock-stellar.js';
import { hashTrace } from '../src/trace-hash.js';

let dir;
let dbPath;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'siembra-db-'));
  dbPath = join(dir, 'data', 'db.json');
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const investor = (id, email = `${id}@ejemplo.com`) => ({
  id,
  name: id,
  email,
  publicKey: `G${id}`,
  secret: `S${id}`,
  authorizedAssets: [],
  createdAt: '2026-11-21T10:00:00.000Z',
});

describe('semilla (docs/05)', () => {
  it('se versiona sin claves, sin inversionistas, sin retornos y sin hashes', () => {
    const seed = readSeed();
    assert.deepEqual(seed.investors, []);
    assert.deepEqual(seed.returns, []);
    assert.deepEqual(
      seed.assets.map((a) => a.id),
      ['SILO01', 'SOYA01'],
    );
    assert.equal(seed.trace.length, 3);
    for (const milestone of seed.trace) {
      assert.equal(milestone.hash, null);
      assert.equal(milestone.txHash, null);
      assert.equal(milestone.simulated, true);
    }
    assert.ok(
      !/\bS[A-Z2-7]{55}\b/.test(JSON.stringify(seed)),
      'la semilla no debe contener claves secretas',
    );
  });
});

describe('persistencia en db.json', () => {
  it('crea db.json desde la semilla con permiso solo para el dueño', () => {
    const store = createStore({ dbPath });
    assert.ok(existsSync(dbPath));
    assert.equal(statSync(dbPath).mode & 0o777, 0o600);
    assert.deepEqual(
      store.assets().map((a) => a.id),
      ['SILO01', 'SOYA01'],
    );
    assert.equal(store.traceFor('SOYA01').length, 2);
  });

  it('lo guardado sobrevive a un reinicio (otra instancia lee el mismo archivo)', () => {
    const first = createStore({ dbPath });
    first.addInvestor(investor('inv_001'));
    first.markAuthorized('inv_001', 'SILO01');
    first.addReturn({
      assetId: 'SILO01',
      period: '2026-12',
      totalUsdc: '100.0000000',
      payouts: [
        {
          investorId: 'inv_001',
          publicKey: 'Ginv_001',
          fractions: 10,
          usdc: '1.0000000',
          txHash: 'abc',
        },
      ],
      txHashes: ['abc'],
      simulated: true,
    });

    const second = createStore({ dbPath });
    const found = second.findInvestorById('inv_001');
    assert.equal(
      found.secret,
      'Sinv_001',
      'la clave demo se conserva para poder firmar tras reiniciar',
    );
    assert.deepEqual(found.authorizedAssets, ['SILO01']);
    assert.deepEqual(second.returnsFor('inv_001'), [
      { assetId: 'SILO01', period: '2026-12', usdc: '1.0000000', txHash: 'abc' },
    ]);
    assert.equal(second.findInvestorByEmail('inv_001@ejemplo.com').id, 'inv_001');
    assert.equal(second.findInvestorByPublicKey('Ginv_001').id, 'inv_001');
  });

  it('los ids continúan tras reiniciar y no se repiten', () => {
    const first = createStore({ dbPath });
    assert.equal(first.nextInvestorId(), 'inv_001');
    first.addInvestor(investor('inv_001'));
    first.addInvestor(investor('inv_ejemplo')); // id no numérico: no cuenta para el contador
    first.addInvestor(investor('inv_007'));

    const second = createStore({ dbPath });
    assert.equal(second.nextInvestorId(), 'inv_008');
    assert.equal(second.nextTraceId(), 'tr_004'); // la semilla trae tr_001..tr_003
    assert.equal(
      second.addReturn({
        assetId: 'SILO01',
        period: '2026-12',
        totalUsdc: '1',
        payouts: [],
        txHashes: [],
        simulated: true,
      }).id,
      'ret_001',
    );
  });

  it('la escritura es atómica: no deja archivos temporales y el JSON siempre es válido', () => {
    const store = createStore({ dbPath });
    for (let i = 1; i <= 25; i++) store.addInvestor(investor(`inv_${String(i).padStart(3, '0')}`));
    assert.deepEqual(readdirSync(join(dir, 'data')), ['db.json']);
    assert.equal(JSON.parse(readFileSync(dbPath, 'utf8')).investors.length, 25);
  });

  it('un db.json corrupto da un error claro', () => {
    createStore({ dbPath });
    writeFileSync(dbPath, '{roto');
    assert.throws(() => createStore({ dbPath }), /no es un JSON válido/);
  });

  it('el modo mock (persist: false) nunca crea ni toca db.json', () => {
    const store = createStore({ dbPath, persist: false });
    store.addInvestor(investor('inv_001'));
    assert.ok(!existsSync(dbPath), 'no debe crear el archivo');
    assert.ok(!existsSync(join(dir, 'data')), 'ni su carpeta');
  });

  it('pendingTrace vuelve a incluir un hito con hash pero sin txHash', () => {
    const store = createStore({ dbPath: join(dir, 'y.json'), persist: false });
    store.addTrace({
      id: 'tr_900',
      assetId: 'SILO01',
      order: 9,
      type: 'siembra',
      title: 'Hito sin txHash',
      date: '2026-01-01',
      description: 'Dato de ejemplo.',
      hash: 'ab'.repeat(32),
      txHash: null,
      simulated: true,
    });
    const pending = () => store.pendingTrace().map((item) => item.id);
    assert.ok(pending().includes('tr_900'));
    store.setTraceHash('tr_900', { hash: 'ab'.repeat(32), txHash: 'tx_recuperado' });
    assert.ok(!pending().includes('tr_900'));
  });
});

describe('seedStellar (docs/09 §11)', () => {
  it('emite los activos y registra los hitos pendientes; repetirlo no registra nada', async () => {
    const stellar = createMockStellar();
    const store = createStore({ dbPath: join(dir, 'x.json'), persist: false });

    const first = await seedStellar({ stellar, store });
    assert.equal(first.assets.length, 2);
    assert.equal(first.trace.length, 3);
    assert.equal(store.pendingTrace().length, 0);
    for (const milestone of store.traceFor('SOYA01')) {
      assert.equal(milestone.hash, hashTrace(milestone));
      assert.ok(
        await stellar.verifyTrace({
          assetId: 'SOYA01',
          order: milestone.order,
          hash: milestone.hash,
        }),
      );
    }

    const second = await seedStellar({ stellar, store });
    assert.equal(second.trace.length, 0, 'los hitos ya registrados no se vuelven a registrar');
  });
});

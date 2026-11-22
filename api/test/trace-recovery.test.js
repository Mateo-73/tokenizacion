import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { findRecordedTxHash } from '../src/stellar/trace.js';

// La recuperación del txHash se prueba sin red ni claves: solo respondemos como Horizon.
const ACCOUNT = 'GTESTACCOUNT';
const HORIZON = 'https://horizon.testnet.local';
const NAME = 't.SILO01.1';
const HASH = 'ab'.repeat(32);
const VALUE = Buffer.from(HASH, 'hex').toString('base64');

const effect = (name, value, id = 1) => ({
  type: 'data_created',
  name,
  value,
  _links: { operation: { href: `${HORIZON}/operations/${id}` } },
});

describe('findRecordedTxHash (db.json nuevo sin txHash)', () => {
  const originalFetch = globalThis.fetch;

  before(() => {
    globalThis.fetch = () => {
      throw new Error('fetch no configurado en esta prueba');
    };
  });

  after(() => {
    globalThis.fetch = originalFetch;
  });

  it('recupera el txHash del efecto que coincide con el nombre y el hash', async () => {
    const called = [];
    globalThis.fetch = async (url) => {
      const href = String(url);
      called.push(href);
      if (href.includes('/effects')) {
        return {
          ok: true,
          json: async () => ({
            _embedded: {
              records: [effect('t.SILO01.2', 'otro', 99), effect(NAME, VALUE, 42)],
            },
            _links: {},
          }),
        };
      }
      return { ok: true, json: async () => ({ transaction_hash: 'tx_recuperado' }) };
    };

    const txHash = await findRecordedTxHash(NAME, HASH, ACCOUNT, HORIZON);
    assert.equal(txHash, 'tx_recuperado');
    assert.equal(called.length, 2, 'solo consulta la operación del efecto que coincide');
    assert.ok(called[1].endsWith('/operations/42'));
  });

  it('devuelve null si no hay un efecto con ese hash', async () => {
    globalThis.fetch = async (url) => ({
      ok: true,
      json: async () => ({
        _embedded: { records: [effect(NAME, 'otro-valor')] },
        _links: {},
      }),
    });

    assert.equal(await findRecordedTxHash(NAME, HASH, ACCOUNT, HORIZON), null);
  });

  it('devuelve null si Horizon no responde', async () => {
    globalThis.fetch = async () => {
      throw new Error('sin conexión');
    };

    assert.equal(await findRecordedTxHash(NAME, HASH, ACCOUNT, HORIZON), null);
  });
});

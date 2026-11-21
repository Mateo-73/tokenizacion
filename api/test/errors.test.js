import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { AppError, HTTP_STATUS, toAppError } from '../src/errors.js';

describe('errores (docs/04 y docs/09 §4)', () => {
  it('estados HTTP del contrato', () => {
    assert.deepEqual(HTTP_STATUS, {
      VALIDATION: 400,
      FORBIDDEN: 403,
      NOT_AUTHORIZED: 403,
      NOT_FOUND: 404,
      INSUFFICIENT_FRACTIONS: 400,
      INSUFFICIENT_USDC: 400,
      STELLAR_ERROR: 502,
    });
  });

  it('un error de stellar/ con .code conserva su código y mensaje', () => {
    const err = Object.assign(new Error('Saldo de USDC insuficiente.'), {
      code: 'INSUFFICIENT_USDC',
    });
    const mapped = toAppError(err);
    assert.equal(mapped.code, 'INSUFFICIENT_USDC');
    assert.equal(mapped.message, 'Saldo de USDC insuficiente.');
  });

  it('un error inesperado se responde como STELLAR_ERROR 502 sin filtrar el detalle', async (t) => {
    t.mock.method(console, 'error', () => {});
    const config = loadConfig({ MOCK_MODE: 'true', ADMIN_KEY: 'k' });
    const failing = {
      assets: {
        list: async () => {
          throw new TypeError('detalle interno con SECRETO-123');
        },
      },
    };
    const server = createApp(config, failing).listen(0);
    try {
      const res = await fetch(`http://localhost:${server.address().port}/api/assets`);
      const body = await res.json();
      assert.equal(res.status, 502);
      assert.deepEqual(body, {
        error: { code: 'STELLAR_ERROR', message: 'Error al comunicarse con Stellar' },
      });
      assert.ok(!JSON.stringify(body).includes('SECRETO-123'));
    } finally {
      server.close();
    }
  });

  it('un AppError ya construido se devuelve tal cual', () => {
    const err = new AppError('NOT_FOUND', 'No existe.');
    assert.equal(toAppError(err), err);
  });
});

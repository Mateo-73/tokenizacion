import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockStellar } from '../src/services/mock-stellar.js';
import { STELLAR_PORT_METHODS } from '../src/services/stellar-port.js';
import * as real from '../src/stellar/index.js';

// Sin red ni claves: solo comprueba que mock y capa real exponen el mismo contrato.
describe('StellarPort (docs/03 §5)', () => {
  const mock = createMockStellar();

  for (const method of STELLAR_PORT_METHODS) {
    it(`${method} existe en el mock y en la capa real`, () => {
      assert.equal(typeof mock[method], 'function', `falta ${method} en mock-stellar.js`);
      assert.equal(typeof real[method], 'function', `falta ${method} en stellar/index.js`);
    });
  }

  it('la capa real no exporta funciones que el contrato no conoce, salvo las de setup', () => {
    const extras = Object.keys(real).filter(
      (name) => !STELLAR_PORT_METHODS.includes(name) && name !== 'setupAccounts',
    );
    assert.deepEqual(extras, []);
  });
});

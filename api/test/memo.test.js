import assert from 'node:assert/strict';
import { Memo } from '@stellar/stellar-sdk';
import { describe, it } from 'node:test';
import { shortMemo } from '../src/stellar/client.js';

// El memo es la única "etiqueta" legible que muestra StellarExpert junto al hash de una tx.
describe('shortMemo (alias legible en el explorador)', () => {
  it('respeta las etiquetas cortas del API', () => {
    assert.equal(shortMemo('SIEMBRA COMPRA SILO01 1x'), 'SIEMBRA COMPRA SILO01 1x');
    assert.equal(shortMemo('SIEMBRA HITO SOYA01 2'), 'SIEMBRA HITO SOYA01 2');
  });

  it('recorta a 28 bytes, el máximo de un memo de texto de Stellar', () => {
    const memo = shortMemo('X'.repeat(60));
    assert.equal(memo.length, 28);
    assert.doesNotThrow(() => Memo.text(memo));
  });

  it('no parte caracteres multibyte: reemplaza no-ASCII por espacio', () => {
    const memo = shortMemo('ñ'.repeat(40));
    assert.equal(memo, ' '.repeat(28));
    assert.doesNotThrow(() => Memo.text(memo));
  });
});

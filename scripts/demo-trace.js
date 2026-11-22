// Prueba de la trazabilidad (S6): registra el hash de un hito en la cuenta ISSUER, lo verifica, y
// comprueba que cambiar el texto del hito hace fallar la verificación.
// Usa un activo de pruebas (TEST01) con un orden aleatorio, y al final BORRA su entrada de datos,
// así que no toca la trazabilidad real de SILO01 ni SOYA01.
// Uso: npm run demo:trace
import { hashTrace } from '../api/src/trace-hash.js';
import { explorerTx, loadAccount } from '../api/src/stellar/client.js';
import { loadKeys } from '../api/src/stellar/keys.js';
import {
  deleteTraceEntry,
  recordTrace,
  traceEntryName,
  verifyTrace,
} from '../api/src/stellar/trace.js';

let failures = 0;
const check = (ok, message) => {
  console.log(`  ${ok ? '✓' : '✗'} ${message}`);
  if (!ok) failures += 1;
};

async function expectError(code, run) {
  try {
    await run();
    return false;
  } catch (err) {
    return err?.code === code;
  }
}

const order = 100000 + Math.floor(Math.random() * 900000);
const milestone = {
  assetId: 'TEST01',
  type: 'siembra',
  title: 'Siembra completada',
  date: '2026-11-10',
  description: '200 ha sembradas. Dato de ejemplo.',
};
const name = traceEntryName(milestone.assetId, order);
const issuer = loadKeys().ISSUER;

try {
  console.log(`1. Registrar el hito en Stellar (entrada "${name}" de la cuenta ISSUER)`);
  const expectedHash = hashTrace(milestone);
  const recorded = await recordTrace({ ...milestone, order });
  console.log(`   hash: ${recorded.hash}`);
  console.log(`   ${explorerTx(recorded.txHash)}`);
  check(
    recorded.hash === expectedHash && /^[0-9a-f]{64}$/.test(recorded.hash),
    'el hash es SHA-256 (64 hex) y coincide con el calculado',
  );

  console.log('\n2. Lo que dice la red (Horizon)');
  const account = await loadAccount(issuer.publicKey());
  const onChain = Buffer.from(account.data_attr[name] ?? '', 'base64').toString('hex');
  check(onChain === expectedHash, `la entrada de datos de ${name} guarda el mismo hash`);

  console.log('\n3. Verificación');
  check(
    await verifyTrace({ assetId: milestone.assetId, order, hash: expectedHash }),
    'hito intacto → verified: true',
  );
  const tampered = hashTrace({ ...milestone, description: '220 ha sembradas. Dato de ejemplo.' });
  check(
    !(await verifyTrace({ assetId: milestone.assetId, order, hash: tampered })),
    'texto editado (200 → 220 ha) → verified: false',
  );
  check(
    !(await verifyTrace({ assetId: milestone.assetId, order: order + 1, hash: expectedHash })),
    'hito que nunca se registró → verified: false',
  );

  console.log('\n4. Reglas de escritura');
  const again = await recordTrace({ ...milestone, order });
  check(
    again.hash === expectedHash && again.txHash === null,
    'registrar el mismo hito otra vez no escribe nada (txHash null)',
  );
  check(
    await expectError('VALIDATION', () =>
      recordTrace({ ...milestone, description: 'Otro contenido', order }),
    ),
    'registrar OTRO contenido en el mismo orden → VALIDATION (no se sobrescribe)',
  );
  check(
    await verifyTrace({ assetId: milestone.assetId, order, hash: expectedHash }),
    'tras el intento de sobrescribir, el hash original sigue intacto',
  );
} catch (err) {
  console.error('\nFalló:', err instanceof Error ? err.message : err);
  failures += 1;
} finally {
  // Limpieza: borrar la entrada de prueba (manageData con valor null) para liberar la reserva
  try {
    const { txHash } = await deleteTraceEntry({ assetId: milestone.assetId, order });
    if (txHash) {
      const cleaned = await loadAccount(issuer.publicKey());
      console.log('\n5. Limpieza');
      check(cleaned.data_attr[name] === undefined, `entrada de prueba ${name} borrada`);
    }
  } catch (err) {
    console.error('No se pudo borrar la entrada de prueba:', err.message);
    failures += 1;
  }
  console.log(failures === 0 ? '\nTodo correcto.' : `\n${failures} comprobación(es) fallaron.`);
  process.exitCode = failures === 0 ? 0 : 1;
}

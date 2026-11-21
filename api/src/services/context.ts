import type { Config } from '../config.js';
import type { Store } from '../data/store.js';
import type { StellarPort } from './stellar-port.js';

/** Dependencias compartidas por todos los servicios. */
export interface Context {
  config: Config;
  stellar: StellarPort;
  store: Store;
}

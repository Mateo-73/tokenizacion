import type { Investor, ReturnRecord, TraceMilestone } from '../types.js';

// Almacén en memoria con la misma forma que tendrá api/data/db.json.
// Guarda solo lo que Stellar no guarda (docs/tecnico/01): hitos, inversionistas demo y retornos pagados.
// TODO: persistir en api/data/db.json (está en .gitignore).
export interface Store {
  findInvestorById(investorId: string): Investor | undefined;
  findInvestorByEmail(email: string): Investor | undefined;
  findInvestorByPublicKey(publicKey: string): Investor | undefined;
  addInvestor(investor: Investor): void;
  nextInvestorId(): string;

  traceFor(assetId: string): TraceMilestone[];
  addTrace(milestone: TraceMilestone): void;
  nextTraceId(): string;

  addReturn(record: ReturnRecord): void;
  returnsFor(investorId: string): ReturnRecord[];
}

export function createStore(): Store {
  const investors: Investor[] = [];
  const trace: TraceMilestone[] = [];
  const returns: ReturnRecord[] = [];
  let investorSeq = 0;
  let traceSeq = 0;

  const pad = (n: number) => String(n).padStart(3, '0');

  return {
    findInvestorById: (id) => investors.find((i) => i.investorId === id),
    findInvestorByEmail: (email) => investors.find((i) => i.email === email),
    findInvestorByPublicKey: (key) => investors.find((i) => i.publicKey === key),
    addInvestor: (investor) => void investors.push(investor),
    nextInvestorId: () => `inv_${pad(++investorSeq)}`,

    traceFor: (assetId) =>
      trace.filter((m) => m.assetId === assetId).sort((a, b) => a.order - b.order),
    addTrace: (milestone) => void trace.push(milestone),
    nextTraceId: () => `tr_${pad(++traceSeq)}`,

    addReturn: (record) => void returns.push(record),
    returnsFor: (investorId) => returns.filter((r) => r.investorId === investorId),
  };
}

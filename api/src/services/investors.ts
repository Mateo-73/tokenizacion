import { AppError } from '../errors.js';
import type { Investor } from '../types.js';
import type { Context } from './context.js';

const DEMO_USDC = '1000.0000000';

export interface InvestorDto {
  investorId: string;
  name: string;
  publicKey: string;
  usdcBalance: string;
}

export function createInvestorsService(ctx: Context) {
  // Evita crear dos cuentas si llegan dos peticiones con el mismo email a la vez.
  const pending = new Map<string, Promise<Investor>>();

  async function toDto(investor: Investor): Promise<InvestorDto> {
    const { usdcBalance } = await ctx.stellar.getPortfolio({ publicKey: investor.publicKey });
    return {
      investorId: investor.investorId,
      name: investor.name,
      publicKey: investor.publicKey,
      usdcBalance,
    };
  }

  async function create(name: string, email: string): Promise<Investor> {
    const { publicKey, secret } = await ctx.stellar.createDemoInvestor({ initialUsdc: DEMO_USDC });
    const investor: Investor = {
      investorId: ctx.store.nextInvestorId(),
      name,
      email,
      publicKey,
      secret,
    };
    ctx.store.addInvestor(investor);
    return investor;
  }

  return {
    /** Crea (201) o recupera por email (200) un inversionista demo custodial (Plan B). */
    async createDemo(input: { name: string; email: string }) {
      const email = input.email.toLowerCase();

      const existing = ctx.store.findInvestorByEmail(email);
      if (existing) return { created: false, investor: await toDto(existing) };

      let creation = pending.get(email);
      if (!creation) {
        creation = create(input.name, email).finally(() => pending.delete(email));
        pending.set(email, creation);
      }
      return { created: true, investor: await toDto(await creation) };
    },

    require(investorId: string): Investor {
      const investor = ctx.store.findInvestorById(investorId);
      if (!investor) throw new AppError('NOT_FOUND', `No existe el inversionista ${investorId}.`);
      return investor;
    },
  };
}

import { AppError } from '../errors.js';

const DEMO_USDC = '1000.0000000';

export function createInvestorsService(ctx) {
  // Evita crear dos cuentas si llegan dos peticiones con el mismo email a la vez.
  const pending = new Map();

  async function toDto(investor) {
    const { usdcBalance } = await ctx.stellar.getPortfolio({ publicKey: investor.publicKey });
    return {
      investorId: investor.id,
      name: investor.name,
      publicKey: investor.publicKey,
      usdcBalance,
    };
  }

  async function create(name, email) {
    const { publicKey, secret } = await ctx.stellar.createDemoInvestor({ initialUsdc: DEMO_USDC });
    // Sin `await` entre pedir el id y guardar, para que dos altas simultáneas no repitan id.
    const investor = {
      id: ctx.store.nextInvestorId(),
      name,
      email,
      publicKey,
      secret,
      authorizedAssets: [],
      createdAt: new Date().toISOString(),
    };
    ctx.store.addInvestor(investor);
    return investor;
  }

  return {
    /** Crea (201) o recupera por email (200) un inversionista demo custodial (Plan B). */
    async createDemo(input) {
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

    require(investorId) {
      const investor = ctx.store.findInvestorById(investorId);
      if (!investor) throw new AppError('NOT_FOUND', `No existe el inversionista ${investorId}.`);
      return investor;
    },
  };
}

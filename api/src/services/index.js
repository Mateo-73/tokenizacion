import { createAssetsService } from './assets.js';

import { createInvestorsService } from './investors.js';
import { createPortfolioService } from './portfolio.js';
import { createReturnsService } from './returns.js';
import { createTraceService } from './trace.js';
import { createTradingService } from './trading.js';

export function createServices(ctx) {
  const assets = createAssetsService(ctx);
  const investors = createInvestorsService(ctx);
  return {
    assets,
    investors,
    trading: createTradingService(ctx, { assets, investors }),
    portfolio: createPortfolioService(ctx, { investors }),
    returns: createReturnsService(ctx, { assets }),
    trace: createTraceService(ctx, { assets }),
  };
}

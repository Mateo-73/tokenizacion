import { Router } from 'express';
import type { Config } from '../config.js';
import type { Services } from '../services/index.js';
import { requireAdmin } from './admin.js';
import {
  asBody,
  email,
  isoDate,
  oneOf,
  period,
  positiveAmount,
  positiveInt,
  text,
} from './validation.js';
import { TRACE_TYPES } from '../types.js';

/**
 * Capa HTTP: valida la petición y delega en services/. Endpoints de docs/tecnico/04-api-contrato.md.
 * No conoce Stellar ni la base de datos.
 */
export function createApiRouter(config: Config, services: Services): Router {
  const router = Router();
  const admin = requireAdmin(config.adminKey);

  router.get('/health', (_req, res) => {
    res.json({ ok: true, mock: config.mockMode });
  });

  // Activos
  router.get('/assets', async (_req, res) => {
    res.json(await services.assets.list());
  });
  router.get('/assets/:id', async (req, res) => {
    res.json(await services.assets.get(req.params.id));
  });

  // Inversionistas demo (Plan B)
  router.post('/investors/demo', async (req, res) => {
    const body = asBody(req.body);
    const { created, investor } = await services.investors.createDemo({
      name: text(body, 'name', 100),
      email: email(body, 'email'),
    });
    res.status(created ? 201 : 200).json(investor);
  });

  // KYC simulado y compra
  router.post('/authorize', async (req, res) => {
    const body = asBody(req.body);
    res.json(
      await services.trading.authorize({
        investorId: text(body, 'investorId'),
        assetId: text(body, 'assetId'),
      }),
    );
  });
  router.post('/buy', async (req, res) => {
    const body = asBody(req.body);
    res.json(
      await services.trading.buy({
        investorId: text(body, 'investorId'),
        assetId: text(body, 'assetId'),
        fractions: positiveInt(body, 'fractions'),
      }),
    );
  });

  // Portafolio
  router.get('/portfolio/:investorId', async (req, res) => {
    res.json(await services.portfolio.get(req.params.investorId));
  });

  // Reparto de retornos (admin)
  router.post('/distribute', admin, async (req, res) => {
    const body = asBody(req.body);
    res.json(
      await services.returns.distribute({
        assetId: text(body, 'assetId'),
        totalUsdc: positiveAmount(body, 'totalUsdc'),
        period: period(body, 'period'),
      }),
    );
  });

  // Trazabilidad
  router.get('/trace/:assetId', async (req, res) => {
    res.json(await services.trace.list(req.params.assetId));
  });
  router.post('/trace', admin, async (req, res) => {
    const body = asBody(req.body);
    const milestone = await services.trace.add({
      assetId: text(body, 'assetId'),
      type: oneOf(body, 'type', TRACE_TYPES),
      title: text(body, 'title', 120),
      date: isoDate(body, 'date'),
      description: text(body, 'description', 500),
    });
    res.status(201).json(milestone);
  });

  return router;
}

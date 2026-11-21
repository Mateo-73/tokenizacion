import cors from 'cors';
import express, { type ErrorRequestHandler, type Express } from 'express';
import type { Config } from './config.js';
import { AppError, HTTP_STATUS, toAppError } from './errors.js';
import { createApiRouter } from './routes/index.js';
import type { Services } from './services/index.js';

export function createApp(config: Config, services: Services): Express {
  const app = express();

  app.use(cors({ origin: config.webOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', createApiRouter(config, services));

  app.use((_req, _res, next) => {
    next(new AppError('NOT_FOUND', 'Ruta no encontrada.'));
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    const appError = toAppError(err);
    if (appError.code === 'INTERNAL') console.error(err);
    res
      .status(HTTP_STATUS[appError.code])
      .json({ error: { code: appError.code, message: appError.message } });
  };
  app.use(onError);

  return app;
}

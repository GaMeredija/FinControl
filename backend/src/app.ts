import cors from 'cors';
import express from 'express';

import { env } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import { router } from './routes';

function parseCorsOrigins() {
  if (env.CORS_ORIGIN === '*') {
    return true;
  }

  return env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
}

export const app = express();

app.use(
  cors({
    origin: parseCorsOrigins(),
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  return res.status(200).json({
    data: {
      status: 'ok',
      dataProvider: env.DATA_PROVIDER,
      timestamp: new Date().toISOString(),
    },
    message: 'API online.',
  });
});

app.use(router);
app.use(errorHandler);

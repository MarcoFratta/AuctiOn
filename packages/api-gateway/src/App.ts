import express from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import { AuthServiceClient } from './services/AuthServiceClient';

import { config } from './configs/config';
import createAuthMiddleware from './middlewares/AuthMiddleware';
import logger from './utils/Logger';

const app = express();
const authService = new AuthServiceClient(config.authServiceUri);
const authMiddleware = createAuthMiddleware(authService);
logger.info(authMiddleware);

app.use(express.json());

app.use(
  '/auth',
  createProxyMiddleware({
    target: config.authServiceUri,
    changeOrigin: true,
    on: { proxyReq: fixRequestBody },
  }),
);

export default app;

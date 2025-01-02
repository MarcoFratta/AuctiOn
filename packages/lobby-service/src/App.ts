import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as fs from 'node:fs';
import path from 'node:path';
import { LobbyServiceImpl } from './services/LobbyServiceImpl';
import { LobbyController } from './controllers/LobbyController';
import { createLobbyRouter } from './routes/LobbyRoutes';
import { MongoLobbyRepo } from './repositories/MongoLobbyRepo';

const app = express();

// Check if swagger.json exists
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json');
if (fs.existsSync(swaggerPath)) {
  const doc = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(doc, {
      // customCssUrl: path.join(__dirname, "..", "css", "swaggerTheme.css"),
      // customfavIcon: path.join(__dirname, "..", "public", "logo.css"),
      customSiteTitle: 'Lobby Service API Documentation',
    })
  );
}
const repo = new MongoLobbyRepo();
const service = new LobbyServiceImpl(repo);
const controller = new LobbyController(service);

// Use the router
const router = createLobbyRouter(controller);
// Middleware
app.use(express.json());

// Routes
app.use('/lobby', router);
export default app;

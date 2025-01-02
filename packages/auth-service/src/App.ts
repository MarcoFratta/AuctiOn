<<<<<<< HEAD
import express from 'express'
import swaggerUi, { JsonObject } from 'swagger-ui-express'
import * as fs from 'node:fs'
import path from 'node:path'
import { AuthServiceImpl } from './services/AuthServiceImpl'
import { AuthController } from './controllers/AuthController'
import createRouter from './routes/Routes'
import { config } from './configs/config'
import { MongoAccountRepo } from './repositories/MongoAccountRepo'

const app = express()

// Check if swagger.json exists
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json')
if (fs.existsSync(swaggerPath)) {
    const doc: JsonObject = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'))
    app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(doc, {
            // customCssUrl: path.join(__dirname, "..", "css", "swaggerTheme.css"),
            // customfavIcon: path.join(__dirname, "..", "public", "logo.css"),
            customSiteTitle: 'Auth Service API Documentation',
        })
    )
}
const repo = new MongoAccountRepo()
const service = new AuthServiceImpl(
    config.userServiceUrl,
    config.jwtSecret,
    repo
)
const controller = new AuthController(service)

// Use the router
const router = createRouter(controller)
// Middleware
app.use(express.json())

// Routes
app.use('/auth', router)

export default app
=======
import express from 'express';
import swaggerUi, { JsonObject } from 'swagger-ui-express';
import * as fs from 'node:fs';
import path from 'node:path';
import { AuthServiceImpl } from './services/AuthServiceImpl';
import { AuthController } from './controllers/AuthController';
import createRouter from './routes/Routes';
import { config } from './configs/config';
import { MongoAccountRepo } from './repositories/MongoAccountRepo';

const app = express();

// Check if swagger.json exists
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.json');
if (fs.existsSync(swaggerPath)) {
  const doc: JsonObject = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(doc, {
      // customCssUrl: path.join(__dirname, "..", "css", "swaggerTheme.css"),
      // customfavIcon: path.join(__dirname, "..", "public", "logo.css"),
      customSiteTitle: 'Auth Service API Documentation',
    })
  );
}
const repo = new MongoAccountRepo();
const service = new AuthServiceImpl(config.userServiceUrl, config.jwtSecret, repo);
const controller = new AuthController(service);

// Use the router
const router = createRouter(controller);
// Middleware
app.use(express.json());

// Routes
app.use('/auth', router);

export default app;
>>>>>>> c774751 (chore: fix project structure bug)

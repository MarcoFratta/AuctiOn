import express from "express";
import {createUserRouter} from "./routes/UserRoutes";
import {UserService} from "./services/UserService";
import {UserController} from "./controllers/UserController";
import {MongooseUserRepository} from "./repositories/MongoUserRepo";
import {reverseUserConverter, userConverter} from "./utils/Converters";
import swaggerUi from 'swagger-ui-express'
import * as fs from "node:fs";
import path from "node:path";

const app = express();
// Initialize dependencies

app.use('/docs', swaggerUi.serve, swaggerUi.setup(
    JSON.parse(fs.readFileSync(path.join(__dirname, "..", "public", "swagger.json"), "utf-8"))));


export const repository = new MongooseUserRepository(userConverter, reverseUserConverter);
export const service = new UserService(repository);
export const controller = new UserController(service);

// Use the router
const router = createUserRouter(controller);
// Middleware
app.use(express.json());

// Routes
app.use("/users", router);

export default app
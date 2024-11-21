import express from "express";
import {createUserRouter} from "./routes/UserRoutes";
import {UserService} from "./services/UserService";
import {UserController} from "./controllers/UserController";
import {MockUserRepository} from "./repositories/MockUserRepository";

const app = express();
// Initialize dependencies
const repository = new MockUserRepository();
const service = new UserService(repository);
const controller = new UserController(service);

// Use the router
const router = createUserRouter(controller);
// Middleware
app.use(express.json());

// Routes
app.use("/users", router);

export default app
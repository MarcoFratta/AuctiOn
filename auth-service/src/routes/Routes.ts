import {Router} from "express";
import {AuthController} from "../controllers/AuthController";
import {validateRequestBody} from "../middlewares/ValidationMiddleware";
import {loginSchema, registerSchema} from "../schemas/AuthSchema";

export const createRouter = (c: AuthController) => {
    const router = Router();
    router.post("/login", validateRequestBody(loginSchema), c.login);
    router.post("/register", validateRequestBody(registerSchema), c.register);
    router.post("/validate", c.validateToken);
    return router;
}
export default createRouter;





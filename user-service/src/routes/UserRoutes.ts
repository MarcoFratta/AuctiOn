import express from 'express';
import { validateRequestBody } from "../middlewares/ValidationMiddleware";
import { UserSchema } from "../schemas/User";
import {UserController} from "../controllers/UserController";

export const createUserRouter = (
    controller: UserController
): express.Router => {
    const router = express.Router();

    // Routes
    router.get('/', controller.getUsers);
    router.get('/:id', controller.getUserById);
    router.post('/', validateRequestBody(UserSchema), controller.createUser);
    router.put('/:id', validateRequestBody(UserSchema), controller.updateUser);
    router.delete('/:id', controller.deleteUser);

    return router;
};

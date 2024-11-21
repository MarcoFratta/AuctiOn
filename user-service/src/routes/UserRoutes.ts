import express from 'express';
import { validateRequestBody } from "../middlewares/ValidationMiddleware";
import { UserSchema } from "../schemas/User";
import {UserController} from "../controllers/UserController";
import {GenericErrorMiddleware, UserErrorMiddleware} from "../middlewares/ErrorsMiddleware";

export const createUserRouter = (
    controller: UserController
): express.Router => {
    const router = express.Router();

    // Routes
    router.get('/', controller.getUsers, UserErrorMiddleware, GenericErrorMiddleware );
    router.get('/:id', controller.getUserById, UserErrorMiddleware, GenericErrorMiddleware);
    router.post('/', validateRequestBody(UserSchema), controller.createUser, UserErrorMiddleware, GenericErrorMiddleware);
    router.put('/:id', validateRequestBody(UserSchema), controller.updateUser, UserErrorMiddleware, GenericErrorMiddleware);
    router.delete('/:id', controller.deleteUser, UserErrorMiddleware, GenericErrorMiddleware);

    return router;
};

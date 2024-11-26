import express from 'express';
import {validateRequestBody, validateRequestParams} from "../middlewares/ValidationMiddleware";
import {UserID, UserSchema} from "../schemas/User";
import {UserController} from "../controllers/UserController";
import {ErrorLoggerMiddleware, GenericErrorMiddleware, UserErrorMiddleware} from "../middlewares/ErrorsMiddleware";


export const createUserRouter = (controller: UserController): express.Router => {
    const router = express.Router();

    // Routes
    router.get('/', controller.getUsers,
        ErrorLoggerMiddleware, UserErrorMiddleware, GenericErrorMiddleware );
    router.get('/:id', validateRequestParams(UserID), controller.getUserById,
        ErrorLoggerMiddleware, UserErrorMiddleware, GenericErrorMiddleware);
    router.post('/', validateRequestBody(UserSchema), controller.createUser,
        ErrorLoggerMiddleware, UserErrorMiddleware, GenericErrorMiddleware);
    router.put('/:id', validateRequestBody(UserSchema), controller.updateUser,
        ErrorLoggerMiddleware, UserErrorMiddleware, GenericErrorMiddleware);
    router.delete('/:id', controller.deleteUser,
        ErrorLoggerMiddleware, UserErrorMiddleware, GenericErrorMiddleware);

    return router;
};

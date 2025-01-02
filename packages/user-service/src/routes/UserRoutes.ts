<<<<<<< HEAD
import express from 'express'
import {
    validateRequestBody,
    validateRequestParams,
} from '../middlewares/ValidationMiddleware'
import { userEmail, userId, userSchema } from '../schemas/User'
import { UserController } from '../controllers/UserController'
import {
    ErrorLoggerMiddleware,
    GenericErrorMiddleware,
    UserErrorMiddleware,
} from '../middlewares/ErrorsMiddleware'

export const createUserRouter = (
    controller: UserController
): express.Router => {
    const router = express.Router()

    // Routes
    router.get(
        '/',
        controller.getUsers,
        ErrorLoggerMiddleware,
        UserErrorMiddleware,
        GenericErrorMiddleware
    )
    router.get(
        '/:id',
        validateRequestParams(userId),
        controller.getUserById,
        ErrorLoggerMiddleware,
        UserErrorMiddleware,
        GenericErrorMiddleware
    )
    router.get(
        '/email/:email',
        validateRequestParams(userEmail),
        controller.getUserByEmail,
        ErrorLoggerMiddleware,
        UserErrorMiddleware,
        GenericErrorMiddleware
    )
    router.post(
        '/',
        validateRequestBody(userSchema),
        controller.createUser,
        ErrorLoggerMiddleware,
        UserErrorMiddleware,
        GenericErrorMiddleware
    )
    router.put(
        '/:id',
        validateRequestBody(userSchema.partial()),
        controller.updateUser,
        ErrorLoggerMiddleware,
        UserErrorMiddleware,
        GenericErrorMiddleware
    )
    router.delete(
        '/:id',
        controller.deleteUser,
        ErrorLoggerMiddleware,
        UserErrorMiddleware,
        GenericErrorMiddleware
    )

    return router
}
=======
import express from 'express';
import { validateRequestBody, validateRequestParams } from '../middlewares/ValidationMiddleware';
import { userEmail, userId, userSchema } from '../schemas/User';
import { UserController } from '../controllers/UserController';
import { ErrorLoggerMiddleware, GenericErrorMiddleware, UserErrorMiddleware } from '../middlewares/ErrorsMiddleware';

export const createUserRouter = (controller: UserController): express.Router => {
  const router = express.Router();

  // Routes
  router.get('/', controller.getUsers, ErrorLoggerMiddleware, UserErrorMiddleware, GenericErrorMiddleware);
  router.get(
    '/:id',
    validateRequestParams(userId),
    controller.getUserById,
    ErrorLoggerMiddleware,
    UserErrorMiddleware,
    GenericErrorMiddleware
  );
  router.get(
    '/email/:email',
    validateRequestParams(userEmail),
    controller.getUserByEmail,
    ErrorLoggerMiddleware,
    UserErrorMiddleware,
    GenericErrorMiddleware
  );
  router.post(
    '/',
    validateRequestBody(userSchema),
    controller.createUser,
    ErrorLoggerMiddleware,
    UserErrorMiddleware,
    GenericErrorMiddleware
  );
  router.put(
    '/:id',
    validateRequestBody(userSchema.partial()),
    controller.updateUser,
    ErrorLoggerMiddleware,
    UserErrorMiddleware,
    GenericErrorMiddleware
  );
  router.delete('/:id', controller.deleteUser, ErrorLoggerMiddleware, UserErrorMiddleware, GenericErrorMiddleware);

  return router;
};
>>>>>>> c774751 (chore: fix project structure bug)

import { Request, Response, NextFunction } from 'express';
import {
    UserNotFoundError,
    UpdateUserError,
    DeleteUserError,
} from '../errors/UserErrors';

export const ErrorLoggerMiddleware =  (
    err: unknown,
    _req: Request,
    _res: Response,
    next: NextFunction
): void => {
    console.error(err);
    next(err);
}
// Error handler middleware
export const UserErrorMiddleware = (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
): void => {

    if (err instanceof UserNotFoundError) {
         res.status(404).json({
            error: 'User Not Found',
            message: err.message,
        });
    }

    else if (err instanceof UpdateUserError) {
        res.status(400).json({
            error: 'Update User Error',
            message: err.message,
        });
    }

    else if (err instanceof DeleteUserError) {
        res.status(400).json({
            error: 'Delete User Error',
            message: err.message,
        });
    }
    else {
        next(err);
    }
};

export const GenericErrorMiddleware = (
    _err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.log("GenericErrorMiddleware");
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
    });
};
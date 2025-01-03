import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { validateSchema } from '../utils/Validator';
import { User, userSchema } from '../schemas/User';
import logger from '../utils/Logger';
import { config } from '../configs/config';
import { ServiceUnavailableError } from '../errors/LobbyErrors';

const AUTH_SERVICE_URL = config.authServiceUri;

export interface AuthenticatedRequest extends Request {
  user?: User; // Extend the Request type with user info
}

export const AuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the Bearer token from Authorization header

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
      });
      return;
    }

    // Validate the token using the Auth service
    const { data: response } = await axios.post(
      AUTH_SERVICE_URL + '/validate',
      { token: token },
    );
    // Extract user info from the auth service response
    // Add user information to the request object
    req.user = validateSchema(userSchema, response);
    next();
  } catch (error) {
    logger.error(error);
    if (axios.isAxiosError(error) || error instanceof ServiceUnavailableError) {
      res.status(503).json({
        error: 'Service Temporary Unavailable',
        message: 'Service is not responding',
      });
    } else {
      res.status(401).json({
        error: 'Unauthorized',
      });
    }
  }
};

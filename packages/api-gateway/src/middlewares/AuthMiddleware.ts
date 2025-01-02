<<<<<<< HEAD
import { NextFunction, Request, Response } from 'express'
import { AuthServiceClient } from '../services/AuthServiceClient'
import logger from '../utils/Logger'

const createAuthMiddleware = (service: AuthServiceClient) => {
    return (req: Request, res: Response, next: NextFunction) => {
        logger.info('AuthMiddleware: Checking token...')
    }
}

export default createAuthMiddleware
=======
import { NextFunction, Request, Response } from 'express';
import { AuthServiceClient } from '../services/AuthServiceClient';
import logger from '../utils/Logger';

const createAuthMiddleware = (service: AuthServiceClient) => {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info('AuthMiddleware: Checking token...');
  };
};

export default createAuthMiddleware;
>>>>>>> c774751 (chore: fix project structure bug)

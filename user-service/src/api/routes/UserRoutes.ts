import express from 'express';
//import { validateData } from '../middleware/validationMiddleware';


const userRouter = express.Router();

import { getUsers } from 'api/controllers/UserController';

userRouter.get('/', getUsers);

export default userRouter;
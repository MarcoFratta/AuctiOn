import express from 'express';
//import { validateData } from '../middleware/validationMiddleware';


const userRouter = express.Router();

import { getAllUsers, addUser } from '../controllers/UserController';

userRouter.get('/', getAllUsers);
userRouter.post('/', addUser);

export default userRouter;
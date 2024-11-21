import {NextFunction, Request, Response} from "express";
import { UserService } from "../services/UserService";
import { User } from "../schemas/User";

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    // GET /users
    async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const users = await this.userService.getUsers();
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    // GET /users/:id
    async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { id } = req.params;
        try {
            const user = await this.userService.getUserById(id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    // POST /users
    async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userData: Omit<User, "id"> = req.body;
            const newUser = await this.userService.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            next(error);
        }
    }

    // PUT /users/:id
    async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { id } = req.params;
        const updateData: Partial<User> = req.body;
        try {
            const updatedUser = await this.userService.updateUser(id, updateData);
            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    }

    // DELETE /users/:id
    async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { id } = req.params;
        try {
            await this.userService.deleteUser(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

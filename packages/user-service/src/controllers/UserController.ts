import { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/UserService'
import { User } from '../schemas/User'
import logger from '../utils/Logger'

export class UserController {
    private readonly userService: UserService

    constructor(userService: UserService) {
        this.userService = userService
    }

    getUsers = async (
        _req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const users = await this.userService.getUsers()
            res.status(200).json(users)
        } catch (error) {
            next(error)
        }
    }
    getUserByEmail = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { email } = req.params
        try {
            const user = await this.userService.getUserByEmail(email)
            res.status(200).json(user)
        } catch (error) {
            next(error)
        }
    }
    // Other methods as arrow functions
    getUserById = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params
        try {
            const user = await this.userService.getUserById(id)
            res.status(200).json(user)
        } catch (error) {
            next(error)
        }
    }

    createUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            logger.log('info', `Creating new user: ${this}`)
            const userData: User = req.body
            const newUser = await this.userService.createUser(userData)
            res.status(201).json(newUser)
        } catch (error) {
            next(error)
        }
    }

    updateUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params
        const updateData: Partial<User> = req.body
        delete updateData.id
        try {
            const updatedUser = await this.userService.updateUser(
                id,
                updateData
            )
            res.status(200).json(updatedUser)
        } catch (error) {
            next(error)
        }
    }

    deleteUser = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const { id } = req.params
        try {
            await this.userService.deleteUser(id)
            res.status(204).send()
        } catch (error) {
            next(error)
        }
    }
}

import {NextFunction, Request, Response} from "express";
import {AuthService} from "../services/AuthService";
import {LoginInputData, RegisterInputData} from "../schemas/AuthSchema";
import logger from "../utils/Logger";

export class AuthController {
    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const inputData: LoginInputData = req.body;
        try {
            const token = await this.authService.login(inputData);
            res.status(200).json(token);
        } catch (error) {
            next(error)
        }
    };
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const inputData: RegisterInputData = req.body;
        try {
            logger.info(`Registering user with email: ${inputData.email}`);
            const token = await this.authService.register(inputData);
            logger.info(`User registered successfully with email: ${inputData.email}`);
            res.status(201).json({
                message: "User registered successfully",
                token: token
            });
        } catch (error) {
            next(error)
        }
    };

    validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token: string = req.body.token;
        if (!token) {
            res.status(401).json({message: "Token is missing"});
            return;
        }
        try {
            const decoded = this.authService.validateToken({token: token});
            logger.info(`Token validated successfully ${decoded}`);
            res.status(200).json(decoded);
        } catch (error) {
            next(error)
        }
    }
}

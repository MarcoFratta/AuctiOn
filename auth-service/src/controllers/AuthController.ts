import {NextFunction, Request, Response} from "express";
import {AuthService} from "../services/AuthService";
import {LoginInputData, RegisterInputData} from "../schemas/AuthSchema";

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
            const newUser = await this.authService.register(inputData);
            const token = await this.authService.login({
                email: inputData.email
                , password: inputData.password
            });
            res.status(201).json({
                message: "User registered successfully",
                user: newUser, ...token
            });
        } catch (error) {
            next(error)
        }
    };

    validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({message: "Token is missing"});
            return;
        }
        try {
            const decoded = this.authService.validateToken({token: token});
            res.status(200).json(decoded);
        } catch (error) {
            next(error)
        }
    }
}

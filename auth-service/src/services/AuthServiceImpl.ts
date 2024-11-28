import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import {InvalidPasswordError, InvalidTokenError, UserAlreadyExistsError, UserNotFoundError} from "../errors/AuthErrors";
import {AuthService} from "./AuthService";
import {LoginInputData, RegisterInputData, Token, UserOutput} from "../schemas/AuthSchema";
import logger from "../utils/Logger";

export class AuthServiceImpl implements AuthService {
    private readonly userServiceURL: string;
    private readonly jwtSecret: string;

    constructor(userServiceURL: string, jwtSecret: string) {
        this.userServiceURL = userServiceURL;
        this.jwtSecret = jwtSecret;
    }

    // Register a new user
    async register(data: RegisterInputData): Promise<UserOutput> {
        const {data: existingUser} = await axios.get(`${this.userServiceURL}?email=${data.email}`);
        if (existingUser) throw new UserAlreadyExistsError(data.email);

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const {data: newUser} = await axios.post(this.userServiceURL, {
            email: data.email,
            password: hashedPassword,
            name: data.name,
        });

        return {id: newUser.id, email: newUser.email, name: newUser.name};
    }

    // Login an existing user
    async login(data: LoginInputData): Promise<Token> {
        const {data: user} = await axios.get(`${this.userServiceURL}?email=${data.email}`);
        if (!user) throw new UserNotFoundError(data.email);

        const isPasswordValid = await bcrypt.compare(data.password, user.password);
        if (!isPasswordValid) throw new InvalidPasswordError();
        const userData = {id: user.id, email: user.email, name: user.name};
        const token = jwt.sign(userData, this.jwtSecret, {expiresIn: "1h"});
        logger.info(`generated token: ${token.toString()}`);
        return {token: token};
    }

    // Validate a JWT
    async validateToken(token: Token): Promise<UserOutput> {
        try {
            const decoded: any = jwt.verify(token.token, this.jwtSecret);
            return {id: decoded.id, email: decoded.email, name: decoded.name};
        } catch (error) {
            throw new InvalidTokenError();
        }
    }
}

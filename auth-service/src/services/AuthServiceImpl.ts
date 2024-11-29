import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import {InvalidTokenError, UserAlreadyExistsError, UserNotFoundError, WrongPasswordError,} from "../errors/AuthErrors";
import {AuthService} from "./AuthService";
import {LoginInputData, RegisterInputData, Token, UserOutput, userOutputSchema} from "../schemas/AuthSchema";
import logger from "../utils/Logger";
import {validateSchema} from "../utils/Validator";

export class AuthServiceImpl implements AuthService {
    private readonly userServiceURL: string;
    private readonly jwtSecret: string;

    constructor(userServiceURL: string, jwtSecret: string) {
        this.userServiceURL = userServiceURL;
        this.jwtSecret = jwtSecret;
    }

    // Register a new user
    async register(data: RegisterInputData): Promise<Token> {
        const {data: existingUser} = await axios.get(`${this.userServiceURL}?email=${data.email}`);
        if (existingUser) throw new UserAlreadyExistsError(data.email);
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const {data: newUser} = await axios.post(this.userServiceURL, {
            email: data.email,
            password: hashedPassword,
            name: data.name,
        });
        logger.info(`hashed password: ${hashedPassword}`);
        const token = jwt.sign(
            {id: newUser.id, email: newUser.email, name: newUser.name},
            this.jwtSecret,
            {expiresIn: "1h"}
        );
        return {token: token};
    }

    // Login an existing user
    async login(data: LoginInputData): Promise<Token> {
        const {data: user} = await axios.get(`${this.userServiceURL}?email=${data.email}`);
        if (!user) throw new UserNotFoundError(data.email);

        const isPasswordValid = await bcrypt.compare(data.password, user.pHash);
        if (!isPasswordValid) throw new WrongPasswordError();

        const userData = {id: user.id, email: user.email, name: user.name};
        const token = jwt.sign(userData, this.jwtSecret, {expiresIn: "1h"});
        return {token};
    }

    // Validate a JWT
    validateToken(token: Token): UserOutput {
        try {
            // Decode and verify the token
            const decoded: any = jwt.verify(token.token, this.jwtSecret);
            logger.info(`decoded token: ${JSON.stringify(decoded)}`);
            if (!decoded) throw new InvalidTokenError();
            return validateSchema(userOutputSchema, decoded);
        } catch (error) {
            // Handle token expiry error
            if (error instanceof jwt.TokenExpiredError) {
                throw new InvalidTokenError();
            }
            // Handle invalid token error
            if (error instanceof jwt.JsonWebTokenError) {
                throw new InvalidTokenError();
            }
            // Rethrow any other errors
            throw error;
        }
    }
}

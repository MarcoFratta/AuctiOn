import {LoginInputData, RegisterInputData, Token, UserOutput} from "../schemas/AuthSchema";

export interface AuthService {
    register(data: RegisterInputData): Promise<Token>;

    login(data: LoginInputData): Promise<Token>;

    validateToken(token: Token): UserOutput;

}
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";

export class AuthService {
    private readonly userServiceURL: string;
    private readonly jwtSecret: string;

    constructor(userServiceURL: string, jwtSecret: string) {
        this.userServiceURL = userServiceURL;
        this.jwtSecret = jwtSecret;
    }

    // Register a new user
    async registerUser({email, password, name}: { email: string; password: string; name: string }) {
        const {data: existingUser} = await axios.get(`${this.userServiceURL}?email=${email}`);
        if (existingUser) throw new Error("User already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const {data: newUser} = await axios.post(this.userServiceURL, {
            email,
            password: hashedPassword,
            name,
        });

        return newUser;
    }

    // Login an existing user
    async loginUser({email, password}: { email: string; password: string }) {
        const {data: user} = await axios.get(`${this.userServiceURL}?email=${email}`);
        if (!user) throw new Error("User not found");

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");

        const token = jwt.sign({id: user.id, email: user.email}, this.jwtSecret, {expiresIn: "1h"});
        return {token, user};
    }

    // Validate a JWT
    validateToken(token: string) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error("Invalid token");
        }
    }
}

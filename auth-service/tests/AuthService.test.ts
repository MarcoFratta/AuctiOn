jest.mock("axios");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

import {AuthService} from "../src/services/AuthService";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("AuthService", () => {
    let authService: AuthService;
    const userServiceURL = "http://user-service:3000/users";
    const jwtSecret = "testSecret";

    beforeEach(() => {
        authService = new AuthService(userServiceURL, jwtSecret);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test for registerUser
    it("should register a new user successfully", async () => {
        const userData = {email: "test@example.com", password: "password123", name: "Test User"};
        const hashedPassword = "hashedPassword";

        (axios.get as jest.Mock).mockResolvedValue({data: null});
        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (axios.post as jest.Mock).mockResolvedValue({data: {...userData, password: hashedPassword}});

        const result = await authService.registerUser(userData);

        expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}?email=test@example.com`);
        expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
        expect(axios.post).toHaveBeenCalledWith(userServiceURL, {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
        });
        expect(result).toEqual({...userData, password: hashedPassword});
    });

    it("should throw an error if the user already exists", async () => {
        const userData = {email: "test@example.com", password: "password123", name: "Test User"};

        (axios.get as jest.Mock).mockResolvedValue({data: {id: "123", ...userData}});

        await expect(authService.registerUser(userData)).rejects.toThrow("User already exists");

        expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}?email=test@example.com`);
        expect(axios.post).not.toHaveBeenCalled();
    });

    // Test for loginUser
    it("should login a user and return a JWT", async () => {
        const userData = {email: "test@example.com", password: "password123"};
        const user = {id: "123", email: "test@example.com", password: "hashedPassword"};
        const token = "jsonwebtoken";

        (axios.get as jest.Mock).mockResolvedValue({data: user});
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue(token);

        const result = await authService.loginUser(userData);

        expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}?email=test@example.com`);
        expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, user.password);
        expect(jwt.sign).toHaveBeenCalledWith({id: user.id, email: user.email}, jwtSecret, {expiresIn: "1h"});
        expect(result).toEqual({token, user});
    });

    it("should throw an error if the user is not found", async () => {
        const userData = {email: "test@example.com", password: "password123"};

        (axios.get as jest.Mock).mockResolvedValue({data: null});

        await expect(authService.loginUser(userData)).rejects.toThrow("User not found");

        expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}?email=test@example.com`);
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    it("should throw an error if the password is invalid", async () => {
        const userData = {email: "test@example.com", password: "password123"};
        const user = {id: "123", email: "test@example.com", password: "hashedPassword"};

        (axios.get as jest.Mock).mockResolvedValue({data: user});
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        await expect(authService.loginUser(userData)).rejects.toThrow("Invalid password");

        expect(axios.get).toHaveBeenCalledWith(`${userServiceURL}?email=test@example.com`);
        expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, user.password);
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    // Test for validateToken
    it("should validate a valid JWT", () => {
        const token = "validToken";
        const decoded = {id: "123", email: "test@example.com"};

        (jwt.verify as jest.Mock).mockReturnValue(decoded);

        const result = authService.validateToken(token);

        expect(jwt.verify).toHaveBeenCalledWith(token, jwtSecret);
        expect(result).toEqual(decoded);
    });

    it("should throw an error for an invalid JWT", () => {
        const token = "invalidToken";

        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error("Invalid token");
        });

        expect(() => authService.validateToken(token)).toThrow("Invalid token");

        expect(jwt.verify).toHaveBeenCalledWith(token, jwtSecret);
    });
});

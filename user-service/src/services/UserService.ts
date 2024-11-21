import { User } from "../schemas/User";
import {UserRepository} from "../repositories/UserRepository";
import {DeleteUserError, UpdateUserError, UserNotFoundError} from "../errors/UserErrors";

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    // Fetch all users
    async getUsers(): Promise<User[]> {
        return await this.userRepository.findAll();
    }

    // Fetch a user by ID
    async getUserById(id: string): Promise<User | null> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new UserNotFoundError(id);
        }
        return user;
    }

    // Create a new user
    async createUser(userData: Omit<User, "id">): Promise<User> {
        const newUser = await this.userRepository.create(userData);

        if (!newUser) {
            throw new Error("Failed to create user.");
        }

        return newUser;
    }

    // Update a user by ID
    async updateUser(id: string, updateData: Partial<User>): Promise<User> {
        const updatedUser = await this.userRepository.update(id, updateData);
        if (!updatedUser) {
            throw new UpdateUserError(id);
        }
        return updatedUser;
    }

    // Delete a user by ID
    async deleteUser(id: string): Promise<void> {
        const deleted = await this.userRepository.delete(id);
        if (!deleted) {
            throw new DeleteUserError(id);
        }
    }
}

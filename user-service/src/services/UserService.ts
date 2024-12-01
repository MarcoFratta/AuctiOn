import {User} from "../schemas/User";
import {UserRepository} from "../repositories/UserRepository";
import {UserNotFoundError} from "../errors/UserErrors";
import logger from "../utils/Logger"; // Assume this is a configured Winston logger

export class UserService {
    private userRepository: UserRepository;

    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository;
    }

    async getUsers(): Promise<User[]> {
        logger.info("Fetching all users.");
        return await this.userRepository.findAll();
    }

    async getUserById(id: string): Promise<User | null> {
        logger.info(`Fetching user with ID: ${id}`);
        const user = await this.userRepository.findById(id);
        if (!user) {
            logger.warn(`User with ID ${id} not found.`);
            throw new UserNotFoundError("id", id);
        }
        logger.info(`User with ID ${id} fetched successfully.`);
        return user;
    }

    async createUser(userData: User): Promise<User> {
        logger.info(`Creating new user: ${JSON.stringify(userData)}`);
        const newUser = await this.userRepository.create(userData);

        if (!newUser) {
            logger.error("Failed to create user.");
            throw new Error("Failed to create user.");
        }

        logger.info(`User created successfully with ID: ${newUser.id}`);
        return newUser;
    }

    async updateUser(id: string, updateData: Partial<User>): Promise<User> {
        logger.info(`Updating user with ID: ${id}`);
        const updatedUser = await this.userRepository.update(id, updateData);

        if (!updatedUser) {
            logger.warn(`Failed to update user with ID ${id}`);
            throw new UserNotFoundError("id", id);
        }

        logger.info(`User with ID ${id} updated successfully.`);
        return updatedUser;
    }

    async deleteUser(id: string): Promise<void> {
        logger.info(`Deleting user with ID: ${id}`);
        const deleted = await this.userRepository.delete(id);

        if (!deleted) {
            logger.warn(`Failed to delete user with ID ${id}`);
            throw new UserNotFoundError("id", id);
        }

        logger.info(`User with ID ${id} deleted successfully.`);
    }

    async getUserByEmail(email: string) {
        logger.info(`Fetching user with email: ${email}`);
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            logger.warn(`User with email ${email} not found.`);
            throw new UserNotFoundError("email", email);
        }
        logger.info(`User with email ${email} fetched successfully.`);
        return user;
    }
}

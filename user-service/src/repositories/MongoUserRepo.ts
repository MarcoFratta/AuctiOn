import { User } from '../schemas/User';
import { IUser, UserModel } from '../models/MongoUser'; // Mongoose model and interface
import { UserRepository } from './UserRepository'; // Assuming you've defined this interface
import {Converters} from '../utils/Converters';
import {ObjectId} from "mongodb";
import {EmailAlreadyExistsError, ValidationError} from "../errors/UserErrors";
import {Error} from "mongoose"; // Converter interface
import { MongoError } from 'mongodb';
// Reverse converter

export class MongooseUserRepository implements UserRepository {
    private userConverter: Converters<User, IUser>;
    private reverseUserConverter: Converters<IUser, User>;

    constructor(userConverter: Converters<User, IUser>, reverseUserConverter: Converters<IUser, User>) {
        this.userConverter = userConverter;
        this.reverseUserConverter = reverseUserConverter;
    }

    // Find all users
    async findAll(): Promise<User[]> {
        const users = await UserModel.find();  // `.lean()` gives plain objects instead of Mongoose documents
        return users.map((user) => this.reverseUserConverter.convert(user)); // Convert to Zod User format
    }

    // Find a user by ID
    async findById(id: string): Promise<User | null> {
        const user = await UserModel.findById(new ObjectId(id)).lean<IUser>();
        return user ? this.reverseUserConverter.convert(user) : null;
    }

    // Create a new user
    async create(userData: Omit<User, 'id'>): Promise<User> {
        try {
            const userToInsert = this.userConverter.convert(userData);  // Convert before saving
            const createdUser = await UserModel.create(userToInsert);
            return this.reverseUserConverter.convert(createdUser);
        } catch (error) {
            if (error instanceof Error.ValidationError) {
                throw new ValidationError(error.message);
            } else if ((error as MongoError).code === 11000) {
                throw new EmailAlreadyExistsError(userData.email);
            } else {
                throw new Error("Unexpected db error"); // Re-throw unexpected errors
            }
        }
        // Convert back to Zod User type after creating
    }

    // Update a user by ID
    async update(id: string, updateData: Partial<User>): Promise<User | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(new ObjectId(id), updateData, { new: true }).lean<IUser>();
        return updatedUser ? this.reverseUserConverter.convert(updatedUser) : null;
    }

    // Delete a user by ID
    async delete(id: string): Promise<boolean> {
        const result = await UserModel.findByIdAndDelete(new ObjectId(id));
        return result !== null;  // Return true if a user was deleted
    }
}

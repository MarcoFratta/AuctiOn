import { UserRepository } from "../src/repositories/UserRepository";
import { User } from "../src/schemas/User";
import {EmailAlreadyExistsError} from "../src/errors/UserErrors";

export class MockUserRepository implements UserRepository {
    private users: User[] = [];

    async findAll(): Promise<User[]> {
        return this.users;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((user) => user.id === id) || null;
    }

    async create(userData: Omit<User, "id">): Promise<User> {
        if (this.users.map((user) => user.email).includes(userData.email)) {
            throw new EmailAlreadyExistsError(userData.email);
        }
        const newUser = { id: String(this.users.length + 1), ...userData };
        let s = ""
        for (let i = 0; i < 24 - newUser.id.length; i++) {
            s += "0"
        }
        newUser.id = s + newUser.id
        this.users.push(newUser);
        return newUser;
    }

    async update(id: string, updateData: Partial<User>): Promise<User | null> {
        const userIndex = this.users.findIndex((user) => user.id === id);
        if (userIndex === -1) return null;

        this.users[userIndex] = { ...this.users[userIndex], ...updateData };
        return this.users[userIndex];
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.users.length;
        this.users = this.users.filter((user) => user.id !== id);
        return this.users.length < initialLength;
    }
}

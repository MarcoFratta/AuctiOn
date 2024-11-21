import { UserRepository } from "./UserRepository";
import { User } from "../schemas/User";

export class MockUserRepository implements UserRepository {
    private users: User[] = [];

    async findAll(): Promise<User[]> {
        return this.users;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((user) => user.id === id) || null;
    }

    async create(userData: Omit<User, "id">): Promise<User> {
        const newUser = { id: String(this.users.length + 1), ...userData };
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

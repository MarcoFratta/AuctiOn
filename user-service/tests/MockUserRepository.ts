import {UserRepository} from "../src/repositories/UserRepository";
import {User} from "../src/schemas/User";
import {EmailAlreadyExistsError, IdAlreadyExistsError} from "../src/errors/UserErrors";

export class MockUserRepository implements UserRepository {
    private users: User[] = [];

    async findAll(): Promise<User[]> {
        return this.users;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find((user) => user.id === id) || null;
    }

    async create(userData: User): Promise<User> {
        if (this.users.map((user) => user.email).includes(userData.email)) {
            throw new EmailAlreadyExistsError(userData.email);
        }
        if (this.users.map((user) => user.id).includes(userData.id)) {
            throw new IdAlreadyExistsError(userData.id!);
        }
        this.users.push(userData);
        return userData;
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

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find((user) => user.email === email) || null;
    }

}

import { User } from "../schemas/User";

export interface UserRepository {
    findAll(): Promise<User[]>;
    findById(id: string): Promise<User | null>;
    create(userData: Omit<User, "id">): Promise<User>;
    update(id: string, updateData: Partial<User>): Promise<User | null>;
    delete(id: string): Promise<boolean>;
}

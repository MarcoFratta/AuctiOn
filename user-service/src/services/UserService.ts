import {User} from "../schemas/User";


const users: User[] = [];

export const getUsers = async (): Promise<User[]> => {
    return users;
};

export const createUser = async (user: User): Promise<User> => {
    users.push(user);
    return user;
};
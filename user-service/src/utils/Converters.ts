import {User} from "../schemas/User";
import {IUser} from "../models/MongoUser";
import {ObjectId} from "mongodb";
import {UserModel} from "../models/MongoUser";

export interface Converters<Input, Output> {
    convert(input: Input): Output;
}
export const objectIdToString :Converters<ObjectId, string> = {
    convert:(id:ObjectId) => id.toHexString()
};

// Convert string to ObjectId
export const stringToObjectId:Converters<string, ObjectId> = {
    convert:(id:string) => new ObjectId(id)
};

export const userConverter: Converters<User, IUser> = {
    convert(input: User): IUser {
        const user = new UserModel(input);  // Create a new Mongoose document instance
        return user as IUser;
    },
};

// Reverse converter (from Mongoose document to Zod User)
export const reverseUserConverter: Converters<IUser, User> = {
    convert(input: IUser): User {
        return {
            id: input._id.toString(), // Convert Mongo ObjectId to string
            name: input.name,
            email: input.email,
        };
    },
};
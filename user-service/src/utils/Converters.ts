import {User, userSchema} from "../schemas/User";
import {IUser, UserModel} from "../models/MongoUser";
import {validateSchema} from "./Validator";

export interface Converters<Input, Output> {
    convert(input: Input): Output;
}
// Convert string to ObjectId
export const userConverter: Converters<User, IUser> = {
    convert(input: User): IUser {
        const user = new UserModel({_id: input.id, ...input});  // Create a new Mongoose document instance
        return user as IUser;
    },
};

// Reverse converter (from Mongoose document to Zod User)
export const reverseUserConverter: Converters<IUser, User> = {
    convert(input: IUser): User {
        return validateSchema(userSchema, {id: input._id, ...input});
    },
};
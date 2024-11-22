import mongoose, { Schema, Document } from 'mongoose';
import {ObjectId} from "mongodb";

// Define the User schema for Mongoose
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
});

// Create an interface extending Mongoose's Document
interface IUser extends Document {
    _id: ObjectId;
    name: string;
    email: string;
}

// Create the Mongoose model
const UserModel = mongoose.model<IUser>('User', userSchema);


export { UserModel, IUser };

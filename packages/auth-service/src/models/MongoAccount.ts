// auth-service/src/models/MongoAccount.ts
<<<<<<< HEAD
import mongoose, { Document, ObjectId, Schema } from 'mongoose'

// Define the Account schema for Mongoose
const accountSchema = new Schema<IAccount>({
    pHash: { type: String, required: true },
})
=======
import mongoose, { Document, ObjectId, Schema } from 'mongoose';

// Define the Account schema for Mongoose
const accountSchema = new Schema<IAccount>({
  pHash: { type: String, required: true },
});
>>>>>>> c774751 (chore: fix project structure bug)

// Virtual field to use 'id' instead of '_id'
accountSchema.virtual('id').get(function () {
  return this._id; // Expose _id as id in the app
});

// Ensure virtual fields are included in JSON responses
accountSchema.set('toJSON', {
  virtuals: true,
});
accountSchema.set('toObject', {
  virtuals: true,
});

// Create an interface extending Mongoose's Document
interface IAccount extends Document {
  _id: ObjectId;
  pHash: string;
}

// Create the Mongoose model
const AccountModel = mongoose.model<IAccount>('Account', accountSchema);

<<<<<<< HEAD
export { AccountModel, IAccount }
=======
export { AccountModel, IAccount };
>>>>>>> c774751 (chore: fix project structure bug)

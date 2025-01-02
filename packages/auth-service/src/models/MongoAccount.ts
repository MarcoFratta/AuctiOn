// auth-service/src/models/MongoAccount.ts
import mongoose, { Document, ObjectId, Schema } from 'mongoose';

// Define the Account schema for Mongoose
const accountSchema = new Schema<IAccount>({
  pHash: { type: String, required: true },
});

// Virtual field to use 'id' instead of '_id'
accountSchema.virtual('id').get(function () {
    return this._id // Expose _id as id in the app
})

// Ensure virtual fields are included in JSON responses
accountSchema.set('toJSON', {
    virtuals: true,
})
accountSchema.set('toObject', {
    virtuals: true,
})

// Create an interface extending Mongoose's Document
interface IAccount extends Document {
    _id: ObjectId
    pHash: string
}

// Create the Mongoose model
const AccountModel = mongoose.model<IAccount>('Account', accountSchema)

export { AccountModel, IAccount };
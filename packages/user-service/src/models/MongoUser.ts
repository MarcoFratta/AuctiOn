import mongoose, { Document, Schema } from 'mongoose'
// Define the User schema for Mongoose
const userSchema = new Schema<IUser>({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
})
// Virtual field to use 'id' instead of '_id'
userSchema
  .virtual('id')
  .get(function () {
    return this._id // Expose _id as id in the app
  })
  .set(function (id: string) {
    this._id = id // Allow setting id, which maps to _id
  })

// Ensure virtual fields are included in JSON responses
userSchema.set('toJSON', {
  virtuals: true,
})
userSchema.set('toObject', {
  virtuals: true,
})
// Create an interface extending Mongoose's Document
interface IUser extends Document {
  _id: string
  name: string
  email: string
  pHash: string
}

// Create the Mongoose model
const UserModel = mongoose.model<IUser>('User', userSchema)

export { UserModel, IUser }

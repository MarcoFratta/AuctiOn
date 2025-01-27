import { Document, model, Schema } from 'mongoose'

export interface ILobby extends Document {
  creator: string
  players: { userId: string; status: 'ready' | 'waiting' }[]
  maxPlayers: number
  rounds: number
  bidTime: number
  startAmount: number
  startInventory: { items: { item: string; quantity: number }[] }
  status: 'waiting' | 'in-progress' | 'completed'
}

const LobbySchema = new Schema<ILobby>({
  creator: { type: String, required: true },
  players: [
    {
      userId: String,
      status: {
        type: String,
        enum: ['ready', 'waiting'],
        default: 'waiting',
      },
    },
  ],
  maxPlayers: { type: Number, required: true },
  rounds: { type: Number, required: true },
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting',
  },
  bidTime: Number,
  startAmount: Number,
  startInventory: {
    items: [{ item: String, quantity: Number }],
  },
})

LobbySchema.virtual('id').get(function () {
  return this._id // Expose _id as id in the app
})

// Ensure virtual fields are included in JSON responses
LobbySchema.set('toJSON', {
  virtuals: true,
})
LobbySchema.set('toObject', {
  virtuals: true,
})

export const LobbyModel = model<ILobby>('Lobby', LobbySchema)

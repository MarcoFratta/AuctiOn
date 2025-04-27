import { model, Schema } from 'mongoose'

export interface IUserLobby {
  userId: string
  lobbyId: string
  state: 'waiting' | 'completed' | 'in-progress'
  joinedAt: Date
  leftAt?: Date
}

const userLobbySchema = new Schema<IUserLobby>({
  userId: { type: String, required: true },
  lobbyId: { type: String, required: true },
  state: {
    type: String,
    enum: ['waiting', 'completed', 'in-progress'],
    default: 'waiting',
  },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date },
})

// Index for faster queries
userLobbySchema.index({ userId: 1 })

export const UserLobbyModel = model<IUserLobby>('UserLobby', userLobbySchema)

import { Lobby, lobbySchema } from '../schemas/Lobby'
import { ILobby, LobbyModel } from '../models/LobbyModel'
import { validateSchema } from '@auction/common/validation'
import { Converter } from './Converter'

// Convert string to ObjectId
export const lobbyConverter: Converter<Lobby, ILobby> = {
  convert(input: Lobby): ILobby {
    // Create a new Mongoose document instance
    return new LobbyModel(input)
  },
}

// Reverse converter (from Mongoose document to Zod Lobby)
export const reverseLobbyConverter: Converter<ILobby, Lobby> = {
  convert(input: ILobby): Lobby {
    return validateSchema(lobbySchema, {
      id: input._id,
      ...input,
    })
  },
}

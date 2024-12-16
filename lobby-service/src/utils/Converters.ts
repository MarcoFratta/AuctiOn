import { Lobby, lobbySchema } from '../schemas/Lobby'
import { ILobby, LobbyModel } from '../models/LobbyModel'
import { validateSchema } from './Validator'

export interface Converters<Input, Output> {
    convert(input: Input): Output;
}

// Convert string to ObjectId
export const lobbyConverter: Converters<Lobby, ILobby> = {
    convert(input: Lobby): ILobby {
        // Create a new Mongoose document instance
        return new LobbyModel(input) as ILobby
    },
}

// Reverse converter (from Mongoose document to Zod Lobby)
export const reverseLobbyConverter: Converters<ILobby, Lobby> = {
    convert(input: ILobby): Lobby {
        return <Lobby>validateSchema(lobbySchema, {
            id: input._id, ...input,
        })
    },
}
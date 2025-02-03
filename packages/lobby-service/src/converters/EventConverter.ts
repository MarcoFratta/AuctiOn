import { Converter } from './Converter'
import { validateSchema } from '@auction/common/validation'
import { Lobby } from '../schemas/Lobby'
import {
  LobbyCreatedEvent,
  LobbyCreatedEventSchema,
  LobbyDeletedEvent,
  LobbyDeletedEventSchema,
  LobbyJoinedEvent,
  LobbyJoinedEventSchema,
  LobbyLeftEvent,
  LobbyLeftEventSchema,
  LobbyStartedEvent,
  LobbyStartedEventSchema,
} from '../schemas/LobbyEvents'

export const toLobbyCreatedEvent: Converter<Lobby, LobbyCreatedEvent> = {
  convert(lobby: Lobby) {
    return validateSchema(LobbyCreatedEventSchema, {
      type: 'lobby-created',
      creator: lobby.creator,
      lobby: {
        id: lobby.id,
        players: lobby.players,
        maxPlayers: lobby.maxPlayers,
        maxRound: lobby.rounds,
        status: lobby.status,
        bidTime: lobby.bidTime,
        startAmount: lobby.startAmount,
        startInventory: lobby.startInventory,
      },
      timestamp: new Date(),
    })
  },
}

export const toLobbyJoinedEvent = (playerId: string): Converter<Lobby, LobbyJoinedEvent> => {
  return {
    convert: (lobby: Lobby): LobbyJoinedEvent => {
      return validateSchema(LobbyJoinedEventSchema, {
        type: 'lobby-joined',
        lobbyId: lobby.id,
        playerId,
      })
    },
  }
}

export const toLobbyLeftEvent = (playerId: string): Converter<Lobby, LobbyLeftEvent> => {
  return {
    convert: (lobby: Lobby): LobbyLeftEvent => {
      return validateSchema(LobbyLeftEventSchema, {
        type: 'lobby-left',
        lobbyId: lobby.id,
        playerId,
      })
    },
  }
}

export const toLobbyStartedEvent: Converter<Lobby, LobbyStartedEvent> = {
  convert(lobby: Lobby): LobbyStartedEvent {
    return validateSchema(LobbyStartedEventSchema, {
      type: 'lobby-started',
      lobbyId: lobby.id,
    })
  },
}

export const toLobbyDeletedEvent: Converter<Lobby, LobbyDeletedEvent> = {
  convert(lobby: Lobby): LobbyDeletedEvent {
    return validateSchema(LobbyDeletedEventSchema, {
      type: 'lobby-deleted',
      lobbyId: lobby.id,
    })
  },
}

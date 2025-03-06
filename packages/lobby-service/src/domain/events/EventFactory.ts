import { validateSchema } from '@auction/common/validation'
import { Lobby, PlayerInfo } from '../../schemas/Lobby'
import {
  LobbyCreatedEvent,
  lobbyCreatedEventSchema,
  LobbyDeletedEvent,
  lobbyDeletedEventSchema,
  LobbyJoinedEvent,
  lobbyJoinedEventSchema,
  LobbyLeftEvent,
  lobbyLeftEventSchema,
  LobbyStartedEvent,
  lobbyStartedEventSchema,
  PlayerStatusEvent,
  playerStatusEventSchema,
} from '@auction/common/events/lobby'

export const lobbyCreatedEvent = (lobby: Lobby): LobbyCreatedEvent => {
  return validateSchema(lobbyCreatedEventSchema, {
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
}

export const lobbyJoinedEvent = (playerId: string, info: PlayerInfo, lobby: Lobby): LobbyJoinedEvent => {
  return validateSchema(lobbyJoinedEventSchema, {
    type: 'lobby-joined',
    lobbyId: lobby.id,
    playerId,
    username: info.username,
  })
}

export const lobbyLeftEvent = (playerId: string, lobby: Lobby): LobbyLeftEvent => {
  return validateSchema(lobbyLeftEventSchema, {
    type: 'lobby-left',
    lobbyId: lobby.id,
    playerId,
  })
}

export const lobbyStartedEvent = (lobby: Lobby): LobbyStartedEvent => {
  return validateSchema(lobbyStartedEventSchema, {
    type: 'lobby-started',
    lobbyId: lobby.id,
  })
}

export const lobbyDeletedEvent = (lobby: Lobby): LobbyDeletedEvent => {
  return validateSchema(lobbyDeletedEventSchema, {
    type: 'lobby-deleted',
    lobbyId: lobby.id,
  })
}
export const playerStatusEvent = (lobby: Lobby, playerId: string): PlayerStatusEvent => {
  return validateSchema(playerStatusEventSchema, {
    type: 'player-status',
    lobbyId: lobby.id,
    playerId,
    status: lobby.players.find(p => p.userId === playerId)?.status,
  })
}

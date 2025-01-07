export class LobbyNotFoundError extends Error {
  constructor(id: string) {
    super(`Lobby with id ${id} not found`)
  }
}

export class LobbyFullError extends Error {
  constructor() {
    super('Lobby is full')
  }
}

export class PlayerNotFoundError extends Error {
  constructor() {
    super('Player not found in lobby')
  }
}

export class PlayersNotReadyError extends Error {
  constructor() {
    super('All players must be ready to start the game')
  }
}

export class NotEnoughPlayersError extends Error {
  constructor() {
    super('Not enough players to start the game')
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class MatchAlreadyInProgressError extends Error {
  constructor(message: string) {
    super(message)
  }
}

export class UserNotAuthenticatedError extends Error {
  constructor() {
    super('Login to perform this action')
  }
}

export class UserAlreadyJoined extends Error {
  constructor() {
    super('User already joined the lobby')
  }
}

export class ServiceUnavailableError extends Error {
  constructor() {
    super('Service not available')
  }
}

export class UserAlreadyInLobby extends Error {
  constructor(lobbyId: string) {
    super(`User is already in lobby ${lobbyId}`)
    this.name = 'UserAlreadyInLobby'
  }
}

export class UserNotInActiveLobby extends Error {
  constructor() {
    super('User has not joined any lobby')
  }
}

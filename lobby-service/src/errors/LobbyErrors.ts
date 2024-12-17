export class UserNotFoundError extends Error {
    constructor(email: string) {
        super(`User with email ${email} not found`)
    }
}

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

export class UnauthorizedError extends Error {
    constructor() {
        super('Only the lobby creator can perform this action')
    }
}

export class MatchAlreadyInProgressError extends Error {
    constructor() {
        super('Match is already in progress')
    }
}

export class UserNotAuthenticatedError extends Error {
    constructor() {
        super('User is not authenticated')
    }
}
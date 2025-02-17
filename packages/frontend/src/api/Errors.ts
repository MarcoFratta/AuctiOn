export class UserAlreadyRegistered extends Error {
  constructor(email: string) {
    super('User with email ' + email + ' is already registered, please sign in')
  }
}

export class NotFound extends Error {
  constructor() {
    super()
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super('User is not authenticated')
  }
}
export class PasswordIncorrect extends Error {
  constructor() {
    super('Password is incorrect')
  }
}

export class TooManyRequests extends Error {
  constructor() {
    super('Too many requests, please try again later')
  }
}

export class InvalidData extends Error {
  constructor() {
    super('Invalid data')
  }
}

export class AlreadyInLobby extends Error {
  constructor() {
    super('You already joined a lobby')
  }
}

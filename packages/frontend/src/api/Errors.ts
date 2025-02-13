export class UserAlreadyRegistered extends Error {
  constructor(email: string) {
    super('User with email ' + email + ' is already registered, please sign in')
  }
}

export class UserNotFound extends Error {
  constructor(email: string) {
    super('User with email ' + email + ' not found, please sign up')
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

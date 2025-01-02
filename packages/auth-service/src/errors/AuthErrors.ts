export class UserAlreadyExistsError extends Error {
<<<<<<< HEAD
    constructor(email: string) {
        super(`User with Email ${email} already exists`)
    }
}

export class UserNotFoundError extends Error {
    constructor(email: string) {
        super(`User with email ${email} not found`)
    }
}

export class WrongPasswordError extends Error {
    constructor() {
        super(`Invalid password`)
    }
}

export class InvalidTokenError extends Error {
    constructor() {
        super(`Invalid token`)
    }
}

export class UserServiceUnavailableError extends Error {
    constructor(message: string) {
        super(message)
    }
=======
  constructor(email: string) {
    super(`User with Email ${email} already exists`);
  }
}

export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`User with email ${email} not found`);
  }
}

export class WrongPasswordError extends Error {
  constructor() {
    super(`Invalid password`);
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super(`Invalid token`);
  }
}

export class UserServiceUnavailableError extends Error {
  constructor(message: string) {
    super(message);
  }
>>>>>>> c774751 (chore: fix project structure bug)
}

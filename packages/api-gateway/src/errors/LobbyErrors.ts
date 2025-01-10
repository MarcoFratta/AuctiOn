export class UserNotAuthenticatedError extends Error {
  constructor() {
    super('Login to perform this action')
  }
}

export class ServiceUnavailableError extends Error {
  constructor() {
    super('Service not available')
  }
}

export class ServiceNotFoundError extends Error {
  constructor() {
    super('Requested resource not found')
  }
}

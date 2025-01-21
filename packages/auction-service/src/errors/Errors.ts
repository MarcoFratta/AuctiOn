export class UserNotAuthenticatedError extends Error {
  constructor() {
    super('User not authenticated')
    this.name = 'UserNotAuthenticatedError'
  }
}

import {
  AlreadyInLobby,
  InvalidData,
  NotFound,
  PasswordIncorrect,
  TooManyRequests,
  UnauthenticatedError,
  UserAlreadyRegistered,
} from '@/api/Errors.ts'
import { useAlert } from '@/composables/useAlert.ts'

export interface ErrorInfo {
  message: string
  title?: string
}

export class ErrorsHandler {
  private info: ErrorInfo

  constructor(private error: any) {
    this.info = { message: '' }
  }

  invalidData(message: string = 'Invalid data') {
    return this.check('Invalid data', message, InvalidData)
  }

  userAlreadyRegistered(message: string = 'User is already registered, please sign in') {
    return this.check('User already registered', message, UserAlreadyRegistered)
  }

  authenticationError(message: string = 'User is not authenticated, please sign in') {
    return this.check('Authentication error', message, UnauthenticatedError)
  }

  passwordIncorrect(message: string = 'Password is incorrect') {
    return this.check('Password incorrect', message, PasswordIncorrect)
  }

  alreadyInLobby(message: string = 'You already joined a lobby') {
    return this.check('Already in lobby', message, AlreadyInLobby)
  }

  tooManyRequests(message: string = 'Too many requests, please try again later') {
    return this.check('Too many requests', message, TooManyRequests)
  }

  notFound(message: string = 'Content not found') {
    return this.check('Not found', message, NotFound)
  }

  unknownError(message: string = 'An error occurred') {
    this.info = { title: 'Ops...', message }
    return this
  }

  get(): ErrorInfo {
    return this.info
  }

  private check(title: string, message: string, type: any) {
    if (this.error instanceof type) {
      this.info = { title, message }
    }
    return this
  }
}

export function useErrorsHandler() {
  const alerts = useAlert()

  function create(err: any): ErrorsHandler {
    return new ErrorsHandler(err)
  }

  async function show(errorInfo: ErrorInfo): Promise<void> {
    return alerts.error(errorInfo.title ?? '', errorInfo.message)
  }

  return { create, show }
}

import {
  AlreadyInLobby,
  Forbidden,
  InvalidData,
  NotFound,
  PasswordIncorrect,
  TooManyRequests,
  UnauthenticatedError,
  UserAlreadyRegistered,
} from '@/api/Errors.ts'
import { useAlert } from '@/composables/useAlert.ts'
import { isAxiosError } from 'axios'

export interface ErrorInfo {
  message: string
  title?: string
}

export class ErrorsHandler {
  private info: ErrorInfo
  invalidData(
    title: string = 'Invalid data',
    message: string = 'Invalid data',
    callback?: () => void,
  ) {
    return this.check(title, message, InvalidData, callback)
  }
  constructor(private error: unknown) {
    this.info = { message: '' }
  }

  passwordIncorrect(
    title: string = 'Incorrect password',
    message: string = 'Please try again',
    callback?: () => void,
  ) {
    return this.check(title, message, PasswordIncorrect, callback)
  }

  alreadySignedUp(
    title: string = 'User already registered',
    message: string = 'Please sign in',
    callback?: () => void,
  ) {
    return this.check(title, message, UserAlreadyRegistered, callback)
  }

  notFound(
    title: string = 'Not Found',
    message: string = 'Content not found',
    callback?: () => void,
  ) {
    return this.check(title, message, NotFound, callback)
  }

  authenticationError(
    message: string = 'User is not authenticated, please sign in',
    callback?: () => void,
  ) {
    return this.check('Authentication error', message, UnauthenticatedError, callback)
  }

  alreadyInLobby(message: string = 'You already joined a lobby', callback?: () => void) {
    return this.check('Already in lobby', message, AlreadyInLobby, callback)
  }

  tooManyRequests(
    message: string = 'Too unknown requests, please try again later',
    callback?: () => void,
  ) {
    return this.check('Too unknown requests', message, TooManyRequests, callback)
  }

  unknownError(title: string = 'Ops...', message: string = 'An error occurred') {
    this.info = { title, message }
    return this
  }

  run() {
    this.callback()
    return this
  }

  private callback = () => {}

  get(): ErrorInfo {
    return this.info
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private check(title: string, message: string, type: any, callback?: () => void) {
    if (this.error instanceof type) {
      this.info = { title, message }
      if (callback) {
        this.callback = callback
      }
    }
    return this
  }
}

export function useErrorsHandler() {
  const alerts = useAlert()

  function handleError(error: unknown, cases: [number, Error][] = []): void {
    const defaultCases = [
      [400, new InvalidData()],
      [403, new Forbidden()],
      [429, new TooManyRequests()],
      [401, new UnauthenticatedError()],
      [404, new NotFound()],
    ]
    if (isAxiosError(error)) {
      if (cases.map((e) => e[0]).includes(error.status ?? 0)) {
        throw cases.find((e) => e[0] == error.response?.status)?.[1]
      }
      if (defaultCases.map((e) => e[0]).includes(error.response?.status ?? 0)) {
        throw defaultCases.find((e) => e[0] == error.response?.status)?.[1]
      }
    }
    throw error
  }

  async function showAndRun(errorInfo: ErrorsHandler) {
    await show(errorInfo.get())
    errorInfo.run()
  }
  function create(err: unknown): ErrorsHandler {
    return new ErrorsHandler(err)
  }

  async function show(errorInfo: ErrorInfo): Promise<void> {
    if (errorInfo.message) {
      return alerts.error(errorInfo.title ?? '', errorInfo.message)
    }
  }

  return { create, show, handleError, showAndRun }
}

import { AlreadyInLobby, InvalidData, NotFound, UnauthenticatedError } from '@/api/Errors.ts'
import { useAlert } from '@/composables/useAlert.ts'

export interface ErrorInfo {
  message: string
  title?: string
}

export class ErrorsHandler {
  private info: ErrorInfo
  constructor(private error: unknown) {
    this.info = { message: '' }
  }

  invalidData(message: string = 'Invalid data', callback?: () => void) {
    return this.check('Invalid data', message, InvalidData, callback)
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

  tooMunknownRequests(
    message: string = 'Too munknown requests, please try again later',
    callback?: () => void,
  ) {
    return this.check('Too munknown requests', message, TooMunknownRequests, callback)
  }

  notFound(message: string = 'Content not found', callback?: () => void) {
    return this.check('Not found', message, NotFound, callback)
  }

  run() {
    this.callback()
    return this
  }

  unknownError(message: string = 'An error occurred') {
    this.info = { title: 'Ops...', message }
    return this
  }

  private callback: () => void = () => {}

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

  function create(err: unknown): ErrorsHandler {
    return new ErrorsHandler(err)
  }

  async function show(errorInfo: ErrorInfo): Promise<void> {
    return alerts.error(errorInfo.title ?? '', errorInfo.message)
  }

  return { create, show }
}

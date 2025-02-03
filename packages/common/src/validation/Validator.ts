import { ZodError, ZodSchema } from 'zod'
import { fromError } from 'zod-validation-error'
import logger from '../logger/Logger'

class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

function validateSchema<T>(schema: ZodSchema<T>, object: unknown): T {
  try {
    return schema.parse(object)
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedError = fromError(err).toString()
      logger.info(formattedError)
      throw new ValidationError(formattedError)
    }
    logger.error(err)
    throw err // Re-throw unexpected errors
  }
}

export { validateSchema, ValidationError }

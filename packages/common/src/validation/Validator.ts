import { ZodError, ZodSchema } from 'zod'
import { fromError } from 'zod-validation-error'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

export function validateSchema<T>(schema: ZodSchema<T>, object: unknown): T {
  try {
    return schema.parse(object)
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedError = fromError(err).toString()
      throw new ValidationError(formattedError)
    }
    throw err // Re-throw unexpected errors
  }
}

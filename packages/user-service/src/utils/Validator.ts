<<<<<<< HEAD
import { ZodError, ZodSchema } from 'zod'
import logger from './Logger'
import { fromError } from 'zod-validation-error'

class ParseError extends Error {
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
            throw new ParseError(formattedError)
        }

        throw err // Re-throw unexpected errors
    }
}

export { validateSchema, ParseError }
=======
import { ZodError, ZodSchema } from 'zod';
import logger from './Logger';
import { fromError } from 'zod-validation-error';

class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParseError';
  }
}

function validateSchema<T>(schema: ZodSchema<T>, object: unknown): T {
  try {
    return schema.parse(object);
  } catch (err) {
    if (err instanceof ZodError) {
      const formattedError = fromError(err).toString();
      logger.info(formattedError);
      throw new ParseError(formattedError);
    }

    throw err; // Re-throw unexpected errors
  }
}

export { validateSchema, ParseError };
>>>>>>> c774751 (chore: fix project structure bug)

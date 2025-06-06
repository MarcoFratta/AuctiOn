import { RequestHandler } from 'express'
import { ZodTypeAny } from 'zod'
import { validateSchema, ValidationError } from '../validation/Validator.js'

const validate = (schema: ZodTypeAny, source: 'body' | 'params' | 'query'): RequestHandler => {
  return (req, res, next) => {
    try {
      validateSchema(schema, req[source])
      next()
    } catch (err) {
      if (err instanceof ValidationError) {
        res.status(400).json({
          message: `Invalid ${source}`,
          errors: err.message,
        })
      } else {
        next(err)
      }
    }
  }
}

const validateRequestBody = (schema: ZodTypeAny): RequestHandler => {
  return validate(schema, 'body')
}

const validateRequestParams = (schema: ZodTypeAny): RequestHandler => {
  return validate(schema, 'params')
}

const validateRequestQuery = (schema: ZodTypeAny): RequestHandler => {
  return validate(schema, 'query')
}

export { validateRequestBody, validateRequestParams, validateRequestQuery }

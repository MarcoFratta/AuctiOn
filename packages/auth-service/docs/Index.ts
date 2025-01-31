import {
  forgotPasswordSchema,
  loginSchema,
  registerOutput,
  registerSchema,
  resetPasswordSchema,
  userSchema,
} from '../src/schemas/AuthSchema'
import { generateOpenAPI, registry } from './Generator'
import path from 'path'
import * as fs from 'fs'
import { z } from '../src/utils/ZodWrapper'

// Register all paths for the Auth API

// 1. User login
registry.registerPath({
  method: 'post',
  path: '/auth/login',
  description: 'User login',
  summary: 'Authenticate a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User logged in successfully',
      content: {
        'application/json': {
          schema: registerOutput.omit({
            refreshToken: true,
          }), // Use the existing registerOutput schema
        },
      },
    },
    400: {
      description: 'Invalid login credentials',
    },
    404: {
      description: 'User not found',
    },
  },
})

// 2. User registration
registry.registerPath({
  method: 'post',
  path: '/auth/register',
  description: 'User registration',
  summary: 'Register a new user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': {
          schema: registerOutput.omit({
            refreshToken: true,
          }),
        },
      },
    },
    400: {
      description: 'Invalid registration data',
    },
  },
})

// 3. Refresh token
registry.registerPath({
  method: 'post',
  path: '/auth/refresh',
  description: 'Refresh user token',
  summary: 'Refresh the access token using refresh token',
  responses: {
    200: {
      description: 'Token refreshed successfully',
      content: {
        'application/json': {
          schema: z.object({
            token: registerOutput.shape.accessToken,
          }),
        },
      },
    },
    401: {
      description: 'Login required',
    },
  },
})

// 4. Validate token
registry.registerPath({
  method: 'post',
  path: '/auth/validate',
  description: 'Validate user token',
  summary: 'Check if the token is valid',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            token: registerOutput.shape.accessToken,
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Token validated successfully',
      content: {
        'application/json': {
          schema: z.object({
            user: userSchema, // Use the existing registerOutput schema
          }),
        },
      },
    },
    401: {
      description: 'Login required',
    },
  },
})

// 5. Forgot password
registry.registerPath({
  method: 'post',
  path: '/auth/forgot/:email',
  description: 'Forgot password',
  summary: 'Send password reset link',
  request: {
    params: forgotPasswordSchema,
  },
  responses: {
    200: {
      description: 'Password reset link sent',
    },
    404: {
      description: 'User not found',
    },
  },
})

// 6. Reset password
registry.registerPath({
  method: 'post',
  path: '/auth/reset',
  description: 'Reset password',
  summary: 'Reset the user password',
  request: {
    body: {
      content: {
        'application/json': {
          schema: resetPasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successfully',
    },
    400: {
      description: 'Invalid reset data',
    },
  },
})

const openApiSpec = generateOpenAPI()
// Save the OpenAPI specification to a file
const swaggerOutputPath = path.join(__dirname, '..', 'docs', 'swagger.json')
fs.mkdirSync(path.dirname(swaggerOutputPath), { recursive: true })
fs.writeFileSync(swaggerOutputPath, JSON.stringify(openApiSpec, null, 2), 'utf-8')

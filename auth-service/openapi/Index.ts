import * as schemas from '../src/schemas/AuthSchema'
import {generateOpenAPI, registry} from './Generator'
import * as path from 'node:path'
import * as fs from 'node:fs'
import {z} from '../src/utils/ZodWrapper'

/// Register paths for the Auth API

// 1. Register a new user
registry.registerPath({
    method: 'post',
    path: '/auth/register',
    description: 'Register a new user and return a JWT token',
    summary: 'Register a user',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: schemas.registerSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'User registered successfully',
            content: {
                'application/json': {
                    schema: schemas.tokenSchema,
                },
            },
        },
        400: {
            description: 'Invalid request or user already exists',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
})

// 2. Login a user
registry.registerPath({
    method: 'post',
    path: '/auth/login',
    description: 'Log in an existing user and return a JWT token',
    summary: 'Log in a user',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: schemas.loginSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'User authenticated successfully',
            content: {
                'application/json': {
                    schema: schemas.tokenSchema,
                },
            },
        },
        400: {
            description: 'Invalid login request (e.g., wrong password)',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
        404: {
            description: 'User not found',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
})

// 3. Validate a JWT token
registry.registerPath({
    method: 'post',
    path: '/auth/validate',
    description: 'Validate a JWT token and return the decoded user information',
    summary: 'Validate a token',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: schemas.tokenSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Token is valid',
            content: {
                'application/json': {
                    schema: schemas.userOutputSchema,
                },
            },
        },
        400: {
            description: 'Invalid or expired token',
            content: {
                'application/json': {
                    schema: z.object({
                        error: z.string(),
                    }),
                },
            },
        },
    },
})

registry.register('Login an existing user', schemas.loginSchema)
registry.register('Register new user', schemas.registerSchema)
registry.register('Validate a JWT token', z.object({token: z.string()}))
registry.register('User', schemas.userOutputSchema)

const openApiSpec = generateOpenAPI()
// Save the OpenAPI specification to a file
const swaggerOutputPath = path.join(__dirname, '..', 'docs', 'swagger.json')
fs.mkdirSync(path.dirname(swaggerOutputPath), {recursive: true})
fs.writeFileSync(
    swaggerOutputPath,
    JSON.stringify(openApiSpec, null, 2),
    'utf-8'
)

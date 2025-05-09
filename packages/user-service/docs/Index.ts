import { userEmail, userId, userSchema } from '../src/schemas/User'
import { generateOpenAPI, registry } from './Generator'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { z } from '@auction/common/zod'

// Register all paths for the User API

// 1. Get all users
registry.registerPath({
  method: 'get',
  path: '/users',
  description: 'Retrieve a list of users',
  summary: 'Get all users',
  responses: {
    200: {
      description: 'A list of users',
      content: {
        'application/json': {
          schema: z.array(userSchema),
        },
      },
    },
  },
});

// 2. Get user by ID
registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  description: 'Get user data by its ID',
  summary: 'Get a single user',
  request: {
    params: userId,
  },
  responses: {
    200: {
      description: 'Object with user data',
      content: {
        'application/json': {
          schema: userSchema,
        },
      },
    },
    404: {
      description: 'User not found',
    },
  },
});
registry.registerPath({
  method: 'get',
  path: '/users/email/{email}',
  description: 'Get user data by its email',
  summary: 'Get a single user',
  request: {
    params: userEmail,
  },
  responses: {
    200: {
      description: 'Object with user data',
      content: {
        'application/json': {
          schema: userSchema,
        },
      },
    },
    404: {
      description: 'User not found',
    },
  },
});

// 3. Create a user
registry.registerPath({
  method: 'post',
  path: '/users',
  description: 'Create a new user',
  summary: 'Add a user',
  request: {
    body: {
      content: {
        'application/json': {
          schema: userSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'User created successfully',
    },
    400: {
      description: 'Invalid request body',
    },
  },
});

// 4. Update a user
registry.registerPath({
  method: 'put',
  path: '/users/{id}',
  description: 'Update an existing user',
  summary: 'Modify a user',
  request: {
    params: userId,
    body: {
      content: {
        'application/json': {
          schema: userSchema.partial(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
    },
    404: {
      description: 'User not found',
    },
  },
});

// 5. Delete a user
registry.registerPath({
  method: 'delete',
  path: '/users/{id}',
  description: 'Delete a user by ID',
  summary: 'Remove a user',
  request: {
    params: userId,
  },
  responses: {
    204: {
      description: 'User deleted successfully',
    },
    404: {
      description: 'User not found',
    },
  },
});

const openApiSpec = generateOpenAPI();
// Save the OpenAPI specification to a file
const swaggerOutputPath = path.join(__dirname, '..', 'docs', 'swagger.json');
fs.mkdirSync(path.dirname(swaggerOutputPath), { recursive: true });
fs.writeFileSync(swaggerOutputPath, JSON.stringify(openApiSpec, null, 2), 'utf-8');

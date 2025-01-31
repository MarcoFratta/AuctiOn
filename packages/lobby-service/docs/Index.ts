import { lobbyConfigSchema, lobbyIdSchema, playerSchema, playerStatusSchema } from '../src/schemas/Lobby'
import { generateOpenAPI, registry } from './Generator'
import { z } from '../src/utils/ZodWrapper'
import * as fs from 'node:fs'
import path from 'node:path'

// Register all paths for the Lobby API

// 1. Create a lobby
registry.registerPath({
  method: 'post',
  path: '/lobbies/create',
  description: 'Create a new lobby',
  summary: 'Add a lobby',
  request: {
    body: {
      content: {
        'application/json': {
          schema: lobbyConfigSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Lobby created successfully',
    },
    400: {
      description: 'Invalid request body',
    },
  },
})

// 2. Join a lobby
registry.registerPath({
  method: 'post',
  path: '/lobbies/{id}/join',
  description: 'Join an existing lobby',
  summary: 'Join a lobby by ID',
  request: {
    params: lobbyIdSchema,
  },
  responses: {
    200: {
      description: 'Successfully joined the lobby',
    },
    404: {
      description: 'Lobby not found',
    },
  },
})

// 3. Set player status
registry.registerPath({
  method: 'put',
  path: '/lobbies/status',
  description: 'Set the status of a player in a lobby',
  summary: 'Update player status',
  request: {
    body: {
      content: {
        'application/json': {
          schema: playerStatusSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Player status updated successfully',
    },
    400: {
      description: 'Invalid request body',
    },
    404: {
      description: 'Lobby not found',
    },
  },
})

// 4. Leave a lobby
registry.registerPath({
  method: 'post',
  path: '/lobbies/leave',
  description: 'Leave a lobby',
  summary: 'Leave the current lobby',
  responses: {
    200: {
      description: 'Successfully left the lobby',
    },
  },
})

// 5. Kick a player
registry.registerPath({
  method: 'post',
  path: '/lobbies/kick/{userId}',
  description: 'Kick a player from the lobby',
  summary: 'Remove a player from the lobby',
  request: {
    params: z.object({
      userId: playerSchema.shape.userId,
    }),
  },
  responses: {
    200: {
      description: 'Player kicked successfully',
    },
    403: {
      description: 'You do not have permission to kick this player',
    },
    404: {
      description: 'Lobby or player not found',
    },
  },
})

// 6. Start a match
registry.registerPath({
  method: 'post',
  path: '/lobbies/start',
  description: 'Start a match in the lobby',
  summary: 'Begin the match',
  responses: {
    200: {
      description: 'Match started successfully',
    },
    400: {
      description: 'Invalid request',
    },
    404: {
      description: 'Lobby not found',
    },
  },
})

const openApiSpec = generateOpenAPI()
// Save the OpenAPI specification to a file
const swaggerOutputPath = path.join(__dirname, '..', 'docs', 'swagger.json')
fs.mkdirSync(path.dirname(swaggerOutputPath), { recursive: true })
fs.writeFileSync(swaggerOutputPath, JSON.stringify(openApiSpec, null, 2), 'utf-8')
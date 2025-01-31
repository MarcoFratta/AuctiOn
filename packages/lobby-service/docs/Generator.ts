import { OpenApiGeneratorV31, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { lobbyConfigSchema, lobbyIdSchema, playerSchema, playerStatusSchema } from '../src/schemas/Lobby'

export const registry = new OpenAPIRegistry()

export function generateOpenAPI() {
  const config = {
    openapi: '3.1.0',
    info: {
      version: '1.0.0',
      title: 'Lobby service',
      description: 'Lobby service API',
    },
  } // your config comes here
  registry.register('lobbyConfig', lobbyConfigSchema)
  registry.register('lobbyId', lobbyIdSchema)
  registry.register('playerStatus', playerStatusSchema)
  registry.register('player', playerSchema)
  return new OpenApiGeneratorV31(registry.definitions).generateDocument(config)
} 
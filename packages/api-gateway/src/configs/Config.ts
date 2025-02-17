import { GatewayConfig } from '../types'
import * as process from 'node:process'

export const config: GatewayConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV,
  services: {
    users: {
      url: process.env.USER_SERVICE_URI || 'http://localhost:3001',
      pathRewrite: { '^/': '/users/' },
    },
    lobby: {
      url: process.env.LOBBY_SERVICE_URI || 'http://localhost:3002',
      pathRewrite: { '^/': '/lobbies/' },
    },
    auth: {
      url: process.env.AUTH_SERVICE_URI || 'http://localhost:3003',
      pathRewrite: { '^/': '/auth/' },
    },
    auction: {
      url: process.env.AUCTION_SERVICE_URI || 'ws://localhost:3004',
      pathRewrite: { '^/': '/auction/' },
    },
  },
}

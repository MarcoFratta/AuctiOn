import * as dotenv from 'dotenv'
import { GatewayConfig } from '../types'

if (process.env.NODE_ENV == undefined || process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../../../.env' })
}

export const config: GatewayConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV,
  services: {
    users: {
      url: process.env.USER_SERVICE_URI || 'http://localhost:3001/users',
      pathRewrite: { '^/users': '/users' },
    },
    lobby: {
      url: process.env.LOBBY_SERVICE_URI || 'http://localhost:3002/lobby',
      pathRewrite: { '^/lobby': '/lobby' },
    },
    auth: {
      url: process.env.AUTH_SERVICE_URI || 'http://localhost:3003/auth',
      pathRewrite: { '^/auth': '/auth' },
    },
  },
}

export interface ServiceConfig {
  url: string
  pathRewrite?: { [key: string]: string }
}

export interface GatewayConfig {
  port: number
  nodeEnv?: string
  corsAllowedOrigins: string[]
  services: {
    [key: string]: ServiceConfig
  }
}

export interface User {
  id: string
  email: string
  name: string
}

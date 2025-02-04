import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware'
import { config } from '../configs/Config'
import { ServiceNotFoundError } from '../errors/LobbyErrors'
import { Request, Response } from 'express'
import logger from '@auction/common/logger'

export class ProxyController {
  createProxy(serviceName: string, ws = false) {
    const service = config.services[serviceName]

    if (!service) {
      throw new ServiceNotFoundError()
    }

    return createProxyMiddleware<Request, Response>({
      target: service.url,
      changeOrigin: true,
      ws: ws,
      pathRewrite: service.pathRewrite,
      on: {
        proxyReq: fixRequestBody,
        error: (err, req, res) => {
          logger.error(`Error proxying request: ${err}, request url: ${req.url}`)
        },
      },
    })
  }
}

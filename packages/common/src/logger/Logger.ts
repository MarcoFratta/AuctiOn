import winston from 'winston'

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.json()
)
const nodeEnv = process.env.NODE_ENV || 'development'

const getLogLevel = () => {
  return nodeEnv === 'production' ? 'info' : 'debug'
}

const getTransports = () => {
  const transports: winston.transport[] = []
  // Console transport configuration
  const consoleTransport = new winston.transports.Console({
    level: getLogLevel(),
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message, stack }) => {
        const messageString = typeof message === 'object' ? JSON.stringify(message, null, 2) : message

        const stackString = stack ? `\nStack: ${stack}` : ''

        return `${timestamp} [${level}]:${messageString}${stackString}`
      })
    ),
  })

  transports.push(consoleTransport)

  //Add file transports in production
  if (nodeEnv === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        level: 'info',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    )
  }

  return transports
}

export default winston.createLogger({
  level: getLogLevel(),
  format: logFormat,
  transports: getTransports(),
})

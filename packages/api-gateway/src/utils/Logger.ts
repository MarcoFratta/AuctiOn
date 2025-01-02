<<<<<<< HEAD
import winston from 'winston'
import { config } from '../configs/config'

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

// Determine log level based on environment
const level = config.nodeEnv === 'production' ? 'info' : 'debug'

// Log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
        ({ timestamp, level, message }) =>
            `${String(timestamp)} [${String(level.toUpperCase())}]: ${String(message)}`
    )
)

// Define transports
const transports = [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
]

// Create the logger
const logger = winston.createLogger({
    level,
    levels,
    format,
    transports,
})

export default logger
=======
import winston from 'winston';
import { config } from '../configs/config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine log level based on environment
const level = config.nodeEnv === 'production' ? 'info' : 'debug';

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${String(timestamp)} [${String(level.toUpperCase())}]: ${String(message)}`
  )
);

// Define transports
const transports = [
  new winston.transports.Console(),
  new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  new winston.transports.File({ filename: 'logs/combined.log' }),
];

// Create the logger
const logger = winston.createLogger({
  level,
  levels,
  format,
  transports,
});

export default logger;
>>>>>>> c774751 (chore: fix project structure bug)

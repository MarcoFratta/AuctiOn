import mongoose from 'mongoose'
import logger from '../logger/Logger'

export const connectMongo = async (url: string) => {
  try {
    logger.info(`Connecting to MongoDB at: ${url}`)
    await mongoose.connect(url)
    logger.info('Successfully connected to MongoDB')
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error)
    process.exit(1) // Exit the process if the connection fails
  }
}

import { config } from '../configs/config'

import mongoose from 'mongoose'
import logger from './Logger'

const DB_URI = config.dbUri

export const connectToDatabase = async () => {
  try {
    logger.info(`Connecting to MongoDB at: ${DB_URI}`)
    await mongoose.connect(DB_URI)

    console.log('Successfully connected to MongoDB and redis')
  } catch (error) {
    console.error('Error connecting to databases:', error)
    process.exit(1) // Exit the process if the connection fails
  }
}

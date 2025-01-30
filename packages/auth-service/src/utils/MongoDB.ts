import { config } from '../configs/config'

import mongoose from 'mongoose'
import logger from './Logger'
import { redis } from '../App'

const DB_URI = config.dbUri

export const connectToDatabase = async () => {
  try {
    logger.info(`Connecting to MongoDB at: ${DB_URI}`)
    await Promise.all([mongoose.connect(DB_URI), redis.connect()])

    console.log('Successfully connected to MongoDB and redis')
  } catch (error) {
    console.error('Error connecting to databases:', error)
    processexit(1) // Exit the process if the connection fails
  }
}

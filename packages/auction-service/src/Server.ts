import express from 'express'
import http from 'http'
import { Kafka } from 'kafkajs'
import logger from './utils/Logger'
import { KafkaController } from './controllers/KafkaController'
import { AuctionService } from './services/AuctionService'
import { PlayerEventSource } from './adapters/PlayerEventSource'
import { AuctionServiceImpl } from './services/AuctionServiceImpl'
import { WebSocketAdapter } from './adapters/WebSocketAdapter'
import { PlayerChannel } from './adapters/PlayerChannel'
import { AuctionController } from './controllers/AuctionController'
import { AuctionEventsSource } from './services/AuctionEventsSource'

// Configuration
const PORT = process.env.PORT || 3000
const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',')

// Create Express app
const app = express()
const server = http.createServer(app)

// Initialize services
const auctionService: AuctionService & AuctionEventsSource = new AuctionServiceImpl()
const ws: PlayerEventSource & PlayerChannel = new WebSocketAdapter({ server: server })
const kafka = new Kafka({
  clientId: 'auction-game',
  brokers: KAFKA_BROKERS,
})
const auctionController = new AuctionController(auctionService, ws, ws)
const kafkaController = new KafkaController(kafka, auctionService, ws)

kafkaController.connect().then(() => {
  logger.info('Connected to Kafka')

  // Start the HTTP server
  server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`)
  })
})

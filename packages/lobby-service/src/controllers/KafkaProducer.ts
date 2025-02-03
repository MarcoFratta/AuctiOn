import { Kafka, Producer } from 'kafkajs'
import logger from '@auction/common/logger'
import { LobbyService } from '../services/LobbyService'
import { Lobby } from '../schemas/Lobby'
import { LobbyEvent } from '../schemas/LobbyEvents'
import {
  toLobbyCreatedEvent,
  toLobbyDeletedEvent,
  toLobbyJoinedEvent,
  toLobbyLeftEvent,
  toLobbyStartedEvent,
} from '../converters/EventConverter'

export class KafkaProducer {
  private readonly service: LobbyService
  private readonly kafkaProducer: Producer

  constructor(client: Kafka, service: LobbyService) {
    this.service = service
    this.kafkaProducer = client.producer()
    this.subscribeToEvents()
  }

  async connect(): Promise<void> {
    try {
      await this.kafkaProducer.connect()
      logger.info('Kafka producer connected successfully')
    } catch (error) {
      logger.error('Failed to connect Kafka producer:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.kafkaProducer.disconnect()
      logger.info('Kafka producer disconnected successfully')
    } catch (error) {
      logger.error('Failed to disconnect Kafka producer:', error)
      throw error
    }
  }

  private subscribeToEvents(): void {
    this.service.onLobbyJoined(this.handleLobbyJoined)
    this.service.onLobbyLeft(this.handleLobbyLeft)
    this.service.onLobbyCreated(this.handleLobbyCreated)
    this.service.onLobbyDeleted(this.handleLobbyDeleted)
    this.service.onLobbyStarted(this.handleLobbyStarted)
  }

  private async emitEvent(topic: string, payload: LobbyEvent): Promise<void> {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
      })
      logger.info(`Emitted event to Kafka - Topic: ${topic}, Type: ${payload.type}`)
    } catch (error) {
      logger.error(`Failed to emit Kafka event: ${error}`)
      throw error
    }
  }

  private handleLobbyJoined = async (lobby: Lobby, playerId: string): Promise<void> => {
    try {
      const event = toLobbyJoinedEvent(playerId).convert(lobby)
      await this.emitEvent('lobby-events', event)
    } catch (error) {
      logger.error(`Failed to handle lobby joined event for player ${playerId}:`, error)
    }
  }

  private handleLobbyLeft = async (lobby: Lobby, playerId: string): Promise<void> => {
    try {
      const event = toLobbyLeftEvent(playerId).convert(lobby)
      await this.emitEvent('lobby-events', event)
    } catch (error) {
      logger.error(`Failed to handle lobby left event for player ${playerId}:`, error)
    }
  }

  private handleLobbyCreated = async (lobby: Lobby): Promise<void> => {
    try {
      const event = toLobbyCreatedEvent.convert(lobby)
      await this.emitEvent('lobby-events', event)
    } catch (error) {
      logger.error(`Failed to handle lobby created event for lobby ${lobby.id}:`, error)
    }
  }

  private handleLobbyDeleted = async (lobby: Lobby): Promise<void> => {
    try {
      const event = toLobbyDeletedEvent.convert(lobby)
      await this.emitEvent('lobby-events', event)
    } catch (error) {
      logger.error(`Failed to handle lobby deleted event for lobby ${lobby.id}:`, error)
    }
  }

  private handleLobbyStarted = async (lobby: Lobby): Promise<void> => {
    try {
      const event = toLobbyStartedEvent.convert(lobby)
      await this.emitEvent('lobby-events', event)
    } catch (error) {
      logger.error(`Failed to handle lobby started event for lobby ${lobby.id}:`, error)
    }
  }
}

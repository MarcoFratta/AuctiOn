import { KafkaController } from '../src/controllers/KafkaController'
import { AuctionService } from '../src/services/AuctionService'
import { PlayerEventSource } from '../src/adapters/PlayerEventSource'
import { Kafka, Producer } from 'kafkajs'
import { mock, MockProxy } from 'jest-mock-extended'
import logger from '../src/utils/Logger'

jest.mock('../src/utils/Logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}))

describe('KafkaController', () => {
  let auctionService: MockProxy<AuctionService>
  let eventSource: MockProxy<PlayerEventSource>
  let kafkaProducer: MockProxy<Producer>
  let kafkaClient: Kafka
  let kafkaController: KafkaController

  beforeEach(() => {
    auctionService = mock<AuctionService>()
    eventSource = mock<PlayerEventSource>()
    kafkaClient = mock<Kafka>() // Using mocked Kafka
    kafkaProducer = mock<Producer>()
    kafkaClient.producer = jest.fn().mockReturnValue(kafkaProducer)
    kafkaController = new KafkaController(kafkaClient, auctionService, eventSource)
  })

  test('should emit player-connected event on player connect', async () => {
    const mockAuction = { id: 'auction123' } as any
    auctionService.getPlayerAuction.mockResolvedValue(mockAuction)

    await (kafkaController as any).handlePlayerConnect('player123')

    expect(kafkaClient.producer().send).toHaveBeenCalled()
  })

  test('should emit player-disconnected event on player disconnect', async () => {
    const mockAuction = { id: 'auction456' } as any
    auctionService.getPlayerAuction.mockResolvedValue(mockAuction)

    await (kafkaController as any).handlePlayerDisconnect('player456')

    expect(kafkaClient.producer().send).toHaveBeenCalled()
  })

  test('should log error when emitting event fails', async () => {
    ;(kafkaClient.producer().send as jest.Mock).mockRejectedValueOnce(new Error('Kafka send failed'))

    await (kafkaController as any).emitEvent('player-events', {
      type: 'player-connected',
      playerId: 'player123',
      auctionId: 'auction123',
      timestamp: new Date().toISOString(),
    })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to emit Kafka event'))
  })
})

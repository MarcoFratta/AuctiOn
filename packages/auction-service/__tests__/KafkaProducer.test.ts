import { KafkaProducer } from '../src/controllers/KafkaProducer'
import { AuctionService } from '../src/services/AuctionService'
import { PlayerEventSource } from '../src/adapters/PlayerEventSource'
import { Kafka, Producer } from 'kafkajs'
import { mock, MockProxy } from 'jest-mock-extended'

jest.setTimeout(60000)
describe('KafkaProducer', () => {
  let auctionService: MockProxy<AuctionService>
  let eventSource: MockProxy<PlayerEventSource>
  let kafkaProducer: MockProxy<Producer>
  let kafkaClient: Kafka
  let kafkaController: KafkaProducer

  beforeEach(() => {
    auctionService = mock<AuctionService>()
    eventSource = mock<PlayerEventSource>()
    kafkaClient = mock<Kafka>() // Using mocked Kafka
    kafkaProducer = mock<Producer>()
    kafkaClient.producer = jest.fn().mockReturnValue(kafkaProducer)
    kafkaController = new KafkaProducer(kafkaClient, auctionService, eventSource)
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
})

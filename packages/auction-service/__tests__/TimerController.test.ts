import { TimerController } from '../src/controllers/TimerController'
import { AuctionService } from '../src/services/AuctionService'
import { Auction } from '../src/schemas/Auction'
import { mock, MockProxy } from 'jest-mock-extended'
import { PlayerChannel } from '../src/adapters/PlayerChannel'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'

describe('TimerController', () => {
  let timerController: TimerController
  let mockAuctionService: jest.Mocked<AuctionService>
  let callbacks: Map<string, ((auction: Auction) => void)[]>
  let mockPlayerChannel: MockProxy<PlayerChannel>

  beforeEach(() => {
    jest.useFakeTimers()
    callbacks = new Map()


    mockAuctionService = {
      onNewSale: jest.fn((cb) => {
        if (!callbacks.has('onNewSale')) callbacks.set('onNewSale', [])
        callbacks.get('onNewSale')!.push(cb)
      }),
      onNewBid: jest.fn((cb) => {
        if (!callbacks.has('onNewBid')) callbacks.set('onNewBid', [])
        callbacks.get('onNewBid')!.push(cb)
      }),
      onRoundEnd: jest.fn((cb) => {
        if (!callbacks.has('onRoundEnd')) callbacks.set('onRoundEnd', [])
        callbacks.get('onRoundEnd')!.push(cb)
      }),
      onAuctionEnd: jest.fn((cb) => {
        if (!callbacks.has('onAuctionEnd')) callbacks.set('onAuctionEnd', [])
        callbacks.get('onAuctionEnd')!.push(cb)
      }),
      endRound: jest.fn(),
    } as unknown as jest.Mocked<AuctionService>
    mockPlayerChannel = mock<WebSocketAdapter>()
    timerController = new TimerController(mockAuctionService, mockPlayerChannel)
  })

  afterEach(() => {
    jest.useRealTimers()
    timerController.stop()
  })

  it('should start timer on new sale', () => {
    const mockAuction: Auction = {
      id: 'auction1',
      bidTime: 30,
      players: [],
      maxRound: 3,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    callbacks.get('onNewSale')![0](mockAuction)

    jest.advanceTimersByTime(30000)
    expect(mockAuctionService.endRound).toHaveBeenCalledWith('auction1')
  })

  it('should refresh timer on new bid', () => {
    const mockAuction: Auction = {
      id: 'auction1',
      bidTime: 30,
      players: [],
      maxRound: 3,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    // Start initial timer
    callbacks.get('onNewSale')![0](mockAuction)

    // Advance time partially
    jest.advanceTimersByTime(15000)
    expect(mockAuctionService.endRound).not.toHaveBeenCalled()

    // New bid comes in
    callbacks.get('onNewBid')![0](mockAuction)

    // Advance time by less than full duration
    jest.advanceTimersByTime(29000)
    expect(mockAuctionService.endRound).not.toHaveBeenCalled()

    // Advance remaining time
    jest.advanceTimersByTime(1000)
    expect(mockAuctionService.endRound).toHaveBeenCalledWith('auction1')
  })

  it('should clear timer on round end', () => {
    const mockAuction: Auction = {
      id: 'auction1',
      bidTime: 30,
      players: [],
      maxRound: 3,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    callbacks.get('onNewSale')![0](mockAuction)
    jest.advanceTimersByTime(30000)
    expect(mockAuctionService.endRound).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(70000)
    expect(mockAuctionService.endRound).toHaveBeenCalledTimes(1)

  })
  it('should clear timer on auction end', () => {
    const mockAuction: Auction = {
      id: 'auction1',
      bidTime: 10,
      players: [],
      maxRound: 3,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    callbacks.get('onNewSale')![0](mockAuction)
    jest.advanceTimersByTime(10000)
    expect(mockAuctionService.endRound).toHaveBeenCalledWith('auction1')
    expect(mockAuctionService.endRound).toHaveBeenCalledTimes(1)
    callbacks.get('onAuctionEnd')![0](mockAuction)
    jest.advanceTimersByTime(50000)
    expect(mockAuctionService.endRound).toHaveBeenCalledTimes(1)
  })
}) 
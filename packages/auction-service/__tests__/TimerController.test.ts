import { TimerController } from '../src/controllers/TimerController'
import { AuctionService } from '../src/services/AuctionService'
import { AuctionInfo } from '../src/schemas/Auction'
import { mock, MockProxy } from 'jest-mock-extended'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'

describe('TimerController', () => {
  let timerController: TimerController
  let mockAuctionService: jest.Mocked<AuctionService>
  let callbacks: Map<string, ((auction: AuctionInfo) => void)[]>
  let playerCallbacks: Map<string, ((playerId: string) => void)[]>
  let mockPlayerChannel: MockProxy<WebSocketAdapter>

  beforeEach(() => {
    jest.useFakeTimers()
    callbacks = new Map()
    playerCallbacks = new Map()


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
    mockPlayerChannel.onPlayerConnect.mockImplementation((cb) => {
      if (!playerCallbacks.has('onPlayerConnect')) playerCallbacks.set('onPlayerConnect', [])
      playerCallbacks.get('onPlayerConnect')!.push(cb)
    })

    timerController = new TimerController(mockAuctionService, mockPlayerChannel, mockPlayerChannel)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should start timer on new sale', () => {
    const mockAuction: AuctionInfo = {
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
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(1)
  })

  it('should refresh timer on new bid', () => {
    const mockAuction: AuctionInfo = {
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
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(1)

    // New bid comes in
    // timer should reset
    callbacks.get('onNewBid')![0](mockAuction)
    expect(mockAuctionService.endRound).not.toHaveBeenCalled()
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(2)
    // Advance time by less than full duration
    jest.advanceTimersByTime(29000)
    expect(mockAuctionService.endRound).not.toHaveBeenCalled()
    // Advance remaining time
    jest.advanceTimersByTime(1000)
    expect(mockAuctionService.endRound).toHaveBeenCalledWith('auction1')
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(2)
  })

  it('should clear timer on round end', () => {
    const mockAuction: AuctionInfo = {
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
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(1)
    jest.advanceTimersByTime(70000)
    expect(mockAuctionService.endRound).toHaveBeenCalledTimes(1)
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(1)

  })
  it('should clear timer on auction end', () => {
    const mockAuction: AuctionInfo = {
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
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(1)
    callbacks.get('onAuctionEnd')![0](mockAuction)
    jest.advanceTimersByTime(50000)
    expect(mockAuctionService.endRound).toHaveBeenCalledTimes(1)
    expect(mockPlayerChannel.broadcast).toHaveBeenCalledTimes(1)
  })
  it('should send time update on new player connected', () => {
    const auction: AuctionInfo = {
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
    mockAuctionService.getPlayerAuction = jest.fn()
    mockAuctionService.getPlayerAuction.mockResolvedValue(auction)
    playerCallbacks.get('onPlayerConnect')![0]('player1')
    expect(mockAuctionService.getPlayerAuction).toHaveBeenCalledWith('player1')
  })
}) 
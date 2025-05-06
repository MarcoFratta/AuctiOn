import { TimerServiceImpl } from '../src/services/TimerServiceImpl'
import { AuctionService } from '../src/services/AuctionService'
import { AuctionInfo } from '../src/schemas/Auction'
import { mock, MockProxy } from 'jest-mock-extended'
import { WebSocketAdapter } from '../src/adapters/WebSocketAdapter'
import { TimerRepo } from '../src/repositories/TimerRepo'
import { AuctionEventsSource } from '../src/services/AuctionEventsSource'

describe('TimerServiceImpl', () => {
  let timerController: TimerServiceImpl
  let mockAuctionService: MockProxy<AuctionService>
  let mockAuctionEventsSource: MockProxy<AuctionEventsSource>
  let mockPlayerChannel: MockProxy<WebSocketAdapter>
  let mockTimerRepo: MockProxy<TimerRepo>
  let timerStartCallback: jest.Mock

  beforeEach(() => {
    jest.useFakeTimers()

    // Create mocks
    mockAuctionService = mock<AuctionService>()
    mockAuctionEventsSource = mock<AuctionEventsSource>()
    mockPlayerChannel = mock<WebSocketAdapter>()
    mockTimerRepo = mock<TimerRepo>()
    timerStartCallback = jest.fn()

    // Setup timer controller
    timerController = new TimerServiceImpl(
      mockAuctionService,
      mockPlayerChannel,
      mockPlayerChannel,
      mockTimerRepo,
      mockAuctionEventsSource,
    )

    // Register timer start callback
    timerController.onTimerStart(timerStartCallback)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should start timer on new sale', async () => {
    const mockAuction: AuctionInfo = {
      id: 'auction1',
      bidTime: 30,
      players: [],
      creatorId: 'player1',
      maxRound: 3,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    // Get the callback registered with the auction service
    const newSaleCallback = mockAuctionService.onNewSale.mock.calls[0][0]

    // Call the callback with mock auction
    await newSaleCallback(mockAuction)

    // Use flushPromises to ensure all promises resolve
    await jest.runAllTimersAsync()

    // Verify timer was saved to Redis and callback was called
    expect(mockTimerRepo.saveTimer).toHaveBeenCalledWith(
      'auction1',
      expect.any(Number),
      30,
    )
    expect(timerStartCallback).toHaveBeenCalledWith('auction1', expect.any(Number))

    // Advance time to trigger timer completion
    await jest.advanceTimersByTimeAsync(30100)

    // Verify round was ended
    expect(mockAuctionService.endRound).toHaveBeenCalledWith('auction1')
  })

  it('should refresh timer on new bid', async () => {
    const mockAuction: AuctionInfo = {
      id: 'auction1',
      bidTime: 30,
      players: [],
      creatorId: 'player1',
      maxRound: 3,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    // Start initial timer
    const newSaleCallback = mockAuctionService.onNewSale.mock.calls[0][0]
    await newSaleCallback(mockAuction)

    // Reset mock calls to clearly see new calls
    mockTimerRepo.saveTimer.mockClear()
    timerStartCallback.mockClear()
    
    // Advance time partially
    await jest.advanceTimersByTimeAsync(15000)
    expect(mockAuctionService.endRound).not.toHaveBeenCalled()

    // New bid comes in - timer should reset
    const newBidCallback = mockAuctionEventsSource.onNewBid.mock.calls[0][0]
    await newBidCallback(mockAuction)

    // Verify timer was refreshed in Redis
    expect(mockTimerRepo.saveTimer).toHaveBeenCalledWith(
      'auction1',
      expect.any(Number),
      30,
    )

    // Verify timer start event was emitted again
    expect(timerStartCallback).toHaveBeenCalledWith('auction1', expect.any(Number))

    // Advance time by less than full duration
    await jest.advanceTimersByTimeAsync(29000)
    expect(mockAuctionService.endRound).not.toHaveBeenCalled()

    // Advance remaining time
    await jest.advanceTimersByTimeAsync(1100)
    expect(mockAuctionService.endRound).toHaveBeenCalledWith('auction1')
  })

  it('should call end round on timer end', async () => {
    const mockAuction: AuctionInfo = {
      id: 'auction1',
      bidTime: 30,
      creatorId: 'player1',
      players: [],
      maxRound: 3,
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    // Start timer
    const newSaleCallback = mockAuctionService.onNewSale.mock.calls[0][0]
    await newSaleCallback(mockAuction)

    // Advance time to trigger timer completion
    await jest.advanceTimersByTimeAsync(30100)

    // Verify endRound was called
    expect(mockAuctionService.endRound).toHaveBeenCalledWith('auction1')
  })

  it('should clear timer on auction deleted', async () => {
    const mockAuction: AuctionInfo = {
      id: 'auction1',
      bidTime: 10,
      players: [],
      maxRound: 3,
      creatorId: 'player1',
      maxPlayers: 4,
      startAmount: 100,
      startInventory: { items: [{ item: 'square', quantity: 1 }] },
      sellerQueue: [],
      currentRound: 1,
    }

    // Start timer
    const newSaleCallback = mockAuctionService.onNewSale.mock.calls[0][0]
    await newSaleCallback(mockAuction)

    // Simulate a bid to ensure timer is active
    const newRemoteBid = mockAuctionEventsSource.onNewBid.mock.calls[0][0]
    await newRemoteBid({
      ...mockAuction,
      currentBid: {
        playerId: 'player2',
        amount: 100,
        round: 1,
        timestamp: new Date().toISOString(),
      },
    })

    // Reset endRound mock to clearly see if it's called after deletion
    mockAuctionService.endRound.mockClear()

    // End auction
    const auctionEndCallback = mockAuctionService.onAuctionDeleted.mock.calls[0][0]
    await auctionEndCallback(mockAuction)

    // Verify timer was removed from Redis
    expect(mockTimerRepo.removeTimer).toHaveBeenCalledWith('auction1')

    // Advance time - should not trigger endRound
    await jest.advanceTimersByTimeAsync(40000)
    expect(mockAuctionService.endRound).not.toHaveBeenCalled()
  })
}) 
import { AuctionController } from '../src/controllers/AuctionController'
import { mock, MockProxy } from 'jest-mock-extended'
import { AuctionServiceImpl } from '../src/services/AuctionServiceImpl'
import { PlayerEventSource } from '../src/adapters/PlayerEventSource'
import { PlayerChannel } from '../src/adapters/PlayerChannel'
import { BidMessage, SaleMessage } from '../src/schemas/AuctionMessages'
import { Auction } from '../src/schemas/Auction'
import { ItemsMap } from '../src/schemas/Player'

describe('AuctionController', () => {
  let auctionService: MockProxy<AuctionServiceImpl>
  let eventSource: MockProxy<PlayerEventSource>
  let playerChannel: MockProxy<PlayerChannel>
  let auctionController: AuctionController

  beforeEach(() => {
    auctionService = mock<AuctionServiceImpl>()
    eventSource = mock<PlayerEventSource>()
    playerChannel = mock<PlayerChannel>()
    auctionController = new AuctionController(auctionService, eventSource, playerChannel)
  })

  test('should handle player connection', async () => {
    const playerId = 'player1'
    const mockAuction: Auction = {
      id: 'auction1',
      players: [],
      maxRound: 10,
      sellerQueue: ['player1', 'player2'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: undefined,
      startTimestamp: new Date(),
    }

    auctionService.getPlayerAuction.mockResolvedValue(mockAuction)

    await auctionController['handlePlayerConnect'](playerId)

    expect(auctionService.getPlayerAuction).toHaveBeenCalledWith(playerId)
    expect(playerChannel.sendToPlayer).toHaveBeenCalledWith(playerId, JSON.stringify({ type: 'auction', auction: mockAuction }))
    expect(playerChannel.broadcast).toHaveBeenCalledWith(JSON.stringify({ type: 'playerConnected', playerId }), expect.any(Function))
  })

  test('should handle player disconnection', async () => {
    const playerId = 'player1'

    auctionService.setPlayerState.mockResolvedValue({
      id: 'auction1',
      players: [],
      maxRound: 10,
      sellerQueue: ['player1', 'player2'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: undefined,
      startTimestamp: new Date(),
    })

    await auctionController['handlePlayerDisconnect'](playerId)

    expect(auctionService.setPlayerState).toHaveBeenCalledWith(playerId, 'disconnected')
    expect(playerChannel.broadcast).toHaveBeenCalledWith(JSON.stringify({ type: 'playerDisconnected', playerId }), expect.any(Function))
  })

  test('should handle player bid message', async () => {
    const playerId = 'player1'
    const message = JSON.stringify({
      type: 'bid',
      bid: {
        amount: 100,
        round: 1,
      },
    })
    const bid: BidMessage = { amount: 100, round: 1 }

    auctionService.playerBid.mockResolvedValue({
      id: 'auction1',
      players: [],
      maxRound: 10,
      sellerQueue: ['player1'],
      currentRound: 1,
      currentSale: undefined,
      currentBid: { ...bid, playerId: 'player1', timestamp: new Date() },
      startTimestamp: new Date(),
    })

    await auctionController['handlePlayerMessage'](playerId, message)

    expect(auctionService.playerBid).toHaveBeenCalledWith({
      playerId,
      amount: bid.amount,
      round: bid.round,
      timestamp: expect.any(Date),
    })
  })

  test('should handle player sell message', async () => {
    const playerId = 'player1'
    const saleItems: SaleMessage = {
      items: [
        { item: 'square', quantity: 2 },
        { item: 'circle', quantity: 1 },
      ],
    }
    const message = JSON.stringify({
      type: 'sell',
      sale: {
        items: saleItems.items,
      },
    })

    const itemsMap: ItemsMap = new Map([
      ['square', 2],
      ['circle', 1],
    ])

    auctionService.playerSale.mockResolvedValue({
      id: 'auction1',
      players: [],
      maxRound: 10,
      sellerQueue: ['player1'],
      currentRound: 1,
      currentSale: {
        items: itemsMap,
        sellerId: 'player1',
        endTimestamp: new Date(),
      },
      currentBid: undefined,
      startTimestamp: new Date(),
    })

    await auctionController['handlePlayerMessage'](playerId, message)

    expect(auctionService.playerSale).toHaveBeenCalledWith(playerId, itemsMap)
  })
})

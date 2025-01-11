import { AuctionServiceImpl } from '../src/services/AuctionServiceImpl'
import { Auction } from '../src/schemas/Auction'
import { ItemsMap, Player } from '../src/schemas/Player'
import { Bid } from '../src/schemas/Bid'

describe('AuctionServiceImpl', () => {
  let service: AuctionServiceImpl

  beforeEach(() => {
    service = new AuctionServiceImpl()
  })

  const mockPlayer = (id: string, money: number): Player => ({
    id,
    money,
    inventory: new Map([
      ['square', 0],
      ['triangle', 0],
      ['circle', 0],
    ]),
    status: 'active',
  })

  const createMockAuction = (): Auction => ({
    id: 'auction1',
    players: [mockPlayer('player1', 100), mockPlayer('player2', 100)],
    maxRound: 3,
    sellerQueue: [],
    currentRound: 0,
    currentSale: undefined,
    currentBid: { playerId: undefined, round: 0, amount: 0, timestamp: new Date() },
    startTimestamp: new Date(),
  })

  it('should create an auction', async () => {
    const auction = createMockAuction()
    const result = await service.createAuction(auction)
    expect(result.id).toBe(auction.id)
    expect(result.sellerQueue.length).toBe(2)
    expect(result.currentRound).toBe(1)
    expect(service['auctions'].has(auction.id)).toBe(true)
  })

  it('should throw an error if auction with the same ID already exists', async () => {
    const auction = createMockAuction()
    await service.createAuction(auction)
    await expect(service.createAuction(auction)).rejects.toThrow(
      `Auction with id ${auction.id} already exists`,
    )
  })

  it('should allow a player to bid higher than the current bid', async () => {
    const auction = createMockAuction()
    await service.createAuction(auction)

    const bid: Bid = { playerId: 'player1', round: 1, amount: 50, timestamp: new Date() }
    const updatedAuction = await service.playerBid('player1', bid)

    expect(updatedAuction.currentBid).toEqual(bid)
  })

  it('should throw an error if the player has insufficient funds to bid', async () => {
    const auction = createMockAuction()
    auction.players[0].money = 10
    await service.createAuction(auction)

    const bid: Bid = { playerId: 'player1', round: 1, amount: 50, timestamp: new Date() }
    await expect(service.playerBid('player1', bid)).rejects.toThrow(
      `Player with id player1 does not have enough money to place bid`,
    )
  })

  it('should throw an error if the bid round does not match the current round', async () => {
    const auction = createMockAuction()
    await service.createAuction(auction)

    const bid: Bid = { playerId: 'player1', round: 2, amount: 50, timestamp: new Date() }
    await expect(service.playerBid('player1', bid)).rejects.toThrow(
      `Bid round must match current round`,
    )
  })

  it('should allow a player to sell items and reset the bid', async () => {
    const auction = createMockAuction()
    auction.players[0].inventory.set('square', 5)
    await service.createAuction(auction)
    const saleItems: ItemsMap = new Map([['square', 2]])
    const updatedAuction = await service.playerSale('player1', saleItems)

    expect(updatedAuction.currentSale).toEqual({
      items: saleItems,
      sellerId: 'player1',
      endTimestamp: undefined,
    })
    expect(updatedAuction.currentBid.amount).toBe(1) // Reset bid to default
    expect(updatedAuction.players[0].inventory.get('square')).toBe(3)
  })

  it('should throw an error if the seller is not the current seller', async () => {
    const auction = createMockAuction()
    await service.createAuction(auction)

    const saleItems: ItemsMap = new Map([['square', 2]])
    await expect(service.playerSale('player2', saleItems)).rejects.toThrow(
      `Player with id player2 is not the current seller`,
    )
  })

  it('should end the round and transfer items and money', async () => {
    const auction = createMockAuction()
    auction.players[0].inventory.set('square', 5)
    await service.createAuction(auction)
    await service.playerSale('player1', new Map([['square', 2]]))
    await service.playerBid('player2', { playerId: 'player2', round: 1, amount: 50, timestamp: new Date() })

    const updatedAuction = await service.endRound('auction1')
    const player1 = updatedAuction.players[0]
    const player2 = updatedAuction.players[1]

    expect(player1.money).toBe(150) // Seller gains money
    expect(player1.inventory.get('square')).toBe(3) // Items reduced
    expect(player2.money).toBe(50) // Bidder loses money
    expect(player2.inventory.get('square')).toBe(2) // Items transferred
  })

  it('should end the auction when the last round is completed', async () => {
    const auction = createMockAuction()
    auction.maxRound = 1 // Set only one round
    await service.createAuction(auction)

    const endedAuction = await service.endRound('auction1')
    expect(service['auctions'].has('auction1')).toBe(false) // Auction removed
    expect(endedAuction.id).toBe('auction1') // Auction data returned
  })

  it('should throw an error if trying to end a non-existent auction', async () => {
    await expect(service.endRound('invalidAuction')).rejects.toThrow(
      `Auction with id invalidAuction not found`,
    )
  })
})

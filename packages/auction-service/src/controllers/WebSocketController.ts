import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { AuctionServiceImpl } from '../services/AuctionServiceImpl'

export class WebSocketController {
  private auctionService: AuctionServiceImpl
  private eventSource: PlayerEventSource

  constructor(auctionService: AuctionServiceImpl, eventSource: PlayerEventSource) {
    this.auctionService = auctionService
    this.eventSource = eventSource

    this.eventSource.onPlayerConnect(this.handlePlayerConnect.bind(this))
    this.eventSource.onPlayerDisconnect(this.handlePlayerDisconnect.bind(this))
    this.eventSource.onPlayerMessage(this.handlePlayerMessage.bind(this))
  }

  private handlePlayerMessage(playerId: string, message: string): void {
    // Handle incoming messages from the player
    const parsedMessage = JSON.parse(message)
    switch (parsedMessage.type) {
      case 'createAuction':
        this.auctionService.createAuction(parsedMessage.auction)
        break
      case 'placeBid':
        this.auctionService.playerBid(parsedMessage.bid)
        break
      case 'sellItems':
        this.auctionService.playerSale(playerId, parsedMessage.saleItems)
        break
      // Add more cases as needed
      default:
        console.error(`Unknown message type: ${parsedMessage.type}`)
    }
  }

  private handlePlayerConnect(playerId: string): void {
    // Handle player connection logic if needed
    console.log(`Player connected: ${playerId}`)
  }

  private handlePlayerDisconnect(playerId: string): void {
    // Handle player disconnection logic if needed
    console.log(`Player disconnected: ${playerId}`)
  }
}

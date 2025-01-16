import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { AuctionServiceImpl } from '../services/AuctionServiceImpl'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { validateSchema } from '../utils/Validator'
import { BidMessage, BidMsgSchema, SaleMessage, SaleMsgSchema } from '../schemas/AuctionMessages'
import { match } from 'ts-pattern'
import { Auction } from '../schemas/Auction'

export class AuctionController {
  private auctionService: AuctionServiceImpl
  private eventSource: PlayerEventSource
  private playerChannel: PlayerChannel

  constructor(auctionService: AuctionServiceImpl, eventSource: PlayerEventSource, playerChannel: PlayerChannel) {
    this.auctionService = auctionService
    this.eventSource = eventSource
    this.playerChannel = playerChannel

    this.eventSource.onPlayerConnect(this.handlePlayerConnect)
    this.eventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.eventSource.onPlayerMessage(this.handlePlayerMessage)
  }

  private handlePlayerMessage = (playerId: string, message: string): void => {
    const parsedMessage = JSON.parse(message)
    match(parsedMessage.type)
      .with('bid', () => {
        const msg: BidMessage = validateSchema(BidMsgSchema, parsedMessage.bid)
        const bid = {
          playerId,
          amount: msg.amount,
          round: msg.round,
          timestamp: new Date(),
        }
        this.auctionService.playerBid(bid).then(this.sendUpdatedAuction)
      })
      .with('sell', () => {
        const sale: SaleMessage = validateSchema(SaleMsgSchema, parsedMessage.sale)
        const itemsMap = new Map((sale.items ?? []).map(v => [v.item, v.quantity]))
        this.auctionService.playerSale(playerId, itemsMap).then(this.sendUpdatedAuction)
      })
  }

  private handlePlayerConnect = (playerId: string): void => {
    this.auctionService.getPlayerAuction(playerId).then(auction => {
      this.playerChannel.sendToPlayer(playerId, JSON.stringify({ type: 'auction', auction }))
    })
    this.playerChannel.broadcast(JSON.stringify({ type: 'playerConnected', playerId }), id => id !== playerId)
  }

  private handlePlayerDisconnect = (playerId: string): void => {
    this.auctionService.setPlayerState(playerId, 'disconnected').then(() => {
      this.playerChannel.broadcast(JSON.stringify({ type: 'playerDisconnected', playerId }), id => id !== playerId)
    })
  }

  private sendUpdatedAuction = (auction: Auction): void => {
    this.playerChannel.broadcast(JSON.stringify({ type: 'auction', auction }), id => auction.sellerQueue.includes(id))
  }
}

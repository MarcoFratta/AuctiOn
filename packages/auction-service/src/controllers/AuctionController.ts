import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { validateSchema } from '../utils/Validator'
import { BidMessage, BidMsgSchema, MessageType, MessageTypeSchema } from '../schemas/AuctionMessages'
import { match } from 'ts-pattern'
import { Auction } from '../schemas/Auction'
import logger from '../utils/Logger'
import { Bid, BidSchema } from '../schemas/Bid'
import { AuctionService } from '../services/AuctionService'
import { toPlayerAuction } from '../converters/AuctionConverter'
import { InventoryInputMsg, InventoryInputSchema } from '../schemas/Item'

export class AuctionController {
  private auctionService: AuctionService
  private eventSource: PlayerEventSource
  private playerChannel: PlayerChannel

  constructor(auctionService: AuctionService, eventSource: PlayerEventSource, playerChannel: PlayerChannel) {
    this.auctionService = auctionService
    this.eventSource = eventSource
    this.playerChannel = playerChannel

    this.eventSource.onPlayerConnect(this.handlePlayerConnect)
    this.eventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.eventSource.onPlayerMessage(this.handlePlayerMessage)
    this.auctionService.onAuctionEnd(this.handleAuctionEnd)
    this.auctionService.onRoundEnd(this.handleRoundEnd)
  }

  handlePlayerMessage = (playerId: string, message: string): void => {
    try {
      const parsedMessage = JSON.parse(message)
      const msgType: MessageType = validateSchema(MessageTypeSchema, parsedMessage.type)
      match(msgType)
        .with('bid', () => {
          const msg: BidMessage = validateSchema(BidMsgSchema, parsedMessage.bid)
          const bid: Bid = validateSchema(BidSchema, {
            playerId,
            amount: msg.amount,
            round: msg.round,
            timestamp: new Date().toISOString(),
          })
          this.auctionService
            .playerBid(bid)
            .then(a => this.sendUpdatedAuction(a, 'bid'))
            .catch(err => {
              this.handleErrors(err, playerId)
            })
        })
        .with('sell', () => {
          const sale: InventoryInputMsg = validateSchema(InventoryInputSchema, parsedMessage.sale)
          const itemsMap = new Map(sale.items.map(v => [v.item, v.quantity]))
          logger.info(`[Controller] Player ${playerId} selling items: ${JSON.stringify(itemsMap.entries())}`)
          this.auctionService
            .playerSale(playerId, itemsMap)
            .then(a => this.sendUpdatedAuction(a, 'sale'))
            .catch(err => {
              this.handleErrors(err, playerId)
            })
        })
        .exhaustive()
    } catch (e) {
      logger.error(`Error handling message from player ${playerId}: ${e}`)
      this.playerChannel.sendToPlayer(playerId, JSON.stringify({ type: 'error', message: 'Invalid message format' }))
    }
  }

  handlePlayerConnect = (playerId: string): void => {
    this.auctionService
      .setPlayerState(playerId, 'connected')
      .then(auction => {
        this.playerChannel.sendToPlayer(
          playerId,
          JSON.stringify({
            type: 'auction',
            auction: toPlayerAuction(playerId).convert(auction),
          })
        )
        this.playerChannel.broadcast(
          () =>
            JSON.stringify({
              type: 'playerConnected',
              playerId,
            }),
          this.allLobbyPlayersExcept(playerId, auction)
        )
      })
      .catch(err => {
        logger.error(`Error handling player connect: ${err}`)
        this.playerChannel.closeConnection(playerId, false, 'Connection failed')
      })
  }

  handlePlayerDisconnect = (playerId: string): void => {
    this.auctionService
      .setPlayerState(playerId, 'not-connected')
      .then(auction => {
        this.playerChannel.broadcast(
          id => {
            return JSON.stringify({
              type: 'playerDisconnected',
              playerId,
            })
          },
          this.allLobbyPlayersExcept(playerId, auction)
        )
      })
      .catch(() => {
        logger.info(`Player ${playerId} disconnected`)
      })
  }

  private sendUpdatedAuction = (auction: Auction, type: string = 'auction'): void => {
    logger.info(`Sending updated auction: ${JSON.stringify(auction)}`)
    this.playerChannel.broadcast(
      id =>
        JSON.stringify({
          type: type,
          auction: toPlayerAuction(id).convert(auction),
        }),
      id => auction.sellerQueue.includes(id)
    )
  }

  private allLobbyPlayersExcept = (playerId: string, auction: Auction): ((otherPlayerId: string) => boolean) => {
    return (otherPlayerId: string): boolean => {
      return auction.sellerQueue.includes(otherPlayerId) && playerId !== otherPlayerId
    }
  }
  private allLobbyPlayers = (auction: Auction): ((playerId: string) => boolean) => {
    return (playerId: string): boolean => {
      return auction.sellerQueue.includes(playerId)
    }
  }

  private handleAuctionEnd = (auction: Auction): void => {
    this.playerChannel.broadcast(
      id => JSON.stringify({ type: 'auctionEnd', auction: toPlayerAuction(id).convert(auction) }),
      this.allLobbyPlayers(auction)
    )
    auction.players.forEach(player => {
      this.playerChannel.closeConnection(player.id, true, 'Auction ended')
    })
  }
  private handleRoundEnd = (auction: Auction) => {
    logger.info(`[Controller] sending updated auction after round end ${auction.id}`)
    this.playerChannel.broadcast(
      id => JSON.stringify({ type: 'roundEnd', auction: toPlayerAuction(id).convert(auction) }),
      this.allLobbyPlayers(auction)
    )
  }

  private handleErrors(error: Error, playerId: string): void {
    this.playerChannel.sendToPlayer(playerId, JSON.stringify({ type: 'error', message: error.message }))
    logger.error(`Error handling message: ${error}`)
  }
}

import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { validateSchema } from '@auction/common/validation'
import { match } from 'ts-pattern'
import logger from '@auction/common/logger'
import { Bid, BidSchema } from '../schemas/Bid'
import { AuctionService } from '../services/AuctionService'
import { ItemSchema } from '../schemas/Item'
import {
  AuctionMessage,
  errorMsgSchema,
  NewBidMsg,
  newBidMsgSchema,
  NewSaleMsg,
  newSaleMsgSchema,
  PlayerActionsType,
  playerActionsTypeSchema,
} from '@auction/common/messages'
import { errorMessage } from '../domain/messages/MessageFactory'
import { Sale, SaleSchema } from '../schemas/Sale'

export class MessageHandler {
  private playerEventSource: PlayerEventSource
  private playerChannel: PlayerChannel
  private auctionService: AuctionService

  constructor(playerEventSource: PlayerEventSource, playerChannel: PlayerChannel, auctionService: AuctionService) {
    this.playerEventSource = playerEventSource
    this.playerChannel = playerChannel
    this.auctionService = auctionService
    this.playerEventSource.onPlayerConnect(this.handlePlayerConnect)
    this.playerEventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.playerEventSource.onPlayerMessage(this.handlePlayerMessage)
  }

  private handlePlayerMessage = (playerId: string, message: AuctionMessage): void => {
    try {
      const msgType: PlayerActionsType = validateSchema(playerActionsTypeSchema, message.type)
      match(msgType)
        .with('bid', () => {
          const msg: NewBidMsg = validateSchema(newBidMsgSchema, message)
          const bid: Bid = validateSchema(BidSchema, {
            playerId,
            amount: msg.bid.amount,
            round: msg.bid.round,
            timestamp: new Date().toISOString(),
          })
          this.auctionService
            .playerBid(bid)
            .then(a => logger.debug(`Bid placed for auction ${a.id}: ${JSON.stringify(bid)}`))
            .catch(err => this.handleErrors(err, playerId))
        })
        .with('sell', () => {
          const msg: NewSaleMsg = validateSchema(newSaleMsgSchema, message)
          const itemsMap = new Map(msg.sale.items.map(({ item, quantity }) => [ItemSchema.parse(item), quantity]))
          const sale: Sale = validateSchema(SaleSchema, {
            sellerId: playerId,
            items: itemsMap,
            endTimestamp: undefined,
          })
          this.auctionService
            .playerSale(sale)
            .then(a => logger.debug(`Sale placed for auction ${a.id}: ${JSON.stringify(msg.sale.items)}`))
            .catch(err => this.handleErrors(err, playerId))
        })
        .exhaustive()
    } catch (e) {
      logger.debug(`Error handling message from player ${playerId}: ${e}`)
      this.playerChannel.sendToPlayer(
        playerId,
        validateSchema(errorMsgSchema, {
          type: 'error',
          message: 'Invalid message format',
        })
      )
    }
  }
  private handlePlayerConnect = (playerId: string): void => {
    this.auctionService
      .setPlayerState(playerId, 'connected')
      .then(() => {
        logger.debug(`Handling player connected message`)
      })
      .catch(err => {
        logger.error(`Error handling player connect: ${err}`)
        this.playerChannel.closeConnection(playerId, false, 'Not joined to an auction')
      })
  }
  private handlePlayerDisconnect = (playerId: string): void => {
    this.auctionService
      .setPlayerState(playerId, 'not-connected')
      .then(() => {
        logger.debug(`Handling player ${playerId} disconnected message`)
      })
      .catch(() => {
        logger.debug(`Disconnect player ${playerId} from an ended auction} `)
      })
  }

  private handleErrors(error: Error, playerId: string): void {
    this.playerChannel.sendToPlayer(playerId, errorMessage(error.message))
    logger.warn(`Error handling message: ${error}`)
  }
}

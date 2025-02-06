import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { validateSchema } from '@auction/common/validation'
import { match } from 'ts-pattern'
import { Auction } from '../schemas/Auction'
import logger from '@auction/common/logger'
import { Bid, BidSchema } from '../schemas/Bid'
import { AuctionService } from '../services/AuctionService'
import { ItemSchema } from '../schemas/Item'
import { Leaderboard } from '../schemas/Leaderboard'
import {
  errorMsgSchema,
  NewBidMsg,
  newBidMsgSchema,
  NewSaleMsg,
  newSaleMsgSchema,
  PlayerActionsType,
  playerActionsTypeSchema,
} from '@auction/common/messages'
import { Player } from 'schemas/Player'
import {
  auctionDeletedMessage,
  auctionEndMessage,
  auctionMessage,
  bidUpdateMessage,
  errorMessage,
  playerConnectedMessage,
  playerDisconnectedMessage,
  roundEndMessage,
  saleUpdateMessage,
} from '../domain/messages/MessageFactory'
import { Sale, SaleSchema } from '../schemas/Sale'

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
    this.auctionService.onAuctionDeleted(this.handleAuctionDeleted)
    this.auctionService.onPlayerLeave(this.handlePlayerLeave)
  }

  handlePlayerMessage = (playerId: string, message: string): void => {
    try {
      const parsedMessage = JSON.parse(message)
      const msgType: PlayerActionsType = validateSchema(playerActionsTypeSchema, parsedMessage.type)
      match(msgType)
        .with('bid', () => {
          const msg: NewBidMsg = validateSchema(newBidMsgSchema, parsedMessage)
          const bid: Bid = validateSchema(BidSchema, {
            playerId,
            amount: msg.bid.amount,
            round: msg.bid.round,
            timestamp: new Date().toISOString(),
          })
          this.auctionService
            .playerBid(bid)
            .then(a => this.lobbyBroadcast(a.players, bidUpdateMessage(bid)))
            .catch(err => this.handleErrors(err, playerId))
        })
        .with('sell', () => {
          const msg: NewSaleMsg = validateSchema(newSaleMsgSchema, parsedMessage)
          const itemsMap = new Map(msg.sale.items.map(({ item, quantity }) => [ItemSchema.parse(item), quantity]))
          const sale: Sale = validateSchema(SaleSchema, {
            sellerId: playerId,
            items: itemsMap,
            endTimestamp: undefined,
          })
          this.auctionService
            .playerSale(playerId, itemsMap)
            .then(a => this.lobbyBroadcast(a.players, saleUpdateMessage(sale)))
            .catch(err => this.handleErrors(err, playerId))
        })
        .exhaustive()
    } catch (e) {
      logger.error(`Error handling message from player ${playerId}: ${e}`)
      this.playerChannel.sendToPlayer(
        playerId,
        JSON.stringify(
          validateSchema(errorMsgSchema, {
            type: 'error',
            message: 'Invalid message format',
          })
        )
      )
    }
  }

  handlePlayerConnect = (playerId: string): void => {
    this.auctionService
      .setPlayerState(playerId, 'connected')
      .then(auction => {
        logger.debug(`Sending auction message to player ${playerId}`)
        this.playerChannel.sendToPlayer(playerId, JSON.stringify(auctionMessage(auction, playerId)))
        logger.debug(`Broadcasting player connected message to auction players`)
        this.lobbyBroadcast(
          auction.players.filter(p => p.id !== playerId),
          playerConnectedMessage(playerId)
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
        this.lobbyBroadcast(auction.players, playerDisconnectedMessage(playerId))
      })
      .catch(() => {
        logger.debug(`Player ${playerId} disconnected`)
      })
  }

  private lobbyBroadcast = (players: Player[], msg: any): void => {
    players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, JSON.stringify(msg))
    })
  }

  private handleAuctionEnd = (leaderboard: Leaderboard, _: string): void => {
    const players = [...leaderboard.leaderboard, ...leaderboard.removed]
    players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, JSON.stringify(auctionEndMessage(leaderboard)))
      this.playerChannel.closeConnection(player.id, true, 'Auction ended')
    })
  }
  private handleRoundEnd = (auction: Auction) => {
    auction.players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, JSON.stringify(roundEndMessage(auction, player.id)))
    })
  }

  private handleErrors(error: Error, playerId: string): void {
    this.playerChannel.sendToPlayer(playerId, JSON.stringify(errorMessage(error.message)))
    logger.warn(`Error handling message: ${error}`)
  }

  private handleAuctionDeleted = (auction: Auction) => {
    this.lobbyBroadcast(auction.players, auctionDeletedMessage())

    auction.players.forEach(player => {
      logger.debug(`[Controller] Closing connection for player ${player.id} after auction deletion`)
      this.playerChannel.closeConnection(player.id, true, 'Auction ended')
    })
  }
  private handlePlayerLeave = (playerId: string) => {
    this.playerChannel.closeConnection(playerId, true, 'Player left the auction')
  }
}

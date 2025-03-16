import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { validateSchema } from '@auction/common/validation'
import { match } from 'ts-pattern'
import logger from '@auction/common/logger'
import { Bid, BidSchema } from '../schemas/Bid'
import { AuctionService } from '../services/AuctionService'
import { ItemSchema } from '../schemas/Item'
import { Leaderboard } from '../schemas/Leaderboard'
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
import { Player, PlayerInfo } from 'schemas/Player'
import {
  auctionDeletedMessage,
  auctionEndMessage,
  auctionMessage,
  auctionStartMessage,
  bidUpdateMessage,
  errorMessage,
  playerConnectedMessage,
  playerDisconnectedMessage,
  playerInfoMessage,
  playerJoinMessage,
  playerLeaveMessage,
  roundEndMessage,
  saleUpdateMessage,
} from '../domain/messages/MessageFactory'
import { Sale, SaleSchema } from '../schemas/Sale'
import { AuctionInfo } from '../schemas/Auction'
import { UserService } from '../services/UserService'

export class AuctionController {
  private auctionService: AuctionService
  private eventSource: PlayerEventSource
  private playerChannel: PlayerChannel
  private userService: UserService

  constructor(auctionService: AuctionService, eventSource: PlayerEventSource, playerChannel: PlayerChannel, userService: UserService) {
    this.auctionService = auctionService
    this.eventSource = eventSource
    this.playerChannel = playerChannel
    this.userService = userService
    this.eventSource.onPlayerConnect(this.handlePlayerConnect)
    this.eventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.eventSource.onPlayerMessage(this.handlePlayerMessage)
    this.auctionService.onAuctionEnd(this.handleAuctionEnd)
    this.auctionService.onRoundEnd(this.handleRoundEnd)
    this.auctionService.onAuctionStart(this.handleAuctionStart)
    this.auctionService.onAuctionDeleted(this.handleAuctionDeleted)
    this.auctionService.onPlayerLeave(this.handlePlayerLeave)
    this.auctionService.onPlayerJoin(this.handlePlayerJoin)
    this.userService.onPlayerChange(this.sendPlayerInfo)
  }

  handlePlayerMessage = (playerId: string, message: AuctionMessage): void => {
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
            .then(a => this.lobbyBroadcast(a.players, bidUpdateMessage(bid)))
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
            .then(a => this.lobbyBroadcast(a.players, saleUpdateMessage(sale)))
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

  handlePlayerConnect = (playerId: string): void => {
    this.auctionService
      .setPlayerState(playerId, 'connected')
      .then(auction => {
        this.playerChannel.sendToPlayer(playerId, auctionMessage(auction, playerId))
        auction.players.forEach(p => {
          this.userService
            .getUser(p.id)
            .then(info => {
              if (info) {
                logger.info(`Sending player ${p.id} join message to player ${playerId}`)
                this.playerChannel.sendToPlayer(playerId, playerJoinMessage(p.id, info, true))
                if (p.status == 'connected') {
                  logger.info(`Sending player ${p.id} connect message to player ${playerId}`)
                  this.playerChannel.sendToPlayer(playerId, playerConnectedMessage(p.id, true))
                }
                this.playerChannel.sendToPlayer(playerId, playerInfoMessage(p.id, info, true))
              }
            })
            .catch(err => logger.error(`Error getting user info: ${err}`))
        })

        logger.info(`Broadcasting player connected message to auction players`)
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

  private lobbyBroadcast = (players: Player[], msg: AuctionMessage): void => {
    players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, msg)
    })
  }

  private handleAuctionEnd = (leaderboard: Leaderboard, _: string): void => {
    const players = [...leaderboard.leaderboard, ...leaderboard.removed]
    players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, auctionEndMessage(leaderboard))
      this.playerChannel.closeConnection(player.id, true, 'Auction ended')
    })
  }
  private handleRoundEnd = (auction: AuctionInfo) => {
    auction.players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, roundEndMessage(auction, player.id))
    })
  }

  private handleErrors(error: Error, playerId: string): void {
    this.playerChannel.sendToPlayer(playerId, errorMessage(error.message))
    logger.warn(`Error handling message: ${error}`)
  }

  private handleAuctionDeleted = (auction: AuctionInfo) => {
    this.lobbyBroadcast(auction.players, auctionDeletedMessage())

    auction.players.forEach(player => {
      logger.debug(`[Controller] Closing connection for player ${player.id} after auction deletion`)
      this.playerChannel.closeConnection(player.id, true, 'Auction ended')
    })
  }
  private handlePlayerLeave = (auctionId: string, playerId: string) => {
    this.playerChannel.closeConnection(playerId, true, 'Player left the auction')
    this.auctionService
      .getAuction(auctionId)
      .then(auction => {
        this.lobbyBroadcast(auction.players, playerLeaveMessage(playerId))
      })
      .catch(err => {
        logger.warn(`Error handling player leave: ${err}`)
      })
  }
  private handlePlayerJoin = (auctionId: string, playerId: string) => {
    this.auctionService
      .getAuction(auctionId)
      .then(async auction => {
        const info = await this.userService.getUser(playerId)
        if (info) {
          this.lobbyBroadcast(
            auction.players.filter(p => p.id != playerId),
            playerJoinMessage(playerId, info)
          )
        }
      })
      .catch(err => {
        logger.warn(`Error handling player join: ${err}`)
      })
  }
  private sendPlayerInfo = (playerId: Player['id'], playerInfo: PlayerInfo) => {
    this.auctionService.getPlayerAuction(playerId).then(auction => {
      this.lobbyBroadcast(auction.players, playerInfoMessage(playerId, playerInfo))
    })
  }
  private handleAuctionStart = (auction: AuctionInfo) => {
    auction.players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, auctionStartMessage(auction, player.id))
    })
  }
}

import { AuctionService } from '../services/AuctionService'
import { PlayerChannel } from '../adapters/PlayerChannel'
import { PlayerEventSource } from '../adapters/PlayerEventSource'
import { UserService } from '../services/UserService'
import {
  auctionDeletedMessage,
  auctionEndMessage,
  auctionMessage,
  auctionStartMessage,
  bidUpdateMessage,
  playerConnectedMessage,
  playerDisconnectedMessage,
  playerInfoMessage,
  playerJoinMessage,
  playerLeaveMessage,
  roundEndMessage,
  saleUpdateMessage,
  timerStartMessage,
} from '../domain/messages/MessageFactory'
import logger from '@auction/common/logger'
import { Player, PlayerInfo } from '../schemas/Player'
import { AuctionMessage } from '@auction/common/messages'
import { Leaderboard } from '../schemas/Leaderboard'
import { AuctionInfo } from '../schemas/Auction'
import { UserEventSource } from '../services/UserEventSource'
import { TimerEventSource } from '../services/TimerEventSource'
import { AuctionEventsSource } from '../services/AuctionEventsSource'

export class MessageSender {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly auctionEventsSource: AuctionEventsSource,
    private readonly playerChannel: PlayerChannel,
    private readonly playerEventSource: Omit<PlayerEventSource, 'onPlayerMessage'>,
    private readonly userService: UserService,
    private readonly userEventSource: UserEventSource,
    private readonly timerEventSource: TimerEventSource
  ) {
    this.playerEventSource.onPlayerConnect(this.handlePlayerConnect)
    this.playerEventSource.onPlayerDisconnect(this.handlePlayerDisconnect)
    this.auctionEventsSource.onAuctionEnd(this.handleAuctionEnd)
    this.auctionEventsSource.onRoundEnd(this.handleRoundEnd)
    this.auctionEventsSource.onNewBid(this.handleNewBid)
    this.auctionEventsSource.onNewSale(this.handleNewSale)
    this.auctionEventsSource.onAuctionStart(this.handleAuctionStart)
    this.auctionEventsSource.onPlayerLeave(this.handlePlayerLeave)
    this.auctionEventsSource.onPlayerJoin(this.handlePlayerJoin)
    this.auctionEventsSource.onAuctionDeleted(this.handleAuctionDeleted)
    this.userEventSource.onPlayerChange(this.handlePlayerChange)
    this.timerEventSource.onTimerStart(this.handleTimerStart)
  }

  private handlePlayerConnect = (playerId: string) => {
    this.auctionService
      .getPlayerAuction(playerId)
      .then(auction => {
        this.playerChannel.sendToPlayer(playerId, auctionMessage(auction, playerId))
        auction.players.forEach(p => {
          this.userService
            .getUser(p.id)
            .then(info => {
              if (info) {
                this.playerChannel.sendToPlayer(playerId, playerJoinMessage(p.id, info, true))
                if (p.status == 'connected') {
                  this.playerChannel.sendToPlayer(playerId, playerConnectedMessage(p.id, true))
                }
                this.playerChannel.sendToPlayer(playerId, playerInfoMessage(p.id, info, true))
              } else {
                logger.error(`User info not found for player ${p.id} in auction ${auction.id}`)
              }
            })
            .catch(err => logger.error(`Error getting user info: ${err}`))
        })

        logger.debug(`Broadcasting player connected message to auction players`)
        this.lobbyBroadcast(
          auction.players.filter(p => p.id !== playerId),
          playerConnectedMessage(playerId)
        )
      })
      .catch(err => logger.error(`Error sending player connect: ${err}, auction not found`))
  }
  private handlePlayerDisconnect = (playerId: string) => {
    this.auctionService
      .getPlayerAuction(playerId)
      .then(auction => {
        this.lobbyBroadcast(auction.players, playerDisconnectedMessage(playerId))
      })
      .catch(err =>
        logger.debug(`Avoid sending player disconnect: ${err}, 
    auction might have ended`)
      )
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
      logger.info(`Sending round end message to player ${player.id} for auction ${auction.id}`)
      this.playerChannel.sendToPlayer(player.id, roundEndMessage(auction, player.id))
    })
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
        if (!auction.currentSale) {
          auction.players.forEach(player => {
            this.playerChannel.sendToPlayer(player.id, auctionMessage(auction, player.id))
          })
        }
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
  private handlePlayerChange = (playerId: Player['id'], playerInfo: PlayerInfo) => {
    this.auctionService
      .getPlayerAuction(playerId)
      .then(auction => {
        this.lobbyBroadcast(auction.players, playerInfoMessage(playerId, playerInfo))
      })
      .catch(err => logger.error(`Error handling player change: ${err}`))
  }
  private handleAuctionStart = (auction: AuctionInfo) => {
    auction.players.forEach(player => {
      this.playerChannel.sendToPlayer(player.id, auctionStartMessage(auction, player.id))
    })
  }
  private handleNewBid = (auction: AuctionInfo) => {
    if (!auction.currentBid) {
      logger.warn(`No current bid found for auction ${auction.id} while sending new bid message`)
      return
    }
    this.lobbyBroadcast(auction.players, bidUpdateMessage(auction.currentBid))
  }
  private handleNewSale = (auction: AuctionInfo) => {
    if (!auction.currentSale) {
      logger.warn(`No current sale found for auction ${auction.id} while sending new sale message`)
      return
    }
    this.lobbyBroadcast(auction.players, saleUpdateMessage(auction.currentSale))
  }
  // make timer controller handle timer start from other services or using sale
  private handleTimerStart = (auctionId: string, timerStart: number) => {
    const msg = timerStartMessage(timerStart)
    this.auctionService
      .getAuction(auctionId)
      .then(auction => {
        this.lobbyBroadcast(auction.players, msg)
      })
      .catch(() => logger.debug(`[MessageSender] Auction ${auctionId} not found for timer start`))
  }
}

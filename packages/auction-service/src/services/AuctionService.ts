import { AuctionConfig, AuctionInfo } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { Player, PlayerState } from '../schemas/Player'
import { AuctionEventsSource } from './AuctionEventsSource'
import { Leaderboard } from '../schemas/Leaderboard'
import { Sale } from '../schemas/Sale'
import { Auction } from '../domain/auctions/Auction'

export interface AuctionService extends AuctionEventsSource {
  createAuction: (auction: AuctionConfig) => Promise<AuctionInfo>
  getAuction: (auctionId: Auction['id']) => Promise<AuctionInfo>
  getPlayerAuction: (playerId: Player['id']) => Promise<AuctionInfo>
  setPlayerState: (playerId: Player['id'], state: PlayerState) => Promise<AuctionInfo>
  playerJoin: (playerId: Player['id'], auctionId: Auction['id']) => Promise<AuctionInfo>
  playerLeave: (playerId: Player['id'], auctionId: Auction['id']) => Promise<AuctionInfo>
  playerBid: (bid: Bid) => Promise<AuctionInfo>
  playerSale: (sale: Sale) => Promise<AuctionInfo>
  endRound: (auctionId: Auction['id']) => Promise<AuctionInfo | Leaderboard>
  startAuction: (auctionId: Auction['id']) => Promise<AuctionInfo>
  removeAuction: (auctionId: Auction['id']) => Promise<void>
}

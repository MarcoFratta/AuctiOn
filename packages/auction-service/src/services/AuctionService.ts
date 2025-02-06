import { Auction, AuctionConfig } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { ItemsMap, PlayerState } from '../schemas/Player'
import { AuctionEventsSource } from './AuctionEventsSource'
import { Leaderboard } from '../schemas/Leaderboard'

export interface AuctionService extends AuctionEventsSource {
  createAuction: (auction: AuctionConfig) => Promise<Auction>
  getAuction: (auctionId: string) => Promise<Auction>
  getPlayerAuction: (playerId: string) => Promise<Auction>
  setPlayerState: (playerId: string, state: PlayerState) => Promise<Auction>
  playerJoin: (playerId: string, auctionId: string) => Promise<Auction>
  playerLeave: (playerId: string, auctionId: string) => Promise<Auction>
  playerBid: (bid: Bid) => Promise<Auction>
  playerSale: (playerId: string, sale: ItemsMap) => Promise<Auction>
  endRound: (auctionId: string) => Promise<Auction | Leaderboard>
  endAuction: (auctionId: string) => Promise<Leaderboard>
  startAuction: (auctionId: string) => Promise<Auction>
  removeAuction: (auctionId: string) => Promise<void>
}

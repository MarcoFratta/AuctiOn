import { Auction, AuctionConfig } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { ItemsMap, Player, PlayerState } from '../schemas/Player'
import { AuctionEventsSource } from './AuctionEventsSource'
import { Leaderboard } from '../schemas/Leaderboard'

export interface AuctionService extends AuctionEventsSource {
  createAuction: (auction: AuctionConfig) => Promise<Auction>
  getAuction: (auctionId: Auction['id']) => Promise<Auction>
  getPlayerAuction: (playerId: Player['id']) => Promise<Auction>
  setPlayerState: (playerId: Player['id'], state: PlayerState) => Promise<Auction>
  playerJoin: (playerId: Player['id'], auctionId: Auction['id']) => Promise<Auction>
  playerLeave: (playerId: Player['id'], auctionId: Auction['id']) => Promise<Auction>
  playerBid: (bid: Bid) => Promise<Auction>
  playerSale: (playerId: Player['id'], sale: ItemsMap) => Promise<Auction>
  endRound: (auctionId: Auction['id']) => Promise<Auction | Leaderboard>
  endAuction: (auctionId: Auction['id']) => Promise<Leaderboard>
  startAuction: (auctionId: Auction['id']) => Promise<Auction>
  removeAuction: (auctionId: Auction['id']) => Promise<void>
}

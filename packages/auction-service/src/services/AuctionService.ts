import { Auction } from '../schemas/Auction'
import { Bid } from '../schemas/Bid'
import { ItemsMap } from '../schemas/Player'

export interface AuctionService {
  createAuction: (auction: Auction) => Promise<Auction>
  getAuction: (auctionId: string) => Promise<Auction>
  getPlayerAuction: (playerId: string) => Promise<Auction>
  setPlayerState: (playerId: string, state: string) => Promise<void>
  playerBid: (bid: Bid) => Promise<Auction>
  playerSale: (playerId: string, sale: ItemsMap) => Promise<Auction>
  endRound: (auctionId: string) => Promise<Auction>
  endAuction: (auctionId: string) => Promise<Auction>
}

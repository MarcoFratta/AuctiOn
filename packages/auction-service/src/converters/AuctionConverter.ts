import { Converter } from './Converter'
import { Auction } from '../schemas/Auction'
import { ItemsMap, Player } from '../schemas/Player'
import { validateSchema } from '../utils/Validator'
import { Sale } from '../schemas/Sale'
import { InventoryOutputMsg, InventoryOutputSchema, ItemWeights } from '../schemas/Item'
import {
  PlayerAuction,
  PlayerAuctionSchema,
  PlayerInfoMessage,
  PlayerInfoSchema,
  SaleInfo,
  SaleInfoSchema,
} from '../schemas/AuctionMessages'

export const saleWeight: Converter<Sale, number> = {
  convert: (sale: Sale): number => {
    return [...sale.items.entries()].map(([item, quantity]) => quantity * ItemWeights[item]).reduce((acc, curr) => acc + curr, 0)
  },
}

export const toSaleInfo: Converter<Sale, SaleInfo> = {
  convert: (sale: Sale): SaleInfo => {
    return validateSchema(SaleInfoSchema, {
      weight: saleWeight.convert(sale),
    })
  },
}
export const toInventoryMap: Converter<InventoryOutputMsg, ItemsMap> = {
  convert: (inventory: InventoryOutputMsg): ItemsMap => {
    return new Map(inventory.items.map(({ item, quantity }) => [item, quantity]))
  },
}
export const toInventory: Converter<ItemsMap, InventoryOutputMsg> = {
  convert: (inventory: ItemsMap): InventoryOutputMsg => {
    return validateSchema(InventoryOutputSchema, {
      items: [...inventory.entries()].map(([item, quantity]) => ({
        item: item,
        quantity: quantity,
      })),
    })
  },
}
export const toPlayerInfo: Converter<Player, PlayerInfoMessage> = {
  convert: (player: Player): PlayerInfoMessage => {
    return validateSchema(PlayerInfoSchema, {
      inventory: toInventory.convert(player.inventory),
      money: player.money,
    })
  },
}

export const toPlayerAuction = (playerId: string): Converter<Auction, PlayerAuction> => {
  return {
    convert: (auction: Auction): PlayerAuction => {
      const player: Player | undefined = auction.players.find(player => player.id === playerId)

      if (!player) {
        throw new Error(`Player with ID ${playerId} not found in auction.`)
      }

      return validateSchema(PlayerAuctionSchema, {
        id: auction.id,
        maxRound: auction.maxRound,
        sellerQueue: auction.sellerQueue,
        currentRound: auction.currentRound,
        currentBid: auction.currentBid,
        maxPlayers: auction.maxPlayers,
        bidTime: auction.bidTime,
        startInventory: auction.startInventory,
        startAmount: auction.startAmount,
        startTimestamp: auction.startTimestamp,
        playerInfo: toPlayerInfo.convert(player),
        saleInfo: auction.currentSale ? toSaleInfo.convert(auction.currentSale) : undefined,
      })
    },
  }
}

import { Converter } from './Converter'
import { Auction, AuctionSchema, StoredAuction, StoredAuctionSchema } from '../schemas/Auction'
import { ItemsMap, Player } from '../schemas/Player'
import { validateSchema } from '@auction/common/validation'
import { Sale } from '../schemas/Sale'
import { InventoryOutput, InventoryOutputSchema, ItemWeights } from '../schemas/Item'
import {
  PlayerAuction,
  PlayerAuctionSchema,
  PlayerInfoMessage,
  PlayerInfoSchema,
  SaleInfo,
  SaleInfoSchema,
} from '../schemas/AuctionMessages'

export const toWeight: Converter<InventoryOutput, number> = {
  convert: (inventory: InventoryOutput): number => {
    return inventory.items.map(({ quantity, item }) => quantity * ItemWeights[item]).reduce((acc, curr) => acc + curr, 0)
  },
}

export const saleWeight: Converter<Sale, number> = {
  convert: (sale: Sale): number => {
    return toWeight.convert(toInventory.convert(sale.items))
  },
}

export const toSaleInfo: Converter<Sale, SaleInfo> = {
  convert: (sale: Sale): SaleInfo => {
    return validateSchema(SaleInfoSchema, {
      weight: saleWeight.convert(sale),
    })
  },
}
export const toInventoryMap: Converter<InventoryOutput, ItemsMap> = {
  convert: (inventory: InventoryOutput): ItemsMap => {
    return new Map(inventory.items.map(({ item, quantity }) => [item, quantity]))
  },
}
export const toInventory: Converter<ItemsMap, InventoryOutput> = {
  convert: (inventory: ItemsMap): InventoryOutput => {
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
export const toStoredAuction: Converter<Auction, StoredAuction> = {
  convert: (auction: Auction): StoredAuction => {
    return validateSchema(StoredAuctionSchema, {
      ...auction,
      players: auction.players.map(player => ({
        ...player,
        inventory: toInventory.convert(player.inventory),
      })),
    })
  },
}
export const toAuction: Converter<StoredAuction, Auction> = {
  convert: (storedAuction: StoredAuction): Auction => {
    return validateSchema(AuctionSchema, {
      ...storedAuction,
      players: storedAuction.players.map(player => ({
        ...player,
        inventory: toInventoryMap.convert(player.inventory),
      })),
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

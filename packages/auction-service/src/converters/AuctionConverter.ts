import { Converter } from './Converter'
import { Auction, AuctionSchema, StoredAuction, StoredAuctionSchema } from '../schemas/Auction'
import { ItemsMap } from '../schemas/Player'
import { validateSchema } from '@auction/common/validation'
import { Sale } from '../schemas/Sale'
import { InventoryOutput, InventoryOutputSchema, ItemWeights } from '../schemas/Item'

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

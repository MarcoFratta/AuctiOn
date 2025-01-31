import z from 'zod'
import { InventoryOutputSchema } from './Item'
import { PlayerSchema } from './Player'
import { AuctionSchema } from './Auction'

export const BidMsgSchema = z.object({
  amount: z.number().min(1),
  round: z.number(),
})

export const PlayerInfoSchema = z.object({
  inventory: InventoryOutputSchema,
  money: PlayerSchema.shape.money,
})
export const SaleInfoSchema = z.object({
  weight: z.number(),
})

export const PlayerAuctionSchema = AuctionSchema.extend({
  playerInfo: PlayerInfoSchema,
  saleInfo: SaleInfoSchema.optional(),
}).omit({ players: true, currentSale: true })

export const ErrorSchema = z.object({
  message: z.string(),
})

export const MessageTypeSchema = z.enum(['sell', 'bid'])

export type SaleInfo = z.infer<typeof SaleInfoSchema>
export type PlayerAuction = z.infer<typeof PlayerAuctionSchema>
export type MessageType = z.infer<typeof MessageTypeSchema>
export type BidMessage = z.infer<typeof BidMsgSchema>
export type PlayerInfoMessage = z.infer<typeof PlayerInfoSchema>

import { useSocketStore } from '@/stores/socketStore.ts'
import { match } from 'ts-pattern'
import { useHistoryStore } from '@/stores/historyStore.ts'
import { validateSchema } from '@auction/common/validation'
import * as m from '@auction/common/messages'

export function useAuctionStats() {
  const statsStore = useHistoryStore()

  function attach() {
    useSocketStore().attach(
      'auction:stats',
      undefined,
      (msg) => {
        match(msg.type)
          .with('new-sale', () => {
            const event = validateSchema(m.saleUpdateMsgSchema, msg)
            statsStore.storeSale(event.sale)
          })
          .with('new-bid', () => {
            const event = validateSchema(m.bidUpdateMsgSchema, msg)
            statsStore.storeBid(event.bid)
          })
          .with('auction', () => {
            const event = validateSchema(m.auctionMsgSchema, msg)
            statsStore.setAuction(event.auction.id)
          })
          .with('auction-start', () => {
            const event = validateSchema(m.auctionStartMsgSchema, msg)
            statsStore.setAuction(event.auction.id)
            statsStore.reset()
          })
          .with('auction-end', () => {
            statsStore.reset()
          })
      },
      undefined,
      undefined,
    )
  }

  return { attach }
}

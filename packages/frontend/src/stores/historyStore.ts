import { defineStore } from 'pinia'
import type { BidUpdateMsg, SaleUpdateMsg } from '@auction/common/messages'

type Sale = SaleUpdateMsg['sale']
type Bid = BidUpdateMsg['bid']
export const useHistoryStore = defineStore('history', {
  state: () => ({
    auctionId: '' as string,
    sales: [] as Sale[],
    bids: [] as Bid[],
    lastSaleIndex: 0 as number,
  }),
  actions: {
    setAuction(id: string) {
      if (this.auctionId != id) {
        this.auctionId = id
        this.reset()
      }
    },
    storeSale(s: Sale) {
      this.sales.push(s)
      this.lastSaleIndex = this.bids.length
    },
    storeBid(b: Bid) {
      this.bids.push(b)
    },
    reset() {
      this.sales = []
      this.bids = []
    },
  },
  persist: true,
})

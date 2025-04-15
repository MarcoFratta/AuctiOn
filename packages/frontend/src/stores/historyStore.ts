import { defineStore } from 'pinia'
import type { BidUpdateMsg, SaleUpdateMsg } from '@auction/common/messages'

type Sale = SaleUpdateMsg['sale']
type Bid = BidUpdateMsg['bid']
export const useHistoryStore = defineStore('history', {
  state: () => ({
    sales: [] as Sale[],
    bids: [] as Bid[],
    lastSaleIndex: 0 as number,
  }),
  actions: {
    storeSale(s: Sale) {
      this.sales.push(s)
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

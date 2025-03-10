import { useSocketStore } from '@/stores/socketStore.ts'
import type { NewSaleMsg } from '@auction/common'

export function useAuctionService() {
  const socketStore = useSocketStore()

  function placeBid(amount: number, round: number) {
    if (!socketStore.socket) return
    socketStore.socket.emit('bid', {
      bid: {
        round: round,
        amount: amount,
      },
    })
  }

  function sellItems(inventory: NewSaleMsg['sale']['items']) {
    if (!socketStore.socket) return
    socketStore.socket.emit('sell', {
      sale: {
        items: inventory,
      },
    })
  }

  return { placeBid, sellItems }
}

import { useSocketStore } from '@/stores/socketStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { match } from 'ts-pattern'
import { validateSchema } from '@auction/common/validation'
import * as m from '@auction/common/messages'
import { useNotifications } from '@/composables/useNotifications'
import { useSettingsStore } from '@/stores/settingsStore'

export function useAuctionNotifications() {
  const socketStore = useSocketStore()
  const lobbyStore = useLobbyStore()
  const settingsStore = useSettingsStore()
  const notifier = useNotifications()

  function attach() {
    socketStore.attach('auction:notification', undefined, (msg) => {
      if (!settingsStore.auctionNotifications) return

      match(msg.type)
        .with('new-sale', () => {
          const event = validateSchema(m.saleUpdateMsgSchema, msg)
          const seller = lobbyStore.getUser(event.sale.sellerId)
          notifier.info(`New sale from: ${seller!.username}`)
        })
        .with('new-bid', () => {
          const event = validateSchema(m.bidUpdateMsgSchema, msg)
          const bidder = lobbyStore.getUser(event.bid.playerId)
          const bidderName = bidder ? bidder.username : 'Someone'

          if (event.bid.playerId === lobbyStore.currentUser?.id) {
            notifier.success(`You placed a bid of ${event.bid.amount}`)
          } else {
            notifier.info(`${bidderName} placed a bid of ${event.bid.amount}`)
          }
        })
        .with('round-end', () => {
          const event = validateSchema(m.roundEndMsgSchema, msg)
          const currentRound = event.auction.currentRound

          notifier.success(`Round ${currentRound - 1} completed!`)
        })
        .with('auction-start', () => {
          const event = validateSchema(m.auctionStartMsgSchema, msg)
          notifier.success(`Auction has started! ${event.auction.maxRound} rounds total.`)
        })
        .with('auction-end', () => {
          notifier.warning('Auction has ended! View the results to see the final standings.')
        })
        .otherwise(() => {})
    })
  }

  function detach() {
    socketStore.detach('auction:notification')
  }

  return { attach, detach }
}

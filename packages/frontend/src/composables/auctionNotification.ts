import { useSocketStore } from '@/stores/socketStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { match } from 'ts-pattern'
import { validateSchema } from '@auction/common/validation'
import * as m from '@auction/common/messages'
import { useNotifications } from '@/composables/useNotifications'

export function useAuctionNotifications() {
  const socketStore = useSocketStore()
  const lobbyStore = useLobbyStore()
  const notifier = useNotifications()

  function attach() {
    socketStore.attach(undefined, (msg) => {
      console.log(`Received event: ${JSON.stringify(msg)}`)
      match(msg.type)
        .with('player-connected', () => {
          const event = validateSchema(m.playerConnectedMsgSchema, msg)
          // Only show notification if we've seen this user join before
          if (event.playerId == lobbyStore.currentUser?.id) {
            notifier.success(`Connected to the lobby`)
          } else if (!event.old) {
            const user = lobbyStore.getUser(event.playerId)
            if (user) {
              notifier.info(`${user.username} has connected`)
            }
          }
        })
        .with('player-disconnected', () => {
          const event = validateSchema(m.playerDisconnectedMsgSchema, msg)
          const user = lobbyStore.getUser(event.playerId)
          if (user) {
            notifier.info(`${user.username} has disconnected`)
          }
        })
        .with('player-leave', () => {
          const event = validateSchema(m.playerLeaveSchema, msg)
          const user = lobbyStore.getUser(event.playerId)
          if (user) {
            notifier.info(`${user.username} has left the lobby`)
          }
        })
        .with('player-info', () => {
          const event = validateSchema(m.playerInfoMsgSchema, msg)
          if (event.playerId != lobbyStore.currentUser?.id && !event.old) {
            notifier.info(
              `${event.playerInfo.username} is ` +
                `${event.playerInfo.status == 'waiting' ? 'Not ready' : 'Ready'}`,
            )
          }
        })
        .otherwise(() => {})
    })
  }

  return { attach }
}

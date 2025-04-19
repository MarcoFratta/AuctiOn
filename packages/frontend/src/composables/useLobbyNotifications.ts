import { useSocketStore } from '@/stores/socketStore'
import { useLobbyStore } from '@/stores/lobbyStore'
import { match } from 'ts-pattern'
import { validateSchema } from '@auction/common/validation'
import * as m from '@auction/common/messages'
import { useNotifications } from '@/composables/useNotifications'
import { useSettingsStore } from '@/stores/settingsStore.ts'

export function useLobbyNotifications() {
  const socketStore = useSocketStore()
  const lobbyStore = useLobbyStore()
  const settingsStore = useSettingsStore()
  const notifier = useNotifications()

  function attach() {
    socketStore.attach('lobby:notification', undefined, (msg) => {
      if (!settingsStore.lobbyNotifications) return
      match(msg.type)
        .with('player-connected', () => {
          const event = validateSchema(m.playerConnectedMsgSchema, msg)
          // Only show notification if we've seen this user join before
          if (event.playerId == lobbyStore.currentUser?.id) {
            notifier.success(`Connected to the lobby`)
          } else if (!event.old) {
            const user = lobbyStore.getUser(event.playerId)
            if (user) {
              notifier.success(`${user.username} has connected`)
            }
          }
        })
        .with('player-disconnected', () => {
          const event = validateSchema(m.playerDisconnectedMsgSchema, msg)
          const user = lobbyStore.getUser(event.playerId)
          if (user) {
            notifier.error(`${user.username} has disconnected`)
          }
        })
        .with('player-leave', () => {
          const event = validateSchema(m.playerLeaveSchema, msg)
          const user = lobbyStore.getUser(event.playerId)
          if (user) {
            notifier.warning(`${user.username} has left the lobby`)
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

  function detach() {
    socketStore.detach('lobby:notification')
  }

  return { attach, detach }
}

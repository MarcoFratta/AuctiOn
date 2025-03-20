import { useSocketStore } from '@/stores/socketStore.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import type { AuctionMessage } from '@auction/common'
import * as validator from '@auction/common/validation'
import * as messages from '@auction/common/messages'
import { match } from 'ts-pattern'
import { useRouter } from 'vue-router'

export function useLobbyMsgHandler() {
  const socketStore = useSocketStore()
  const lobbyStore = useLobbyStore()
  const router = useRouter()

  function attach() {
    socketStore.attach(
      'auction:eventHandler',
      () => console.log('Connected to lobby'),
      (event: AuctionMessage) => {
        console.log(`Received event: ${JSON.stringify(event)}`)
        const ev = validator.validateSchema(messages.typedMessageSchema.shape.type, event.type)
        match(ev)
          .with('auction', () => {
            const msg = validator.validateSchema(messages.auctionMsgSchema, event)
            lobbyStore.setLobby(msg.auction)
            lobbyStore.setPlayerInfo(msg.playerInfo)
          })
          .with('player-join', () => {
            const msg = validator.validateSchema(messages.playerJoinSchema, event)
            lobbyStore.addUser({
              id: msg.playerId,
              username: msg.username,
              connected: false,
              status: 'waiting',
            })
          })
          .with('player-connected', () => {
            const msg = validator.validateSchema(messages.playerConnectedMsgSchema, event)
            const user = lobbyStore.users.find((user) => user.id === msg.playerId)
            if (user) user.connected = true
          })
          .with('player-disconnected', () => {
            const msg = validator.validateSchema(messages.playerDisconnectedMsgSchema, event)
            const user = lobbyStore.users.find((user) => user.id === msg.playerId)
            if (user) user.connected = false
          })
          .with('player-leave', () => {
            const msg = validator.validateSchema(messages.playerLeaveSchema, event)
            lobbyStore.removeUser(msg.playerId)
          })
          .with('player-info', () => {
            const msg = validator.validateSchema(messages.playerInfoMsgSchema, event)
            lobbyStore.updateUser(msg.playerId, msg.playerInfo)
          })
          .with('auction-deleted', () => {
            lobbyStore.clearLobby()
          })
          .with('auction-start', () => {
            const msg = validator.validateSchema(messages.auctionStartMsgSchema, event)
            lobbyStore.setLobby(msg.auction)
            router.push('/play')
          })
          .with('timer-start', () => {
            const msg = validator.validateSchema(messages.timerStartMsgSchema, event)
            lobbyStore.updateTimer(new Date(msg.time))
          })
          .with('new-sale', () => {
            const msg = validator.validateSchema(messages.saleUpdateMsgSchema, event)
            lobbyStore.setSale(msg.sale)
          })
          .with('new-bid', () => {
            const msg = validator.validateSchema(messages.bidUpdateMsgSchema, event)
            lobbyStore.setBid(msg.bid)
          })
          .with('round-end', () => {
            const msg = validator.validateSchema(messages.roundEndMsgSchema, event)
            lobbyStore.setLobby(msg.auction)
            lobbyStore.setPlayerInfo(msg.playerInfo)
            lobbyStore.resetTimer()
          })
          .with('auction-end', () => {
            const msg = validator.validateSchema(messages.auctionEndMsgSchema, event)
            lobbyStore.clearLobby()
            socketStore.disconnect()
            lobbyStore.setLeaderboard(msg.leaderboard)
            router.push('/')
          })
          .otherwise(() => {
            console.error('Unknown event:', event)
          })
      },
      (_reason) => {
        lobbyStore.clearLobby()
      },
      () => {
        lobbyStore.clearLobby()
      },
    )
  }

  return { attach }
}

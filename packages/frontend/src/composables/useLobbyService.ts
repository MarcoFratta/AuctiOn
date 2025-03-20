import type { LobbyConfig } from '@/schemas/LobbySchema.ts'
import { AlreadyInLobby } from '@/api/Errors.ts'
import * as lobbyService from '@/api/lobbyService.ts'
import { useAuthStore } from '@/stores/authStore.ts'
import { useErrorsHandler } from '@/composables/useErrorsHandler.ts'
import { useLobbyStore } from '@/stores/lobbyStore.ts'
import { useSocketStore } from '@/stores/socketStore.ts'

export function useLobbyService() {
  const { handleError } = useErrorsHandler()
  const lobbyStore = useLobbyStore()
  const socketStore = useSocketStore()
  async function createLobby(lobby: LobbyConfig): Promise<unknown> {
    try {
      return await lobbyService.createLobby(lobby)
    } catch (error) {
      handleError(error, [[409, new AlreadyInLobby()]])
    }
  }

  async function joinLobby(lobbyId: string): Promise<unknown> {
    try {
      return await lobbyService.joinLobby(lobbyId)
    } catch (error) {
      handleError(error, [[409, new AlreadyInLobby()]])
    }
  }

  async function checkActiveLobby(): Promise<unknown> {
    try {
      await lobbyService.checkActiveLobby()
      return true
    } catch (error) {
      handleError(error)
    }
  }

  async function leaveLobby(): Promise<void> {
    try {
      await lobbyService.leaveLobby()
      lobbyStore.clearLobby()
      socketStore.disconnect()
    } catch (error) {
      handleError(error)
    }
  }

  async function kickPlayer(playerId: string): Promise<unknown> {
    try {
      return await lobbyService.kickPlayer(playerId)
    } catch (error) {
      handleError(error)
    }
  }

  async function setState(state: string): Promise<unknown> {
    try {
      return await lobbyService.setState(state)
    } catch (error) {
      handleError(error)
    }
  }

  async function startMatch() {
    try {
      return await lobbyService.start()
    } catch (error) {
      handleError(error)
    }
  }

  function connectToLobby() {
    try {
      const token = useAuthStore().accessToken
      return lobbyService.connectToLobby(token)
    } catch (error) {
      throw error
    }
  }

  return {
    createLobby,
    joinLobby,
    leaveLobby,
    kickPlayer,
    connectToLobby,
    startMatch,
    checkActiveLobby,
    setState,
  }
}

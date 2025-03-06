import type { LobbyConfig } from '@/schemas/LobbySchema.ts'
import { isAxiosError } from 'axios'
import {
  AlreadyInLobby,
  InvalidData,
  NotFound,
  TooManyRequests,
  UnauthenticatedError,
} from '@/api/Errors.ts'
import * as lobbyService from '@/api/lobbyService.ts'
import { useAuthStore } from '@/stores/authStore.ts'

export function useLobbyService() {
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

  async function leaveLobby(): Promise<unknown> {
    try {
      return await lobbyService.leaveLobby()
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

  function connectToLobby() {
    try {
      const token = useAuthStore().accessToken
      return lobbyService.connectToLobby(token)
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error)
      throw error
    }
  }

  function handleError(error: unknown, cases: [number, Error][] = []): void {
    if (isAxiosError(error)) {
      if (cases.map((e) => e[0]).includes(error.status ?? 0)) {
        throw cases.find((e) => e[0] == error.response?.status)?.[1]
      }
      if (error.status == 404) {
        throw new NotFound()
      }
      if (error.status == 400) {
        throw new InvalidData()
      }
      if (error.status == 429) {
        throw new TooManyRequests()
      }
      if (error.status == 401) {
        throw new UnauthenticatedError()
      }
    }
    throw error
  }

  return {
    createLobby,
    joinLobby,
    leaveLobby,
    kickPlayer,
    connectToLobby,
    setState,
  }
}

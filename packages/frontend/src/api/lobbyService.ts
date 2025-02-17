import type { LobbyConfig } from '@/schemas/LobbySchema.ts'
import apiClient from '@/api/apiClient.ts'
import { isAxiosError } from 'axios'
import { AlreadyInLobby, InvalidData, NotFound, TooManyRequests } from '@/api/Errors.ts'

export async function createLobby(lobby: LobbyConfig): Promise<object> {
  try {
    const response = await apiClient.post('http://localhost:8080/lobbies/create', lobby)
    return response.data!
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.status == 400) {
        throw new InvalidData()
      }
      if (error.status == 409) {
        throw new AlreadyInLobby()
      }
    }
    throw error
  }
}

export async function joinLobby(lobbyId: string): Promise<object> {
  try {
    const response = await apiClient.post(`http://localhost:8080/lobbies/${lobbyId}/join`)
    return response.data!
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.status == 404) {
        throw new NotFound()
      }
      if (error.status == 409) {
        throw new AlreadyInLobby()
      }
      if (error.status == 400) {
        throw new InvalidData()
      }
      if (error.status == 429) {
        throw new TooManyRequests()
      }
    }
    throw error
  }
}

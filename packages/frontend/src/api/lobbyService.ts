import type { LobbyConfig } from '@/schemas/LobbySchema.ts'
import apiClient from '@/api/apiClient.ts'
import { io } from 'socket.io-client'

export async function createLobby(lobby: LobbyConfig): Promise<unknown> {
  const response = await apiClient.post('/lobbies/create', lobby)
  return response.data!
}

export async function joinLobby(lobbyId: string): Promise<unknown> {
  const response = await apiClient.post(`/lobbies/${lobbyId}/join`)
  return response.data!
}

export async function leaveLobby(): Promise<unknown> {
  const response = await apiClient.post(`/lobbies/leave`)
  return response.data!
}

export async function kickPlayer(playerId: string): Promise<unknown> {
  const response = await apiClient.post(`/lobbies/kick/${playerId}`)
  return response.data!
}

export async function setState(state: string): Promise<unknown> {
  const response = await apiClient.put(`/lobbies/status`, {
    status: state,
  })
  return response.data!
}

export function connectToLobby(token: string) {
  return io(apiClient.defaults.baseURL, {
    path: '/auction',
    auth: {
      token, // Pass token for authentication
    },
    autoConnect: true,
    reconnection: true, // Auto-reconnect on disconnection
    reconnectionAttempts: 1,
    reconnectionDelay: 2000, // Wait 2s before retrying
  })
}

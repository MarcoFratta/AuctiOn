import type { LobbyConfig } from '@/schemas/LobbySchema.ts'
import apiClient from '@/api/apiClient.ts'
import { io } from 'socket.io-client'

export async function start() {
  const response = await apiClient.post('/lobbies/start')
  return response.data!
}

export async function createLobby(lobby: LobbyConfig): Promise<unknown> {
  const response = await apiClient.post('/lobbies/create', lobby)
  return response.data!
}

export async function joinLobby(lobbyId: string): Promise<unknown> {
  const response = await apiClient.post(`/lobbies/${lobbyId}/join`)
  return response.data.lobby!
}

export async function checkActiveLobby(): Promise<unknown> {
  const response = await apiClient.get('/lobbies')
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
  return io(import.meta.env.NODE_ENV == 'production' ? '/' : 'http://192.168.1.20:8080', {
    path:
      import.meta.env.NODE_ENV == 'production'
        ? `/${import.meta.env.FRONTEND_API_URL || 'http://192.168.1.20:8080'}/auction`
        : '/auction',
    auth: {
      token, // Pass token for authentication
    },
    autoConnect: true,
    reconnection: true, // Auto-reconnect on disconnection
    reconnectionAttempts: 5,
    reconnectionDelay: 1000, // Wait 2s before retrying
  })
}

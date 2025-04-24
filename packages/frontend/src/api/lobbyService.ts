import type { LobbyConfig } from '@/schemas/LobbySchema.ts'
import apiClient from '@/api/apiClient.ts'
import { io, Socket } from 'socket.io-client'

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

export function connectToLobby(token: string): Socket {
  // Define the base URL based on the environment
  const url = apiClient.defaults.baseURL

  const baseUrl = import.meta.env.PROD ? '/' : url
  const path = import.meta.env.PROD ? url : ''

  return io(baseUrl, {
    path: path + '/auction',
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })
}

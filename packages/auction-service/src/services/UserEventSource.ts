import { Player, PlayerInfo } from '../schemas/Player'

export interface UserEventSource {
  onPlayerChange(cb: (id: Player['id'], playerInfo: PlayerInfo) => void): void
}

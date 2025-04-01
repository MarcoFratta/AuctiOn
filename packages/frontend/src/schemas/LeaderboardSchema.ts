export type LeaderboardEntry = {
  money: number
  inventory: { items: { item: string; quantity: number }[] }
  id: string
  position: number
}

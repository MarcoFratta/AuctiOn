export class PlayOrderStrategy {
  public static random<T>(values: T[]): T[] {
    const result = [...values] // Create a shallow copy to avoid mutating the original array
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)) // Pick a random index
      ;[result[i], result[j]] = [result[j], result[i]] // Swap elements
    }
    return result
  }

  public static sameOrder<T>(values: T[]): T[] {
    return values
  }
}

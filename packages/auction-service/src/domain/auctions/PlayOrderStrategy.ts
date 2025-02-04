export class PlayOrderStrategy {
  public static random<T>(values: T[]): T[] {
    const result = [...values]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }

  public static sameOrder<T>(values: T[]): T[] {
    return values
  }
}

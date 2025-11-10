/**
 * Fisher-Yates shuffle algorithm
 * Randomly shuffles an array in-place
 * Based on the implementation from random-name-picker
 * @param array - Array to shuffle
 * @returns Shuffled copy of the array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  const keys = Object.keys(result) as unknown[] as number[]
  const n = keys.length
  
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }
  
  return result
}

/**
 * Pick a random item from an array
 * @param array - Array to pick from
 * @returns Random item from the array
 */
export function pickRandom<T>(array: T[]): T | null {
  if (array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Pick multiple random unique items from an array
 * @param array - Array to pick from
 * @param count - Number of items to pick
 * @returns Array of random items
 */
export function pickMultipleRandom<T>(array: T[], count: number): T[] {
  if (count >= array.length) {
    return shuffle(array)
  }
  
  const shuffled = shuffle(array)
  return shuffled.slice(0, count)
}

/**
 * Generate a random ID
 * @param length - Length of the ID
 * @returns Random alphanumeric ID
 */
export function generateRandomId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Generate a short code for polls
 * @returns 8-character alphanumeric short code
 */
export function generateShortCode(): string {
  return generateRandomId(8)
}

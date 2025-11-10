/**
 * Slot Machine Animation Service
 * Based on random-name-picker implementation
 * Uses Web Animations API for smooth vertical scrolling
 */

import { shuffle } from '../../utils/random'

export interface SlotMachineConfig {
  container: HTMLElement
  names: string[]
  maxReelItems?: number
  duration?: number
  itemHeight?: number
}

export class SlotMachine {
  private container: HTMLElement
  private names: string[]
  private maxReelItems: number
  private duration: number
  private itemHeight: number
  private reelElement: HTMLElement | null = null
  private animation: Animation | null = null

  constructor(config: SlotMachineConfig) {
    this.container = config.container
    this.names = [...config.names]
    this.maxReelItems = config.maxReelItems || 30
    this.duration = config.duration || 3000
    this.itemHeight = config.itemHeight || 120

    this.init()
  }

  /**
   * Initialize slot machine DOM
   */
  private init() {
    this.container.innerHTML = ''
    this.container.style.position = 'relative'
    this.container.style.overflow = 'hidden'
    this.container.style.height = `${this.itemHeight}px`

    // Create reel element
    this.reelElement = document.createElement('div')
    this.reelElement.style.position = 'absolute'
    this.reelElement.style.width = '100%'
    this.reelElement.style.top = '0'
    this.container.appendChild(this.reelElement)
  }

  /**
   * Create reel items from shuffled names
   */
  private createReelItems(shuffledNames: string[]): DocumentFragment {
    const fragment = document.createDocumentFragment()

    shuffledNames.forEach((name) => {
      const item = document.createElement('div')
      item.className = 'slot-item'
      item.style.height = `${this.itemHeight}px`
      item.style.display = 'flex'
      item.style.alignItems = 'center'
      item.style.justifyContent = 'center'
      item.style.fontSize = '2rem'
      item.style.fontWeight = 'bold'
      item.style.color = '#ffffff'
      item.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)'
      item.textContent = name
      fragment.appendChild(item)
    })

    return fragment
  }

  /**
   * Spin the slot machine and return winner
   */
  public async spin(): Promise<string> {
    if (!this.reelElement) {
      throw new Error('Slot machine not initialized')
    }

    // Shuffle names
    let shuffledNames = shuffle(this.names)

    // Duplicate names if needed to fill reel
    while (shuffledNames.length < this.maxReelItems) {
      shuffledNames = [...shuffledNames, ...shuffledNames]
    }

    // Slice to max items
    shuffledNames = shuffledNames.slice(0, this.maxReelItems)

    // Clear and populate reel
    this.reelElement.innerHTML = ''
    const fragment = this.createReelItems(shuffledNames)
    this.reelElement.appendChild(fragment)

    // Calculate animation distance
    const totalHeight = (shuffledNames.length - 1) * this.itemHeight

    // Create animation
    const keyframes = [
      { transform: 'translateY(0px)', filter: 'blur(0px)' },
      { transform: `translateY(-${totalHeight / 2}px)`, filter: 'blur(2px)', offset: 0.5 },
      { transform: `translateY(-${totalHeight}px)`, filter: 'blur(0px)' }
    ]

    const options: KeyframeAnimationOptions = {
      duration: this.duration,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fill: 'forwards'
    }

    // Start animation
    this.animation = this.reelElement.animate(keyframes, options)

    // Wait for animation to complete
    await this.animation.finished

    // Winner is the last item
    const winner = shuffledNames[shuffledNames.length - 1]

    if (!winner) {
      throw new Error('No winner selected')
    }

    return winner
  }

  /**
   * Stop animation immediately
   */
  public stop() {
    if (this.animation) {
      this.animation.cancel()
    }
  }

  /**
   * Reset slot machine
   */
  public reset() {
    this.stop()
    if (this.reelElement) {
      this.reelElement.innerHTML = ''
      this.reelElement.style.transform = 'translateY(0px)'
    }
  }

  /**
   * Update names
   */
  public updateNames(names: string[]) {
    this.names = [...names]
  }

  /**
   * Cleanup
   */
  public dispose() {
    this.stop()
    this.container.innerHTML = ''
  }
}

/**
 * Create a simple slot machine with default settings
 */
export function createSlotMachine(
  container: HTMLElement,
  names: string[],
  duration: number = 3000
): SlotMachine {
  return new SlotMachine({
    container,
    names: names || [],
    duration,
    maxReelItems: 30,
    itemHeight: 120
  })
}

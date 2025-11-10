/**
 * Sound Effects Service
 * Based on random-name-picker implementation
 * Uses Web Audio API to generate piano key sounds
 */

interface MusicNote {
  key: string
  duration: number
}

interface SoundOptions {
  type: OscillatorType
  volume: number
  easeOut: boolean
}

export class SoundEffects {
  private audioContext: AudioContext | null = null
  private isMuted: boolean = false

  // Piano key frequencies (A440 tuning)
  private readonly PIANO_KEYS: Record<string, number> = {
    'C3': 130.81,
    'C#3': 138.59,
    'D#3': 155.56,
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'G4': 392.00,
  }

  constructor() {
    this.initAudioContext()
  }

  /**
   * Initialize Audio Context
   */
  private initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      this.audioContext = new AudioContextClass()
    } catch (error) {
      console.error('Web Audio API is not supported in this browser:', error)
    }
  }

  /**
   * Play a sequence of musical notes
   */
  private async playSound(notes: MusicNote[], options: SoundOptions): Promise<void> {
    if (this.isMuted || !this.audioContext) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      let currentTime = this.audioContext!.currentTime
      const { type, volume, easeOut } = options

      notes.forEach((note, index) => {
        const frequency = this.PIANO_KEYS[note.key]
        if (!frequency) return

        // Create oscillator
        const oscillator = this.audioContext!.createOscillator()
        oscillator.type = type
        oscillator.frequency.value = frequency

        // Create gain node for volume control
        const gainNode = this.audioContext!.createGain()
        gainNode.gain.value = volume / 10

        // Apply ease-out effect on last note if enabled
        if (easeOut && index === notes.length - 1) {
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            currentTime + note.duration
          )
        }

        // Connect nodes
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext!.destination)

        // Schedule playback
        oscillator.start(currentTime)
        oscillator.stop(currentTime + note.duration)

        currentTime += note.duration
      })

      // Resolve after all notes have played
      setTimeout(() => resolve(), currentTime * 1000)
    })
  }

  /**
   * Play winning sound: C4 → D4 → E4 → G4 → E4 → G4
   */
  public async win(): Promise<void> {
    const musicNotes: MusicNote[] = [
      { key: 'C4', duration: 0.175 },
      { key: 'D4', duration: 0.175 },
      { key: 'E4', duration: 0.175 },
      { key: 'G4', duration: 0.275 },
      { key: 'E4', duration: 0.15 },
      { key: 'G4', duration: 0.9 },
    ]

    await this.playSound(musicNotes, {
      type: 'triangle',
      volume: 1,
      easeOut: true
    })
  }

  /**
   * Play spinning sound: D#3 → C#3 → C3 (loop)
   */
  public async spin(durationInSeconds: number): Promise<void> {
    const singleNote: MusicNote[] = [
      { key: 'D#3', duration: 0.1 },
      { key: 'C#3', duration: 0.1 },
      { key: 'C3', duration: 0.1 },
    ]

    const repetitions = Math.floor(durationInSeconds * 10 / 3)
    const allNotes: MusicNote[] = []
    
    for (let i = 0; i < repetitions; i++) {
      allNotes.push(...singleNote)
    }

    await this.playSound(allNotes, {
      type: 'triangle',
      volume: 2,
      easeOut: false
    })
  }

  /**
   * Play a simple beep sound
   */
  public async beep(frequency: number = 440, duration: number = 0.2): Promise<void> {
    if (this.isMuted || !this.audioContext) {
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      const oscillator = this.audioContext!.createOscillator()
      const gainNode = this.audioContext!.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gainNode.gain.value = 0.3

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext!.destination)

      const currentTime = this.audioContext!.currentTime
      oscillator.start(currentTime)
      oscillator.stop(currentTime + duration)

      setTimeout(() => resolve(), duration * 1000)
    })
  }

  /**
   * Toggle mute
   */
  public toggleMute(): void {
    this.isMuted = !this.isMuted
  }

  /**
   * Set mute state
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted
  }

  /**
   * Get mute state
   */
  public getMuted(): boolean {
    return this.isMuted
  }

  /**
   * Resume audio context (needed for some browsers)
   */
  public async resume(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }
}

// Export singleton instance
export const soundEffects = new SoundEffects()

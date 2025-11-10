import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export interface Person {
  id: string
  name: string
  department?: string
  avatar?: string
  isWin: boolean
  prizeName: string[]
  prizeTime: string[]
  prizeId: string[]
}

export interface Prize {
  id: string
  name: string
  sort: number // Display order (1 = top tier)
  count: number // Number of winners
  isUsedCount: number // Already drawn count
  picture: {
    id: string
    name: string
    url: string
  }
  separateCount: {
    enable: boolean
    countList: number[] // e.g., [2, 3] = draw 2, then 3
  }
  desc: string
  isShow: boolean
  isUsed: boolean
  frequency: number // Animation speed multiplier
}

export const useLotteryStore = defineStore('lottery', () => {
  // State
  const participants = ref<Person[]>([])
  const prizes = ref<Prize[]>([])
  const winners = ref<Person[]>([])
  const currentPrizeIndex = ref(0)
  const isDrawing = ref(false)
  const removeWinnerFromPool = ref(true)
  const autoExport = ref(false)

  // Computed
  const currentPrize = computed(() => {
    return prizes.value.find((_, index) => index === currentPrizeIndex.value)
  })

  const availableParticipants = computed(() => {
    return participants.value.filter(p => !p.isWin)
  })

  const completedPrizes = computed(() => {
    return prizes.value.filter(p => p.isUsed)
  })

  // Actions
  function addParticipant(name: string, department?: string, avatar?: string) {
    participants.value.push({
      id: uuidv4(),
      name,
      department,
      avatar,
      isWin: false,
      prizeName: [],
      prizeTime: [],
      prizeId: [],
    })
  }

  function removeParticipant(id: string) {
    const index = participants.value.findIndex(p => p.id === id)
    if (index !== -1) {
      participants.value.splice(index, 1)
    }
  }

  function updateParticipant(id: string, data: Partial<Person>) {
    const participant = participants.value.find(p => p.id === id)
    if (participant) {
      Object.assign(participant, data)
    }
  }

  function importParticipants(data: Person[]) {
    participants.value = data.map(p => ({
      ...p,
      id: p.id || uuidv4(),
      isWin: p.isWin || false,
      prizeName: p.prizeName || [],
      prizeTime: p.prizeTime || [],
      prizeId: p.prizeId || [],
    }))
  }

  function clearParticipants() {
    participants.value = []
  }

  function addPrize(prize: Omit<Prize, 'id'>) {
    prizes.value.push({
      ...prize,
      id: uuidv4(),
    })
    // Sort by sort order
    prizes.value.sort((a, b) => a.sort - b.sort)
  }

  function removePrize(id: string) {
    const index = prizes.value.findIndex(p => p.id === id)
    if (index !== -1) {
      prizes.value.splice(index, 1)
    }
  }

  function updatePrize(id: string, data: Partial<Prize>) {
    const prize = prizes.value.find(p => p.id === id)
    if (prize) {
      Object.assign(prize, data)
    }
  }

  function clearPrizes() {
    prizes.value = []
  }

  function markWinner(personId: string, prizeId: string) {
    const person = participants.value.find(p => p.id === personId)
    const prize = prizes.value.find(p => p.id === prizeId)
    
    if (person && prize) {
      person.isWin = true
      person.prizeName.push(prize.name)
      person.prizeTime.push(new Date().toISOString())
      person.prizeId.push(prize.id)
      
      winners.value.push({ ...person })
      
      prize.isUsedCount++
      if (prize.isUsedCount >= prize.count) {
        prize.isUsed = true
      }
    }
  }

  function nextPrize() {
    if (currentPrizeIndex.value < prizes.value.length - 1) {
      currentPrizeIndex.value++
    }
  }

  function previousPrize() {
    if (currentPrizeIndex.value > 0) {
      currentPrizeIndex.value--
    }
  }

  function startDrawing() {
    isDrawing.value = true
  }

  function stopDrawing() {
    isDrawing.value = false
  }

  function reset() {
    participants.value = []
    prizes.value = []
    winners.value = []
    currentPrizeIndex.value = 0
    isDrawing.value = false
  }

  function resetWinners() {
    winners.value = []
    participants.value.forEach(p => {
      p.isWin = false
      p.prizeName = []
      p.prizeTime = []
      p.prizeId = []
    })
    prizes.value.forEach(p => {
      p.isUsedCount = 0
      p.isUsed = false
    })
  }

  return {
    // State
    participants,
    prizes,
    winners,
    currentPrizeIndex,
    isDrawing,
    removeWinnerFromPool,
    autoExport,
    
    // Computed
    currentPrize,
    availableParticipants,
    completedPrizes,
    
    // Actions
    addParticipant,
    removeParticipant,
    updateParticipant,
    importParticipants,
    clearParticipants,
    addPrize,
    removePrize,
    updatePrize,
    clearPrizes,
    markWinner,
    nextPrize,
    previousPrize,
    startDrawing,
    stopDrawing,
    reset,
    resetWinners,
  }
}, {
  persist: true,
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface PickerHistory {
  id: string
  names: string[]
  winner: string
  timestamp: Date
}

export const usePickerStore = defineStore('picker', () => {
  // State
  const nameList = ref<string[]>([])
  const history = ref<PickerHistory[]>([])
  const removeWinner = ref(true)
  const isSpinning = ref(false)
  const currentWinner = ref<string | null>(null)

  // Computed
  const hasNames = computed(() => nameList.value.length > 0)
  const nameCount = computed(() => nameList.value.length)

  // Actions
  function setNames(names: string[]) {
    nameList.value = names.filter(n => n.trim() !== '')
  }

  function addName(name: string) {
    if (name.trim() && !nameList.value.includes(name.trim())) {
      nameList.value.push(name.trim())
    }
  }

  function removeName(name: string) {
    const index = nameList.value.indexOf(name)
    if (index !== -1) {
      nameList.value.splice(index, 1)
    }
  }

  function clearNames() {
    nameList.value = []
  }

  function addToHistory(winner: string) {
    history.value.unshift({
      id: `${Date.now()}-${Math.random()}`,
      names: [...nameList.value],
      winner,
      timestamp: new Date(),
    })
    
    // Keep only last 50 entries
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }
  }

  function clearHistory() {
    history.value = []
  }

  function setWinner(winner: string) {
    currentWinner.value = winner
    addToHistory(winner)
    
    if (removeWinner.value) {
      removeName(winner)
    }
  }

  function startSpinning() {
    isSpinning.value = true
  }

  function stopSpinning() {
    isSpinning.value = false
  }

  function toggleRemoveWinner() {
    removeWinner.value = !removeWinner.value
  }

  return {
    // State
    nameList,
    history,
    removeWinner,
    isSpinning,
    currentWinner,
    
    // Computed
    hasNames,
    nameCount,
    
    // Actions
    setNames,
    addName,
    removeName,
    clearNames,
    addToHistory,
    clearHistory,
    setWinner,
    startSpinning,
    stopSpinning,
    toggleRemoveWinner,
  }
}, {
  persist: true,
})

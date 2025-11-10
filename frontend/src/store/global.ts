import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Theme = 'w3jdev' | 'light' | 'dark' | 'dracula'
export type Language = 'en' | 'zh-CN'

export const useGlobalStore = defineStore('global', () => {
  // State
  const theme = ref<Theme>('w3jdev')
  const language = ref<Language>('en')
  const musicVolume = ref(50) // 0-100
  const fullscreenOnDraw = ref(false)
  const soundEnabled = ref(true)

  // Actions
  function setTheme(newTheme: Theme) {
    theme.value = newTheme
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme)
    }
  }

  function setLanguage(newLanguage: Language) {
    language.value = newLanguage
  }

  function setMusicVolume(volume: number) {
    musicVolume.value = Math.max(0, Math.min(100, volume))
  }

  function toggleFullscreenOnDraw() {
    fullscreenOnDraw.value = !fullscreenOnDraw.value
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  return {
    // State
    theme,
    language,
    musicVolume,
    fullscreenOnDraw,
    soundEnabled,
    
    // Actions
    setTheme,
    setLanguage,
    setMusicVolume,
    toggleFullscreenOnDraw,
    toggleSound,
  }
}, {
  persist: true,
})

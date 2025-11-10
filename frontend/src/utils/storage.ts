import localforage from 'localforage'

// Configure localforage for IndexedDB
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'w3jdev-united',
  version: 1.0,
  storeName: 'app_storage',
  description: 'W3JDev United application storage'
})

// Lottery sessions store
export const lotterySessionsStore = localforage.createInstance({
  name: 'w3jdev-united',
  storeName: 'lottery_sessions'
})

// Picker history store
export const pickerHistoryStore = localforage.createInstance({
  name: 'w3jdev-united',
  storeName: 'picker_history'
})

// Media store (images, audio)
export const mediaStore = localforage.createInstance({
  name: 'w3jdev-united',
  storeName: 'media'
})

/**
 * Save a lottery session
 */
export async function saveLotterySession(sessionId: string, data: any) {
  try {
    await lotterySessionsStore.setItem(sessionId, {
      ...data,
      savedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Failed to save lottery session:', error)
    return false
  }
}

/**
 * Load a lottery session
 */
export async function loadLotterySession(sessionId: string) {
  try {
    return await lotterySessionsStore.getItem(sessionId)
  } catch (error) {
    console.error('Failed to load lottery session:', error)
    return null
  }
}

/**
 * List all lottery sessions
 */
export async function listLotterySessions() {
  try {
    const sessions: any[] = []
    await lotterySessionsStore.iterate((value, key) => {
      sessions.push({ id: key, ...value })
    })
    return sessions.sort((a, b) => 
      new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    )
  } catch (error) {
    console.error('Failed to list lottery sessions:', error)
    return []
  }
}

/**
 * Delete a lottery session
 */
export async function deleteLotterySession(sessionId: string) {
  try {
    await lotterySessionsStore.removeItem(sessionId)
    return true
  } catch (error) {
    console.error('Failed to delete lottery session:', error)
    return false
  }
}

/**
 * Save picker history
 */
export async function savePickerHistory(historyId: string, data: any) {
  try {
    await pickerHistoryStore.setItem(historyId, data)
    return true
  } catch (error) {
    console.error('Failed to save picker history:', error)
    return false
  }
}

/**
 * Load picker history
 */
export async function loadPickerHistory() {
  try {
    const history: any[] = []
    await pickerHistoryStore.iterate((value) => {
      history.push(value)
    })
    return history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    console.error('Failed to load picker history:', error)
    return []
  }
}

/**
 * Save media file (image, audio)
 */
export async function saveMedia(mediaId: string, blob: Blob, filename: string, type: 'image' | 'audio') {
  try {
    await mediaStore.setItem(mediaId, {
      blob,
      filename,
      type,
      uploadedAt: new Date().toISOString()
    })
    return true
  } catch (error) {
    console.error('Failed to save media:', error)
    return false
  }
}

/**
 * Load media file
 */
export async function loadMedia(mediaId: string) {
  try {
    return await mediaStore.getItem(mediaId)
  } catch (error) {
    console.error('Failed to load media:', error)
    return null
  }
}

/**
 * Delete media file
 */
export async function deleteMedia(mediaId: string) {
  try {
    await mediaStore.removeItem(mediaId)
    return true
  } catch (error) {
    console.error('Failed to delete media:', error)
    return false
  }
}

/**
 * Clear all storage
 */
export async function clearAllStorage() {
  try {
    await lotterySessionsStore.clear()
    await pickerHistoryStore.clear()
    await mediaStore.clear()
    return true
  } catch (error) {
    console.error('Failed to clear storage:', error)
    return false
  }
}

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// ============================================
// POLL API
// ============================================

export const pollApi = {
  /**
   * Get all polls
   */
  async getAllPolls(status?: 'active' | 'draft' | 'expired') {
    const params = status ? { status } : {}
    const response = await apiClient.get('/polls', { params })
    return response.data
  },

  /**
   * Get poll by short code
   */
  async getPollByShortCode(shortCode: string) {
    const response = await apiClient.get(`/polls/${shortCode}`)
    return response.data
  },

  /**
   * Create new poll
   */
  async createPoll(pollData: {
    title: string
    question1: string
    question2: string
    question3?: string
    question4?: string
    question5?: string
    duration: number
    isDraft: boolean
  }) {
    const response = await apiClient.post('/polls', pollData)
    return response.data
  },

  /**
   * Submit vote
   */
  async submitVote(shortCode: string, choice: number, voterId: string) {
    const response = await apiClient.post(`/polls/${shortCode}/vote`, {
      choice,
      voterId,
    })
    return response.data
  },

  /**
   * Get poll results
   */
  async getPollResults(shortCode: string) {
    const response = await apiClient.get(`/polls/${shortCode}/results`)
    return response.data
  },

  /**
   * Delete poll
   */
  async deletePoll(shortCode: string) {
    const response = await apiClient.delete(`/polls/${shortCode}`)
    return response.data
  },

  /**
   * Connect to live updates via SSE
   */
  connectToLiveUpdates(shortCode: string, onMessage: (data: any) => void) {
    const eventSource = new EventSource(`${API_BASE_URL}/polls/${shortCode}/live`)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (error) {
        console.error('Error parsing SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      eventSource.close()
    }

    return eventSource
  },
}

// ============================================
// LOTTERY SESSION API
// ============================================

export const lotteryApi = {
  /**
   * Get all lottery sessions
   */
  async getAllSessions() {
    const response = await apiClient.get('/lottery/sessions')
    return response.data
  },

  /**
   * Get lottery session by ID
   */
  async getSession(sessionId: string) {
    const response = await apiClient.get(`/lottery/sessions/${sessionId}`)
    return response.data
  },

  /**
   * Save lottery session
   */
  async saveSession(sessionData: {
    sessionId: string
    name: string
    participants: any[]
    prizes: any[]
    winners: any[]
    settings?: any
  }) {
    const response = await apiClient.post('/lottery/sessions', sessionData)
    return response.data
  },

  /**
   * Delete lottery session
   */
  async deleteSession(sessionId: string) {
    const response = await apiClient.delete(`/lottery/sessions/${sessionId}`)
    return response.data
  },
}

// ============================================
// HEALTH CHECK API
// ============================================

export const healthApi = {
  /**
   * Check API health
   */
  async checkHealth() {
    const response = await apiClient.get('/health')
    return response.data
  },
}

export default apiClient

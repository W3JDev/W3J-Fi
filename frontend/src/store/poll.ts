import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pollApi } from '../services/api/client'

export interface Poll {
  id: number
  title: string
  shortCode: string
  startAt: Date
  endAt: Date
  question1: string
  question2: string
  question3?: string
  question4?: string
  question5?: string
  isDraft: boolean
  votes: Vote[]
}

export interface Vote {
  id: number
  poll: Poll
  voterId: string
  choice: number // 1-5
  createdAt: Date
}

export interface PollOption {
  id: number
  text: string
  votes: number
}

export const usePollStore = defineStore('poll', () => {
  // State
  const polls = ref<Poll[]>([])
  const currentPoll = ref<Poll | null>(null)
  const voterId = ref<string | null>(null)
  const hasVoted = ref(false)

  // Computed
  const activePolls = computed(() => {
    const now = new Date()
    return polls.value.filter(p => 
      !p.isDraft && 
      new Date(p.startAt) <= now && 
      new Date(p.endAt) >= now
    )
  })

  const draftPolls = computed(() => {
    return polls.value.filter(p => p.isDraft)
  })

  const expiredPolls = computed(() => {
    const now = new Date()
    return polls.value.filter(p => 
      !p.isDraft && 
      new Date(p.endAt) < now
    )
  })

  const currentPollOptions = computed(() => {
    if (!currentPoll.value) return []
    
    const options: PollOption[] = []
    const poll = currentPoll.value
    
    if (poll.question1) options.push({ id: 1, text: poll.question1, votes: 0 })
    if (poll.question2) options.push({ id: 2, text: poll.question2, votes: 0 })
    if (poll.question3) options.push({ id: 3, text: poll.question3, votes: 0 })
    if (poll.question4) options.push({ id: 4, text: poll.question4, votes: 0 })
    if (poll.question5) options.push({ id: 5, text: poll.question5, votes: 0 })
    
    // Count votes
    poll.votes.forEach(vote => {
      const option = options.find(o => o.id === vote.choice)
      if (option) option.votes++
    })
    
    return options
  })

  const totalVotes = computed(() => {
    return currentPoll.value?.votes.length || 0
  })

  // Actions
  async function loadPolls(status?: 'active' | 'draft' | 'expired') {
    try {
      const response = await pollApi.getAllPolls(status)
      // Backend returns array directly, not wrapped in data property
      polls.value = Array.isArray(response) ? response : (response.data || [])
    } catch (error) {
      console.error('Failed to load polls:', error)
      throw error
    }
  }

  async function loadPollByShortCode(shortCode: string) {
    try {
      const response = await pollApi.getPollByShortCode(shortCode)
      // Backend returns poll directly
      const poll = response.data || response
      setCurrentPoll(poll)
      return poll
    } catch (error) {
      console.error('Failed to load poll:', error)
      throw error
    }
  }

  function setPolls(newPolls: Poll[]) {
    polls.value = newPolls
  }

  async function addPoll(pollData: {
    title: string
    question1: string
    question2: string
    question3?: string
    question4?: string
    question5?: string
    duration: number
    isDraft: boolean
  }) {
    try {
      const response = await pollApi.createPoll(pollData)
      // Backend returns poll directly
      const poll = response.data || response
      polls.value.push(poll)
      return poll
    } catch (error) {
      console.error('Failed to create poll:', error)
      throw error
    }
  }

  async function deletePoll(shortCode: string) {
    try {
      await pollApi.deletePoll(shortCode)
      const index = polls.value.findIndex(p => p.shortCode === shortCode)
      if (index !== -1) {
        polls.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete poll:', error)
      throw error
    }
  }

  function setCurrentPoll(poll: Poll | null) {
    currentPoll.value = poll
  }

  function setVoterId(id: string) {
    voterId.value = id
  }

  function checkIfVoted(pollId: number, checkVoterId: string) {
    const poll = polls.value.find(p => p.id === pollId)
    if (poll) {
      return poll.votes.some(v => v.voterId === checkVoterId)
    }
    return false
  }

  async function addVote(shortCode: string, choice: number, checkVoterId: string) {
    try {
      const response = await pollApi.submitVote(shortCode, choice, checkVoterId)
      
      // Refresh current poll to get updated vote counts
      if (currentPoll.value?.shortCode === shortCode) {
        await loadPollByShortCode(shortCode)
      }
      
      hasVoted.value = true
      // Backend returns vote directly
      return response.data || response
    } catch (error) {
      console.error('Failed to vote:', error)
      throw error
    }
  }

  function connectToLiveUpdates(shortCode: string) {
    return pollApi.connectToLiveUpdates(shortCode, (data) => {
      // Update current poll with live data
      if (currentPoll.value?.shortCode === shortCode) {
        currentPoll.value = data
      }
    })
  }

  function clearPolls() {
    polls.value = []
    currentPoll.value = null
    hasVoted.value = false
  }

  return {
    // State
    polls,
    currentPoll,
    voterId,
    hasVoted,
    
    // Computed
    activePolls,
    draftPolls,
    expiredPolls,
    currentPollOptions,
    totalVotes,
    
    // Actions
    loadPolls,
    loadPollByShortCode,
    setPolls,
    addPoll,
    deletePoll,
    setCurrentPoll,
    setVoterId,
    checkIfVoted,
    addVote,
    connectToLiveUpdates,
    clearPolls,
  }
}, {
  persist: true,
})

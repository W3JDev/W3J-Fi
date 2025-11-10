import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  function setPolls(newPolls: Poll[]) {
    polls.value = newPolls
  }

  function addPoll(poll: Poll) {
    polls.value.push(poll)
  }

  function updatePoll(id: number, data: Partial<Poll>) {
    const poll = polls.value.find(p => p.id === id)
    if (poll) {
      Object.assign(poll, data)
    }
  }

  function deletePoll(id: number) {
    const index = polls.value.findIndex(p => p.id === id)
    if (index !== -1) {
      polls.value.splice(index, 1)
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

  function addVote(pollId: number, choice: number, checkVoterId: string) {
    const poll = polls.value.find(p => p.id === pollId)
    if (poll) {
      poll.votes.push({
        id: Date.now(),
        poll: poll,
        voterId: checkVoterId,
        choice,
        createdAt: new Date(),
      })
      hasVoted.value = true
    }
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
    setPolls,
    addPoll,
    updatePoll,
    deletePoll,
    setCurrentPoll,
    setVoterId,
    checkIfVoted,
    addVote,
    clearPolls,
  }
}, {
  persist: true,
})

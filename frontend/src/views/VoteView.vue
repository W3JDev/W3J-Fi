<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePollStore } from '../store/poll'

const route = useRoute()
const router = useRouter()
const pollStore = usePollStore()

const shortCode = route.params.shortCode as string
const selectedOption = ref<number | null>(null)
const hasVoted = ref(false)
const voterId = ref('')

const poll = computed(() => {
  return pollStore.polls.find(p => p.shortCode === shortCode)
})

const pollOptions = computed(() => {
  if (!poll.value) return []
  
  const options: Array<{id: number; text: string; votes: number}> = []
  if (poll.value.question1) options.push({ id: 1, text: poll.value.question1, votes: 0 })
  if (poll.value.question2) options.push({ id: 2, text: poll.value.question2, votes: 0 })
  if (poll.value.question3) options.push({ id: 3, text: poll.value.question3, votes: 0 })
  if (poll.value.question4) options.push({ id: 4, text: poll.value.question4, votes: 0 })
  if (poll.value.question5) options.push({ id: 5, text: poll.value.question5, votes: 0 })
  
  // Count votes
  poll.value.votes.forEach(vote => {
    const option = options.find(o => o.id === vote.choice)
    if (option) option.votes++
  })
  
  return options
})

const totalVotes = computed(() => poll.value?.votes.length || 0)

const isExpired = computed(() => {
  if (!poll.value) return true
  return new Date(poll.value.endAt) < new Date()
})

const timeRemaining = computed(() => {
  if (!poll.value) return 0
  const remaining = new Date(poll.value.endAt).getTime() - new Date().getTime()
  return Math.max(0, Math.floor(remaining / 1000))
})

onMounted(() => {
  // Generate or retrieve voter ID
  const storedVoterId = localStorage.getItem('voterId')
  if (storedVoterId) {
    voterId.value = storedVoterId
  } else {
    voterId.value = `voter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('voterId', voterId.value)
  }

  // Check if already voted
  if (poll.value) {
    hasVoted.value = pollStore.checkIfVoted(poll.value.id, voterId.value)
    if (hasVoted.value) {
      // Find what they voted for
      const userVote = poll.value.votes.find(v => v.voterId === voterId.value)
      if (userVote) {
        selectedOption.value = userVote.choice
      }
    }
  }

  // Start timer
  if (!isExpired.value) {
    const interval = setInterval(() => {
      if (timeRemaining.value <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  }
})

const submitVote = () => {
  if (!poll.value || selectedOption.value === null || hasVoted.value) return

  pollStore.addVote(poll.value.id, selectedOption.value, voterId.value)
  hasVoted.value = true
}

const getPercentage = (votes: number) => {
  if (totalVotes.value === 0) return 0
  return Math.round((votes / totalVotes.value) * 100)
}

const viewResults = () => {
  router.push(`/poll/${shortCode}/results`)
}
</script>

<template>
  <div class="min-h-screen bg-base-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      <!-- Poll Not Found -->
      <div v-if="!poll" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-bold">Poll not found</h3>
          <p>The poll code "{{ shortCode }}" does not exist.</p>
        </div>
      </div>

      <!-- Poll Expired -->
      <div v-else-if="isExpired" class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 class="font-bold">Poll has ended</h3>
          <p>This poll is no longer accepting votes.</p>
        </div>
        <button @click="viewResults" class="btn btn-sm">View Results</button>
      </div>

      <!-- Poll Draft -->
      <div v-else-if="poll.isDraft" class="alert alert-info">
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="font-bold">Poll is in draft mode</h3>
          <p>This poll has not been published yet.</p>
        </div>
      </div>

      <!-- Active Poll -->
      <div v-else class="card bg-base-200 shadow-2xl">
        <div class="card-body">
          <!-- Header -->
          <div class="text-center mb-6">
            <h1 class="text-3xl font-bold mb-2">{{ poll.title }}</h1>
            <p class="text-sm text-base-content/70">Poll Code: {{ poll.shortCode }}</p>
          </div>

          <!-- Timer -->
          <div v-if="!hasVoted" class="alert alert-info mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="flex-1">
              <p>Time remaining: <strong>{{ Math.floor(timeRemaining / 60) }}:{{ (timeRemaining % 60).toString().padStart(2, '0') }}</strong></p>
            </div>
          </div>

          <!-- Already Voted Message -->
          <div v-if="hasVoted" class="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 class="font-bold">Thank you for voting!</h3>
              <p>Your vote has been recorded.</p>
            </div>
          </div>

          <!-- Options -->
          <div class="space-y-3">
            <div v-for="option in pollOptions" :key="option.id">
              <button
                v-if="!hasVoted"
                @click="selectedOption = option.id"
                class="btn w-full justify-start"
                :class="{
                  'btn-primary': selectedOption === option.id,
                  'btn-outline': selectedOption !== option.id
                }"
              >
                <span class="flex-1 text-left">{{ option.text }}</span>
              </button>
              
              <!-- Show results after voting -->
              <div v-else class="w-full">
                <div class="flex justify-between items-center mb-1">
                  <span 
                    class="font-medium"
                    :class="{ 'text-primary font-bold': selectedOption === option.id }"
                  >
                    {{ option.text }}
                    <span v-if="selectedOption === option.id">✓</span>
                  </span>
                  <span class="text-sm">{{ option.votes }} votes ({{ getPercentage(option.votes) }}%)</span>
                </div>
                <progress 
                  class="progress progress-primary w-full" 
                  :value="option.votes" 
                  :max="totalVotes > 0 ? totalVotes : 1"
                ></progress>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div v-if="!hasVoted" class="card-actions justify-center mt-6">
            <button 
              @click="submitVote"
              :disabled="selectedOption === null"
              class="btn btn-primary btn-lg"
            >
              Submit Vote
            </button>
          </div>

          <!-- View Results Button -->
          <div v-else class="card-actions justify-center mt-6">
            <button @click="viewResults" class="btn btn-outline">
              View Full Results
            </button>
          </div>

          <!-- Stats -->
          <div class="stats shadow mt-6 w-full">
            <div class="stat place-items-center">
              <div class="stat-title">Total Votes</div>
              <div class="stat-value text-primary">{{ totalVotes }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

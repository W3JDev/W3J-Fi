<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePollStore } from '../store/poll'
import Confetti from '../components/shared/Confetti.vue'

const route = useRoute()
const router = useRouter()
const pollStore = usePollStore()

const shortCode = route.params.shortCode as string

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
  
  poll.value.votes.forEach(vote => {
    const option = options.find(o => o.id === vote.choice)
    if (option) option.votes++
  })
  
  return options.sort((a, b) => b.votes - a.votes)
})

const totalVotes = computed(() => poll.value?.votes.length || 0)

const getPercentage = (votes: number) => {
  if (totalVotes.value === 0) return 0
  return Math.round((votes / totalVotes.value) * 100)
}

const winner = computed(() => {
  return pollOptions.value[0]
})

const goBack = () => {
  router.push('/poll')
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <header class="navbar bg-w3j-success text-white shadow-lg">
      <div class="flex-1">
        <button @click="goBack" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold">Poll Results</h1>
      </div>
    </header>

    <div class="container mx-auto p-4 lg:p-8">
      <div v-if="!poll" class="alert alert-error">
        <p>Poll not found</p>
      </div>

      <div v-else class="max-w-4xl mx-auto">
        <div class="card bg-base-200 shadow-2xl">
          <div class="card-body">
            <h2 class="card-title text-3xl mb-6 text-center justify-center">{{ poll.title }}</h2>

            <!-- Winner Announcement -->
            <div v-if="winner && totalVotes > 0" class="alert alert-success mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 class="font-bold text-xl">🏆 Winner: {{ winner.text }}</h3>
                <p>{{ winner.votes }} votes ({{ getPercentage(winner.votes) }}%)</p>
              </div>
            </div>

            <!-- Results -->
            <div class="space-y-6">
              <div v-for="(option, index) in pollOptions" :key="option.id" class="relative">
                <div class="flex justify-between items-center mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-2xl font-bold text-base-content/50">{{ index + 1 }}</span>
                    <span class="font-bold text-lg">{{ option.text }}</span>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold">{{ option.votes }}</div>
                    <div class="text-sm text-base-content/70">{{ getPercentage(option.votes) }}%</div>
                  </div>
                </div>
                <progress 
                  class="progress progress-primary w-full h-6" 
                  :value="option.votes" 
                  :max="totalVotes > 0 ? totalVotes : 1"
                ></progress>
              </div>
            </div>

            <!-- Stats -->
            <div class="stats shadow mt-8 w-full">
              <div class="stat">
                <div class="stat-title">Total Votes</div>
                <div class="stat-value text-primary">{{ totalVotes }}</div>
              </div>
              <div class="stat">
                <div class="stat-title">Poll Code</div>
                <div class="stat-value text-sm">{{ poll.shortCode }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Confetti />
  </div>
</template>

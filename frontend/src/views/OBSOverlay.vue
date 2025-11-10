<script setup lang="ts">
import { computed } from 'vue'
import { usePollStore } from '../store/poll'

const pollStore = usePollStore()

const activePoll = computed(() => {
  return pollStore.activePolls[0]
})

const pollOptions = computed(() => {
  if (!activePoll.value) return []
  
  const options: Array<{id: number; text: string; votes: number}> = []
  if (activePoll.value.question1) options.push({ id: 1, text: activePoll.value.question1, votes: 0 })
  if (activePoll.value.question2) options.push({ id: 2, text: activePoll.value.question2, votes: 0 })
  if (activePoll.value.question3) options.push({ id: 3, text: activePoll.value.question3, votes: 0 })
  if (activePoll.value.question4) options.push({ id: 4, text: activePoll.value.question4, votes: 0 })
  if (activePoll.value.question5) options.push({ id: 5, text: activePoll.value.question5, votes: 0 })
  
  activePoll.value.votes.forEach(vote => {
    const option = options.find(o => o.id === vote.choice)
    if (option) option.votes++
  })
  
  return options
})

const totalVotes = computed(() => activePoll.value?.votes.length || 0)

const getPercentage = (votes: number) => {
  if (totalVotes.value === 0) return 0
  return Math.round((votes / totalVotes.value) * 100)
}
</script>

<template>
  <div class="fixed inset-0 pointer-events-none p-8">
    <div v-if="activePoll" class="absolute bottom-0 right-0 w-96 bg-black/80 backdrop-blur-sm rounded-lg p-6 text-white shadow-2xl">
      <h3 class="text-xl font-bold mb-4">{{ activePoll.title }}</h3>
      <div class="space-y-3">
        <div v-for="option in pollOptions" :key="option.id">
          <div class="flex justify-between text-sm mb-1">
            <span>{{ option.text }}</span>
            <span>{{ getPercentage(option.votes) }}%</span>
          </div>
          <progress 
            class="progress progress-primary w-full" 
            :value="option.votes" 
            :max="totalVotes > 0 ? totalVotes : 1"
          ></progress>
        </div>
      </div>
      <div class="text-center mt-4 text-sm opacity-70">
        Total Votes: {{ totalVotes }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePollStore } from '../store/poll'

const pollStore = usePollStore()

const activePoll = computed(() => {
  return pollStore.activePolls[0]
})

const voteUrl = computed(() => {
  if (!activePoll.value) return ''
  return `${window.location.origin}/poll/${activePoll.value.shortCode}`
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black">
    <div v-if="activePoll" class="text-center text-white">
      <h2 class="text-4xl font-bold mb-8">Vote Now!</h2>
      <div class="bg-white p-8 rounded-lg mb-8 inline-block">
        <!-- QR Code placeholder - in production, use a QR code library -->
        <div class="w-64 h-64 flex items-center justify-center bg-gray-100 text-gray-800">
          <div>
            <p class="text-sm mb-2">QR Code</p>
            <p class="text-xs break-all px-4">{{ voteUrl }}</p>
          </div>
        </div>
      </div>
      <p class="text-2xl mb-4">{{ activePoll.title }}</p>
      <p class="text-xl opacity-70">Code: {{ activePoll.shortCode }}</p>
    </div>
    <div v-else class="text-white text-2xl">
      No active poll
    </div>
  </div>
</template>

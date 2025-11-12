<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePollStore } from '../store/poll'
import * as QRCode from 'qrcode'

const route = useRoute()
const pollStore = usePollStore()
const qrCodeDataUrl = ref<string>('')
const loading = ref(true)

// Check if we have a specific shortCode from route params
const shortCodeFromRoute = computed(() => route.params.shortCode as string)

// Get the poll - either from route param or first active poll
const targetPoll = computed(() => {
  if (shortCodeFromRoute.value) {
    return pollStore.polls.find(p => p.shortCode === shortCodeFromRoute.value) || pollStore.currentPoll
  }
  return pollStore.activePolls[0]
})

const voteUrl = computed(() => {
  if (!targetPoll.value) return ''
  return `${window.location.origin}/poll/${targetPoll.value.shortCode}`
})

// Generate QR code when vote URL changes
const generateQRCode = async () => {
  if (!voteUrl.value) {
    qrCodeDataUrl.value = ''
    return
  }

  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(voteUrl.value, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
  }
}

// Watch for changes to the vote URL
watch(voteUrl, () => {
  generateQRCode()
}, { immediate: true })

onMounted(async () => {
  // If we have a shortCode from route, load that specific poll
  if (shortCodeFromRoute.value) {
    try {
      await pollStore.loadPollByShortCode(shortCodeFromRoute.value)
    } catch (error) {
      console.error('Failed to load poll:', error)
    }
  } else {
    // Load all polls to find active ones
    try {
      await pollStore.loadPolls('active')
    } catch (error) {
      console.error('Failed to load polls:', error)
    }
  }
  loading.value = false
  generateQRCode()
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <div v-if="loading" class="text-white text-2xl">
      <span class="loading loading-spinner loading-lg"></span>
      <p class="mt-4">Loading poll...</p>
    </div>
    <div v-else-if="targetPoll" class="text-center text-white">
      <h2 class="text-5xl font-bold mb-4">📱 Scan to Vote!</h2>
      <div class="bg-white p-8 rounded-2xl mb-8 inline-block shadow-2xl">
        <img v-if="qrCodeDataUrl" :src="qrCodeDataUrl" alt="QR Code" class="w-80 h-80" />
        <div v-else class="w-80 h-80 flex items-center justify-center bg-gray-100 text-gray-800">
          <p class="text-sm">Generating QR Code...</p>
        </div>
      </div>
      <p class="text-3xl mb-2 font-bold">{{ targetPoll.title }}</p>
      <p class="text-2xl opacity-80 mb-4">Short Code: <span class="font-mono bg-white/20 px-4 py-2 rounded">{{ targetPoll.shortCode }}</span></p>
      <p class="text-xl opacity-60">{{ voteUrl }}</p>
      <div class="mt-8 text-lg opacity-75">
        <p>📲 Open your phone camera</p>
        <p>👆 Point at QR code</p>
        <p>✅ Tap notification to vote</p>
      </div>
    </div>
    <div v-else class="text-white text-center">
      <div class="text-6xl mb-4">📊</div>
      <p class="text-3xl font-bold">No Poll Found</p>
      <p class="text-xl opacity-70 mt-2">Create an active poll first</p>
    </div>
  </div>
</template>

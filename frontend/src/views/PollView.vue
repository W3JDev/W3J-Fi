<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePollStore } from '../store/poll'

const router = useRouter()
const pollStore = usePollStore()

const showCreateModal = ref(false)
const loading = ref(true)
const pollForm = ref({
  title: '',
  question1: '',
  question2: '',
  question3: '',
  question4: '',
  question5: '',
  duration: 60,
  isDraft: false
})

const allPolls = computed(() => pollStore.polls || [])

onMounted(async () => {
  try {
    await pollStore.loadPolls()
  } catch (err) {
    console.error('Failed to load polls:', err)
  } finally {
    loading.value = false
  }
})

const createPoll = async () => {
  try {
    await pollStore.addPoll({
      title: pollForm.value.title,
      question1: pollForm.value.question1,
      question2: pollForm.value.question2,
      question3: pollForm.value.question3 || undefined,
      question4: pollForm.value.question4 || undefined,
      question5: pollForm.value.question5 || undefined,
      duration: pollForm.value.duration,
      isDraft: pollForm.value.isDraft
    })

    // Reset form
    pollForm.value = {
      title: '',
      question1: '',
      question2: '',
      question3: '',
      question4: '',
      question5: '',
      duration: 60,
      isDraft: false
    }
    showCreateModal.value = false
  } catch (err) {
    console.error('Failed to create poll:', err)
    alert('Failed to create poll. Please try again.')
  }
}

const viewPoll = (poll: any) => {
  router.push(`/poll/${poll.shortCode}`)
}

const deletePoll = async (poll: any) => {
  if (confirm(`Delete poll "${poll.title}"?`)) {
    try {
      await pollStore.deletePoll(poll.shortCode)
    } catch (err) {
      console.error('Failed to delete poll:', err)
      alert('Failed to delete poll. Please try again.')
    }
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}

const getPollStatus = (poll: any) => {
  const now = new Date()
  if (poll.isDraft) return 'Draft'
  if (new Date(poll.endAt) < now) return 'Ended'
  if (new Date(poll.startAt) > now) return 'Scheduled'
  return 'Active'
}

const goBack = () => {
  router.push('/')
}

const copyVoteLink = async (poll: any) => {
  const voteUrl = `${window.location.origin}/poll/${poll.shortCode}`
  try {
    await navigator.clipboard.writeText(voteUrl)
    alert(`✅ Vote link copied!\n\nShare this link for people to vote:\n${voteUrl}`)
  } catch (err) {
    // Fallback for browsers that don't support clipboard API
    prompt('Copy this voting link:', voteUrl)
  }
}

const showQRCode = (poll: any) => {
  // Open QR code in new window/tab for easy scanning
  window.open(`/poll/${poll.shortCode}/qr`, '_blank', 'width=600,height=700')
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Header -->
    <header class="navbar bg-w3j-success text-white shadow-lg">
      <div class="flex-1">
        <button @click="goBack" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold">Live Polls</h1>
      </div>
      <div class="flex-none">
        <button @click="showCreateModal = true" class="btn btn-ghost">
          + New Poll
        </button>
      </div>
    </header>

    <div class="container mx-auto p-4 lg:p-8">
      <!-- Info Banner -->
      <div class="alert alert-info mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <div class="font-bold">Local Demo Mode</div>
          <div class="text-sm">Polls are stored locally. For production use with real-time voting, deploy with the Symfony backend.</div>
        </div>
      </div>

      <!-- Polls List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Create Poll Card -->
        <div 
          @click="showCreateModal = true"
          class="card bg-base-200 shadow-xl border-2 border-dashed border-base-300 hover:border-w3j-success cursor-pointer"
        >
          <div class="card-body items-center text-center">
            <div class="text-6xl mb-4">➕</div>
            <h2 class="card-title">Create New Poll</h2>
            <p class="text-sm text-base-content/70">Set up a new poll for your audience</p>
          </div>
        </div>

        <!-- Poll Cards -->
        <div v-for="poll in allPolls" :key="poll.id" class="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
          <div class="card-body">
            <div class="flex justify-between items-start">
              <h2 class="card-title">{{ poll.title }}</h2>
              <span 
                class="badge"
                :class="{
                  'badge-success': getPollStatus(poll) === 'Active',
                  'badge-warning': getPollStatus(poll) === 'Draft',
                  'badge-info': getPollStatus(poll) === 'Scheduled',
                  'badge-ghost': getPollStatus(poll) === 'Ended'
                }"
              >
                {{ getPollStatus(poll) }}
              </span>
            </div>
            
            <div class="text-sm space-y-1 mt-2">
              <p><strong>Code:</strong> {{ poll.shortCode }}</p>
              <p><strong>Votes:</strong> {{ poll.votes.length }}</p>
              <p><strong>Created:</strong> {{ formatDate(poll.startAt) }}</p>
              <p><strong>Ends:</strong> {{ formatDate(poll.endAt) }}</p>
            </div>

            <div class="card-actions justify-between mt-4 flex-wrap gap-2">
              <div class="flex gap-2">
                <button @click="copyVoteLink(poll)" class="btn btn-sm btn-info" title="Copy vote link">
                  🔗 Share
                </button>
                <button @click="showQRCode(poll)" class="btn btn-sm btn-accent" title="Show QR code">
                  📱 QR
                </button>
              </div>
              <div class="flex gap-2">
                <button @click="viewPoll(poll)" class="btn btn-sm btn-primary">View</button>
                <button @click="deletePoll(poll)" class="btn btn-sm btn-error">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="allPolls.length === 0" class="col-span-full text-center py-12 text-base-content/50">
          <div class="text-6xl mb-4">📊</div>
          <p class="text-xl font-bold">No polls yet</p>
          <p>Create your first poll to get started!</p>
        </div>
      </div>
    </div>

    <!-- Create Poll Modal -->
    <div v-if="showCreateModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-lg mb-4">Create New Poll</h3>
        
        <div class="form-control">
          <label class="label">
            <span class="label-text">Poll Title</span>
          </label>
          <input v-model="pollForm.title" type="text" placeholder="What should we play next?" class="input input-bordered" />
        </div>

        <div class="divider">Options (2-5)</div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Option 1 *</span>
          </label>
          <input v-model="pollForm.question1" type="text" placeholder="First option" class="input input-bordered" required />
        </div>

        <div class="form-control mt-2">
          <label class="label">
            <span class="label-text">Option 2 *</span>
          </label>
          <input v-model="pollForm.question2" type="text" placeholder="Second option" class="input input-bordered" required />
        </div>

        <div class="form-control mt-2">
          <label class="label">
            <span class="label-text">Option 3</span>
          </label>
          <input v-model="pollForm.question3" type="text" placeholder="Third option (optional)" class="input input-bordered" />
        </div>

        <div class="form-control mt-2">
          <label class="label">
            <span class="label-text">Option 4</span>
          </label>
          <input v-model="pollForm.question4" type="text" placeholder="Fourth option (optional)" class="input input-bordered" />
        </div>

        <div class="form-control mt-2">
          <label class="label">
            <span class="label-text">Option 5</span>
          </label>
          <input v-model="pollForm.question5" type="text" placeholder="Fifth option (optional)" class="input input-bordered" />
        </div>

        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">Duration (seconds)</span>
          </label>
          <div class="flex gap-2">
            <button @click="pollForm.duration = 30" class="btn btn-sm" :class="{ 'btn-active': pollForm.duration === 30 }">30s</button>
            <button @click="pollForm.duration = 60" class="btn btn-sm" :class="{ 'btn-active': pollForm.duration === 60 }">60s</button>
            <button @click="pollForm.duration = 120" class="btn btn-sm" :class="{ 'btn-active': pollForm.duration === 120 }">2min</button>
            <button @click="pollForm.duration = 300" class="btn btn-sm" :class="{ 'btn-active': pollForm.duration === 300 }">5min</button>
            <input v-model.number="pollForm.duration" type="number" min="15" max="3600" class="input input-bordered input-sm w-20" />
          </div>
        </div>

        <div class="form-control mt-4">
          <label class="label cursor-pointer">
            <span class="label-text">Save as draft</span>
            <input v-model="pollForm.isDraft" type="checkbox" class="checkbox" />
          </label>
        </div>

        <div class="modal-action">
          <button 
            @click="createPoll" 
            :disabled="!pollForm.title || !pollForm.question1 || !pollForm.question2"
            class="btn btn-primary"
          >
            {{ pollForm.isDraft ? 'Save Draft' : 'Create Poll' }}
          </button>
          <button @click="showCreateModal = false" class="btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

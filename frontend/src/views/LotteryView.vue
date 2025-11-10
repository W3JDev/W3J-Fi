<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLotteryStore } from '../store/lottery'
import { useGlobalStore } from '../store/global'
import { Sphere3DManager } from '../services/three/Sphere3D'
import { soundEffects } from '../services/audio/SoundEffects'
import { importParticipantsFromExcel, exportParticipantsToExcel, exportWinnersToExcel, createParticipantTemplate } from '../utils/excel'
import { pickMultipleRandom } from '../utils/random'
import Confetti from '../components/shared/Confetti.vue'


const router = useRouter()
const lotteryStore = useLotteryStore()
const globalStore = useGlobalStore()

const sphereContainer = ref<HTMLElement | null>(null)
const confettiRef = ref<InstanceType<typeof Confetti> | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const showPrizeModal = ref(false)
const showParticipantModal = ref(false)
const showWinnerModal = ref(false)

const prizeForm = ref({
  name: '',
  count: 1,
  description: '',
  imageUrl: ''
})

const participantForm = ref({
  name: '',
  department: '',
  avatar: ''
})

let sphere3D: Sphere3DManager | null = null

const currentWinners = ref<string[]>([])

onMounted(() => {
  // Initialize 3D Sphere
  if (sphereContainer.value) {
    sphere3D = new Sphere3DManager(sphereContainer.value, {
      containerWidth: sphereContainer.value.clientWidth,
      containerHeight: 600,
      sphereRadius: 5,
      maxVisibleNames: 40
    })

    // Initial load of participants
    updateSphereNames()
  }

  // Resume audio context
  document.addEventListener('click', () => soundEffects.resume(), { once: true })

  // Handle window resize
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (sphere3D) {
    sphere3D.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

// Watch for participant changes
watch(() => lotteryStore.participants, () => {
  updateSphereNames()
}, { deep: true })

const handleResize = () => {
  if (sphere3D && sphereContainer.value) {
    sphere3D.resize(sphereContainer.value.clientWidth, 600)
  }
}

const updateSphereNames = () => {
  if (sphere3D) {
    sphere3D.updateNames(lotteryStore.availableParticipants)
  }
}

const canDraw = computed(() => {
  return !!lotteryStore.currentPrize &&
         lotteryStore.availableParticipants.length > 0 &&
         !lotteryStore.isDrawing
})

const addPrize = () => {
  if (prizeForm.value.name && prizeForm.value.count > 0) {
    lotteryStore.addPrize({
      name: prizeForm.value.name,
      sort: lotteryStore.prizes.length + 1,
      count: prizeForm.value.count,
      isUsedCount: 0,
      picture: {
        id: `pic-${Date.now()}`,
        name: prizeForm.value.name,
        url: prizeForm.value.imageUrl || ''
      },
      separateCount: {
        enable: false,
        countList: []
      },
      desc: prizeForm.value.description,
      isShow: true,
      isUsed: false,
      frequency: 1
    })
    
    // Reset form
    prizeForm.value = {
      name: '',
      count: 1,
      description: '',
      imageUrl: ''
    }
    showPrizeModal.value = false
  }
}

const addParticipant = () => {
  if (participantForm.value.name) {
    lotteryStore.addParticipant(
      participantForm.value.name,
      participantForm.value.department,
      participantForm.value.avatar
    )
    
    // Reset form
    participantForm.value = {
      name: '',
      department: '',
      avatar: ''
    }
    showParticipantModal.value = false
  }
}

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    try {
      const participants = await importParticipantsFromExcel(file)
      lotteryStore.importParticipants(participants)
      alert(`Successfully imported ${participants.length} participants!`)
    } catch (error) {
      alert(`Error importing file: ${error}`)
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const exportParticipants = () => {
  exportParticipantsToExcel(lotteryStore.participants)
}

const exportWinners = () => {
  exportWinnersToExcel(lotteryStore.winners)
}

const downloadTemplate = () => {
  createParticipantTemplate()
}

const startDraw = async () => {
  if (!canDraw.value || !sphere3D) return

  lotteryStore.startDrawing()
  const prize = lotteryStore.currentPrize!
  const drawCount = prize.count - prize.isUsedCount

  try {
    // Play spinning sound
    if (globalStore.soundEnabled) {
      soundEffects.spin(3)
    }

    // Animate sphere spin
    await sphere3D.spinForDraw(3000)

    // Select winners
    const winners = pickMultipleRandom(lotteryStore.availableParticipants, Math.min(drawCount, 1))
    currentWinners.value = winners.map(w => w.name)

    // Mark winners in store
    winners.forEach(winner => {
      lotteryStore.markWinner(winner.id, prize.id)
    })

    // Highlight winner in sphere
    if (winners.length > 0 && winners[0]) {
      sphere3D.highlightWinner(winners[0].name)
    }

    // Play win sound
    if (globalStore.soundEnabled) {
      await soundEffects.win()
    }

    // Show confetti
    if (confettiRef.value) {
      confettiRef.value.fireworks()
    }

    // Show winner modal
    showWinnerModal.value = true

    // Move to next prize if current is complete
    if (prize.isUsed) {
      setTimeout(() => {
        lotteryStore.nextPrize()
      }, 2000)
    }
  } catch (error) {
    console.error('Error during draw:', error)
  } finally {
    lotteryStore.stopDrawing()
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Header -->
    <header class="navbar bg-w3j-primary text-white shadow-lg">
      <div class="flex-1">
        <button @click="goBack" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold">3D Lottery</h1>
      </div>
      <div class="flex-none gap-2">
        <button @click="globalStore.toggleSound()" class="btn btn-ghost">
          <span v-if="globalStore.soundEnabled">🔊</span>
          <span v-else>🔇</span>
        </button>
      </div>
    </header>

    <div class="container mx-auto p-4 lg:p-8">
      <!-- Main Area -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 3D Sphere Section -->
        <div class="lg:col-span-2">
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Drawing Arena</h2>
              
              <!-- 3D Sphere Container -->
              <div ref="sphereContainer" class="lottery-canvas bg-black rounded-lg" style="height: 600px;"></div>

              <!-- Prize Info -->
              <div v-if="lotteryStore.currentPrize" class="alert alert-info mt-4">
                <div class="w-full">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-bold text-lg">Current Prize: {{ lotteryStore.currentPrize.name }}</h3>
                      <p class="text-sm">
                        Drawing {{ lotteryStore.currentPrize.count - lotteryStore.currentPrize.isUsedCount }} winner(s)
                      </p>
                      <p class="text-sm">Available Participants: {{ lotteryStore.availableParticipants.length }}</p>
                    </div>
                    <div class="text-right">
                      <div class="text-3xl font-bold">
                        {{ lotteryStore.currentPrize.isUsedCount }}/{{ lotteryStore.currentPrize.count }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Control Buttons -->
              <div class="flex gap-4 justify-center mt-4">
                <button 
                  @click="startDraw" 
                  :disabled="!canDraw"
                  class="btn btn-lg w3j-btn-primary"
                >
                  <span v-if="!lotteryStore.isDrawing">🎰 Start Draw</span>
                  <span v-else class="loading loading-spinner"></span>
                </button>
                <button 
                  @click="lotteryStore.nextPrize()"
                  :disabled="lotteryStore.isDrawing"
                  class="btn btn-lg btn-outline"
                >
                  Skip Prize
                </button>
              </div>

              <!-- Stats -->
              <div class="stats stats-vertical lg:stats-horizontal shadow mt-4 w-full">
                <div class="stat">
                  <div class="stat-title">Total Participants</div>
                  <div class="stat-value text-w3j-primary">{{ lotteryStore.participants.length }}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Total Winners</div>
                  <div class="stat-value text-w3j-success">{{ lotteryStore.winners.length }}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Prizes</div>
                  <div class="stat-value text-w3j-accent">{{ lotteryStore.prizes.length }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Prize Management -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Prizes</h2>
              <button @click="showPrizeModal = true" class="btn btn-primary btn-sm">
                + Add Prize
              </button>
              <div class="mt-4 space-y-2 max-h-64 overflow-y-auto">
                <div v-if="lotteryStore.prizes.length === 0" class="text-center text-base-content/50 py-4">
                  No prizes added
                </div>
                <div 
                  v-for="(prize, index) in lotteryStore.prizes" 
                  :key="prize.id"
                  class="p-3 rounded"
                  :class="index === lotteryStore.currentPrizeIndex ? 'bg-w3j-primary text-white' : 'bg-base-300'"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-bold">{{ prize.name }}</div>
                      <div class="text-sm">{{ prize.isUsedCount }}/{{ prize.count }} drawn</div>
                    </div>
                    <div>
                      <span v-if="prize.isUsed" class="badge badge-success">✓ Complete</span>
                      <span v-else-if="index === lotteryStore.currentPrizeIndex" class="badge badge-info">Current</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Participant Management -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Participants</h2>
              <div class="flex flex-col gap-2">
                <button @click="showParticipantModal = true" class="btn btn-sm btn-outline">
                  + Add Participant
                </button>
                <button @click="fileInput?.click()" class="btn btn-sm btn-outline">
                  📁 Import Excel
                </button>
                <input 
                  ref="fileInput"
                  type="file" 
                  accept=".xlsx,.xls"
                  @change="handleFileImport"
                  class="hidden"
                />
                <button @click="exportParticipants" class="btn btn-sm btn-outline">
                  📤 Export Excel
                </button>
                <button @click="downloadTemplate" class="btn btn-sm btn-ghost">
                  📝 Download Template
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Actions</h2>
              <button 
                @click="exportWinners" 
                :disabled="lotteryStore.winners.length === 0"
                class="btn btn-success btn-sm"
              >
                🏆 Export Winners
              </button>
              <button 
                @click="lotteryStore.resetWinners()"
                class="btn btn-warning btn-sm"
              >
                🔄 Reset Drawing
              </button>
              <button 
                @click="lotteryStore.reset()"
                class="btn btn-error btn-sm"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Prize Modal -->
    <div v-if="showPrizeModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Add Prize</h3>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Prize Name</span>
          </label>
          <input v-model="prizeForm.name" type="text" class="input input-bordered" placeholder="Grand Prize" />
        </div>
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">Number of Winners</span>
          </label>
          <input v-model.number="prizeForm.count" type="number" min="1" class="input input-bordered" />
        </div>
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">Description (Optional)</span>
          </label>
          <textarea v-model="prizeForm.description" class="textarea textarea-bordered"></textarea>
        </div>
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">Image URL (Optional)</span>
          </label>
          <input v-model="prizeForm.imageUrl" type="url" class="input input-bordered" placeholder="https://..." />
        </div>
        <div class="modal-action">
          <button @click="addPrize" class="btn btn-primary">Add</button>
          <button @click="showPrizeModal = false" class="btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Participant Modal -->
    <div v-if="showParticipantModal" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Add Participant</h3>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Name</span>
          </label>
          <input v-model="participantForm.name" type="text" class="input input-bordered" placeholder="John Doe" />
        </div>
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">Department (Optional)</span>
          </label>
          <input v-model="participantForm.department" type="text" class="input input-bordered" placeholder="Engineering" />
        </div>
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">Avatar URL (Optional)</span>
          </label>
          <input v-model="participantForm.avatar" type="url" class="input input-bordered" placeholder="https://..." />
        </div>
        <div class="modal-action">
          <button @click="addParticipant" class="btn btn-primary">Add</button>
          <button @click="showParticipantModal = false" class="btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Winner Modal -->
    <div v-if="showWinnerModal" class="modal modal-open">
      <div class="modal-box max-w-2xl">
        <h3 class="font-bold text-3xl mb-6 text-center text-w3j-success">🎉 Congratulations! 🎉</h3>
        <div class="space-y-4">
          <div v-for="winner in currentWinners" :key="winner" class="alert alert-success">
            <div class="w-full text-center">
              <div class="text-2xl font-bold">{{ winner }}</div>
              <div class="text-lg">Winner of {{ lotteryStore.currentPrize?.name }}</div>
            </div>
          </div>
        </div>
        <div class="modal-action justify-center">
          <button @click="showWinnerModal = false" class="btn btn-lg btn-primary">Continue</button>
        </div>
      </div>
    </div>

    <!-- Confetti -->
    <Confetti ref="confettiRef" />
  </div>
</template>

<style scoped>
.lottery-canvas {
  position: relative;
  overflow: hidden;
}
</style>

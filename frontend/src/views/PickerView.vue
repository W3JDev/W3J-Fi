<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePickerStore } from '../store/picker'
import { useGlobalStore } from '../store/global'
import { SlotMachine } from '../services/animation/SlotMachine'
import { soundEffects } from '../services/audio/SoundEffects'
import Confetti from '../components/shared/Confetti.vue'

const router = useRouter()
const pickerStore = usePickerStore()
const globalStore = useGlobalStore()

const slotContainer = ref<HTMLElement | null>(null)
const confettiRef = ref<InstanceType<typeof Confetti> | null>(null)
const nameInput = ref('')
const bulkInput = ref('')
const showSettings = ref(false)
const isFullscreen = ref(false)

let slotMachine: SlotMachine | null = null

const canDraw = computed(() => pickerStore.nameCount > 0 && !pickerStore.isSpinning)

onMounted(() => {
  // Initialize slot machine
  if (slotContainer.value) {
    slotMachine = new SlotMachine({
      container: slotContainer.value,
      names: pickerStore.nameList,
      duration: 3000,
      itemHeight: 120,
    })
  }

  // Resume audio context on user interaction
  document.addEventListener('click', () => soundEffects.resume(), { once: true })
})

onUnmounted(() => {
  if (slotMachine) {
    slotMachine.dispose()
  }
})

const addName = () => {
  if (nameInput.value.trim()) {
    pickerStore.addName(nameInput.value.trim())
    nameInput.value = ''
    updateSlotMachine()
  }
}

const removeName = (name: string) => {
  pickerStore.removeName(name)
  updateSlotMachine()
}

const importBulkNames = () => {
  const names = bulkInput.value
    .split(/[,\n]/)
    .map(n => n.trim())
    .filter(n => n !== '')
  
  pickerStore.setNames([...pickerStore.nameList, ...names])
  bulkInput.value = ''
  showSettings.value = false
  updateSlotMachine()
}

const clearAllNames = () => {
  if (confirm('Are you sure you want to clear all names?')) {
    pickerStore.clearNames()
    updateSlotMachine()
  }
}

const updateSlotMachine = () => {
  if (slotMachine) {
    slotMachine.updateNames(pickerStore.nameList)
  }
}

const startDraw = async () => {
  if (!canDraw.value || !slotMachine) return

  pickerStore.startSpinning()

  // Play spinning sound
  if (globalStore.soundEnabled) {
    soundEffects.spin(3)
  }

  try {
    // Enter fullscreen if enabled
    if (globalStore.fullscreenOnDraw && !isFullscreen.value) {
      await enterFullscreen()
    }

    // Spin the slot machine
    const winner = await slotMachine.spin()

    // Update store
    pickerStore.setWinner(winner)

    // Play win sound
    if (globalStore.soundEnabled) {
      await soundEffects.win()
    }

    // Show confetti
    if (confettiRef.value) {
      confettiRef.value.burst()
    }
  } catch (error) {
    console.error('Error during draw:', error)
  } finally {
    pickerStore.stopSpinning()
  }
}

const enterFullscreen = async () => {
  try {
    await document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } catch (error) {
    console.error('Failed to enter fullscreen:', error)
  }
}

const exitFullscreen = async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
    isFullscreen.value = false
  } catch (error) {
    console.error('Failed to exit fullscreen:', error)
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString()
}

const load500TestNames = () => {
  // Generate test names dynamically
  const firstNames = [
    'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
    'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
    'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
    'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
    'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
    'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
    'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon',
    'Jeffrey', 'Laura', 'Ryan', 'Cynthia', 'Jacob', 'Kathleen', 'Gary', 'Amy',
    'Nicholas', 'Shirley', 'Eric', 'Angela', 'Jonathan', 'Helen', 'Stephen', 'Anna',
    'Larry', 'Brenda', 'Justin', 'Pamela', 'Scott', 'Nicole', 'Brandon', 'Emma'
  ]
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
    'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
    'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
    'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
    'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
    'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson',
    'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza',
    'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers',
    'Long', 'Ross', 'Foster', 'Jimenez'
  ]

  const names: string[] = []
  for (let i = 0; i < 500; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]
    const number = Math.floor(i / (firstNames.length * lastNames.length)) + 1
    const suffix = number > 1 ? ` ${number}` : ''
    names.push(`${firstName} ${lastName}${suffix}`)
  }

  pickerStore.setNames(names)
  updateSlotMachine()
  alert('Loaded 500 test names successfully!')
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Header -->
    <header class="navbar bg-w3j-accent text-white shadow-lg">
      <div class="flex-1">
        <button @click="goBack" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 class="text-2xl font-bold">Name Picker</h1>
      </div>
      <div class="flex-none gap-2">
        <button @click="showSettings = !showSettings" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button @click="globalStore.toggleSound()" class="btn btn-ghost">
          <span v-if="globalStore.soundEnabled">🔊</span>
          <span v-else>🔇</span>
        </button>
        <button v-if="isFullscreen" @click="exitFullscreen" class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </header>

    <div class="container mx-auto p-4 lg:p-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main Slot Machine Area -->
        <div class="lg:col-span-2">
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <!-- Slot Machine Container -->
              <div 
                ref="slotContainer" 
                class="slot-machine h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg mb-6"
              ></div>

              <!-- Current Winner Display -->
              <div v-if="pickerStore.currentWinner" class="alert alert-success mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 class="font-bold">Winner: {{ pickerStore.currentWinner }}</h3>
                </div>
              </div>

              <!-- Control Buttons -->
              <div class="flex gap-4 justify-center">
                <button 
                  @click="startDraw" 
                  :disabled="!canDraw"
                  class="btn btn-lg w3j-btn-secondary"
                >
                  <span v-if="!pickerStore.isSpinning">🎯 Draw Name</span>
                  <span v-else class="loading loading-spinner"></span>
                </button>
              </div>

              <!-- Stats -->
              <div class="stats stats-vertical lg:stats-horizontal shadow mt-6 w-full">
                <div class="stat">
                  <div class="stat-title">Total Names</div>
                  <div class="stat-value text-w3j-accent">{{ pickerStore.nameCount }}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">History</div>
                  <div class="stat-value text-w3j-success">{{ pickerStore.history.length }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Add Name -->
          <div class="card bg-base-200 shadow-xl mb-6">
            <div class="card-body">
              <h2 class="card-title">Add Names</h2>
              <div class="form-control">
                <div class="join">
                  <input 
                    v-model="nameInput" 
                    @keyup.enter="addName"
                    type="text" 
                    placeholder="Enter name..." 
                    class="input input-bordered join-item w-full"
                  />
                  <button @click="addName" class="btn btn-primary join-item">Add</button>
                </div>
              </div>
              <div class="form-control mt-4">
                <label class="label cursor-pointer">
                  <span class="label-text">Remove winner from list</span>
                  <input 
                    type="checkbox" 
                    v-model="pickerStore.removeWinner"
                    class="checkbox checkbox-primary"
                  />
                </label>
              </div>
              <div class="flex gap-2 mt-2">
                <button @click="showSettings = true" class="btn btn-outline btn-sm flex-1">
                  Bulk Import
                </button>
                <button @click="load500TestNames" class="btn btn-outline btn-sm btn-accent flex-1">
                  Load 500 Test
                </button>
              </div>
            </div>
          </div>

          <!-- Name List -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <div class="flex justify-between items-center mb-4">
                <h2 class="card-title">Name List</h2>
                <button @click="clearAllNames" class="btn btn-error btn-sm">Clear All</button>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div v-if="pickerStore.nameList.length === 0" class="text-center text-base-content/50 py-8">
                  No names added yet
                </div>
                <div v-else class="space-y-2">
                  <div 
                    v-for="name in pickerStore.nameList" 
                    :key="name"
                    class="flex justify-between items-center p-2 bg-base-300 rounded"
                  >
                    <span>{{ name }}</span>
                    <button @click="removeName(name)" class="btn btn-ghost btn-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div class="card bg-base-200 shadow-xl mt-6">
        <div class="card-body">
          <div class="flex justify-between items-center mb-4">
            <h2 class="card-title">History</h2>
            <button @click="pickerStore.clearHistory()" class="btn btn-ghost btn-sm">Clear History</button>
          </div>
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Winner</th>
                  <th>Date & Time</th>
                  <th>Total Names</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="pickerStore.history.length === 0">
                  <td colspan="3" class="text-center text-base-content/50">No history yet</td>
                </tr>
                <tr v-for="entry in pickerStore.history.slice(0, 10)" :key="entry.id">
                  <td class="font-bold">{{ entry.winner }}</td>
                  <td>{{ formatDate(entry.timestamp) }}</td>
                  <td>{{ entry.names.length }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <div v-if="showSettings" class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Bulk Import Names</h3>
        <textarea 
          v-model="bulkInput"
          class="textarea textarea-bordered w-full h-48"
          placeholder="Enter names separated by commas or new lines..."
        ></textarea>
        <div class="modal-action">
          <button @click="importBulkNames" class="btn btn-primary">Import</button>
          <button @click="showSettings = false" class="btn">Close</button>
        </div>
      </div>
    </div>

    <!-- Confetti -->
    <Confetti ref="confettiRef" />
  </div>
</template>

<style scoped>
.slot-machine {
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLotteryStore, type Person } from '../store/lottery'
import { useGlobalStore } from '../store/global'
import { Sphere3DManager } from '../services/three/Sphere3D'
import { soundEffects } from '../services/audio/SoundEffects'
import { importParticipantsFromExcel, exportParticipantsToExcel, exportWinnersToExcel, createParticipantTemplate } from '../utils/excel'
import { pickMultipleRandom } from '../utils/random'
import Confetti from '../components/shared/Confetti.vue'
import { generate500TestParticipants } from '../utils/testData'


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
const lotteryState = ref<'grid' | 'sphere' | 'drawing' | 'winner'>('grid')

// --- New Draw Control Refs ---
const drawCount = ref(1)
const autoAdvancePrize = ref(true)
const isAutoDrawing = ref(false)
// ---------------------------

const currentWinners = ref<Person[]>([])
const loadingDemo = ref(false)

// --- New Computed Property ---
const remainingForCurrentPrize = computed(() => {
  if (!lotteryStore.currentPrize) return 0
  return lotteryStore.currentPrize.count - lotteryStore.currentPrize.isUsedCount
})
// ---------------------------

// Load demo lottery session from backend
const loadDemoData = async () => {
  loadingDemo.value = true
  try {
    const response = await fetch('http://localhost:3000/api/lottery/sessions')
    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      const session = data.data[0] // Load first session
      
      // Clear winners
      lotteryStore.resetWinners()
      
      // Load participants
      session.participants.forEach((p: any) => {
        lotteryStore.addParticipant(p.name, p.department, p.avatar)
      })
      
      // Load prizes
      session.prizes.forEach((p: any) => {
        lotteryStore.addPrize({
          name: p.name,
          sort: lotteryStore.prizes.length + 1,
          count: p.quantity,
          isUsedCount: 0,
          picture: { 
            id: `prize-${Date.now()}`,
            name: p.icon,
            url: ''
          },
          separateCount: {
            enable: false,
            countList: []
          },
          desc: '',
          isShow: true,
          isUsed: false,
          frequency: 1
        })
      })
      
      // Update the 3D sphere with participant names
      updateSphereNames()
      
      alert(`✅ Loaded demo data:\n- ${session.participants.length} participants\n- ${session.prizes.length} prizes`)
    } else {
      alert('No lottery sessions found in database. Run: node seed-data.js')
    }
  } catch (error) {
    console.error('Failed to load demo data:', error)
    alert('❌ Failed to load demo data. Make sure backend is running on port 3000.')
  } finally {
    loadingDemo.value = false
  }
}

// Load 500 test participants
const load500TestData = () => {
  loadingDemo.value = true
  try {
    // Clear existing data
    lotteryStore.resetWinners()
    
    // Generate 500 test participants
    const testParticipants = generate500TestParticipants()
    
    // Add all participants to store
    testParticipants.forEach(p => {
      lotteryStore.addParticipant(p.name, p.department, p.avatar || '')
    })
    
    // Add some test prizes
    const prizes = [
      { name: 'Grand Prize', count: 1 },
      { name: 'First Prize', count: 3 },
      { name: 'Second Prize', count: 5 },
      { name: 'Third Prize', count: 10 },
      { name: 'Consolation Prize', count: 20 }
    ]
    
    prizes.forEach((p, index) => {
      lotteryStore.addPrize({
        name: p.name,
        sort: index + 1,
        count: p.count,
        isUsedCount: 0,
        picture: { 
          id: `prize-${Date.now()}-${index}`,
          name: p.name,
          url: ''
        },
        separateCount: {
          enable: false,
          countList: []
        },
        desc: `${p.name} - ${p.count} winner(s)`,
        isShow: true,
        isUsed: false,
        frequency: 1
      })
    })
    
    // Update the 3D sphere with participant names
    updateSphereNames()
    
    alert(`✅ Loaded 500 TEST participants!\n- ${testParticipants.length} participants\n- ${prizes.length} prize tiers\n\nReady for testing!`)
  } catch (error) {
    console.error('Failed to load test data:', error)
    alert('❌ Failed to load test data.')
  } finally {
    loadingDemo.value = false
  }
}

onMounted(() => {
  // Initialize 3D Sphere with larger height and MORE names support
  if (sphereContainer.value) {
    console.log('Initializing Sphere3D...')
    console.log('Container:', sphereContainer.value.clientWidth, 'x', 800)
    
    sphere3D = new Sphere3DManager(sphereContainer.value, {
      containerWidth: sphereContainer.value.clientWidth,
      containerHeight: 800,
      sphereRadius: 5,
      maxVisibleNames: 500,
      cardSize: { width: 140, height: 200 },
      nameColor: '#ffffff',
      backgroundColor: '#000000',
      rowCount: 20 // More columns for better grid layout
    })

    console.log('Sphere3D initialized!')
    
    // Initial load of participants
    updateSphereNames()
    
    // Auto-load test data if no participants
    if (lotteryStore.participants.length === 0) {
      console.log('No participants found, loading test data...')
      setTimeout(() => load500TestData(), 500)
    }
  }

  // Resume audio context
  document.addEventListener('click', () => soundEffects.resume(), { once: true })

  // Handle window resize
  window.addEventListener('resize', handleResize)
  
  // Handle fullscreen changes
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      isFullscreen.value = false
      if (sphere3D && sphereContainer.value) {
        sphere3D.resize(sphereContainer.value.clientWidth, 800)
      }
    }
  })
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
    const height = document.fullscreenElement ? window.innerHeight : 800
    const width = document.fullscreenElement ? window.innerWidth : sphereContainer.value.clientWidth
    sphere3D.resize(width, height)
  }
}

const updateSphereNames = () => {
  if (sphere3D) {
    console.log('Updating sphere with participants:', lotteryStore.availableParticipants.length)
    sphere3D.updateNames(lotteryStore.availableParticipants)
    
    // Force render after update
    setTimeout(() => {
      sphere3D?.forceRender()
    }, 100)
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
    
    // Update 3D sphere with new participant
    updateSphereNames()
    
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
      
      // Update 3D sphere with imported participants
      updateSphereNames()
      
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

// Session Management
const saveSession = async () => {
  try {
    const sessionData = {
      name: `Lottery Session ${new Date().toLocaleString()}`,
      participants: lotteryStore.participants,
      prizes: lotteryStore.prizes,
      winners: lotteryStore.winners,
      currentPrizeIndex: lotteryStore.currentPrizeIndex
    }
    
    const response = await fetch('http://localhost:3000/api/lottery/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    })
    
    if (response.ok) {
      alert('✅ Session saved successfully!')
    } else {
      throw new Error('Failed to save session')
    }
  } catch (error) {
    console.error('Save session error:', error)
    alert('❌ Failed to save session. Make sure backend is running.')
  }
}

const loadSession = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/lottery/sessions')
    const data = await response.json()
    
    if (data.data && data.data.length > 0) {
      // Show selection if multiple sessions
      const session = data.data[0] // Load most recent for now
      
      if (confirm(`Load session: "${session.name}"?\n\nThis will replace current data.`)) {
        lotteryStore.resetWinners()
        
        // Load participants
        session.participants?.forEach((p: any) => {
          lotteryStore.addParticipant(p.name, p.department, p.avatar)
        })
        
        // Load prizes
        session.prizes?.forEach((p: any) => {
          lotteryStore.addPrize({
            name: p.name,
            sort: p.sort || lotteryStore.prizes.length + 1,
            count: p.count,
            isUsedCount: p.isUsedCount || 0,
            picture: p.picture,
            separateCount: p.separateCount || { enable: false, countList: [] },
            desc: p.desc || '',
            isShow: p.isShow !== false,
            isUsed: p.isUsed || false,
            frequency: p.frequency || 1
          })
        })
        
        // Update 3D sphere with loaded participants
        updateSphereNames()
        
        alert(`✅ Loaded: ${session.participants?.length || 0} participants, ${session.prizes?.length || 0} prizes`)
      }
    } else {
      alert('No saved sessions found.')
    }
  } catch (error) {
    console.error('Load session error:', error)
    alert('❌ Failed to load session. Make sure backend is running.')
  }
}

const startDraw = async () => {
  if (!canDraw.value || !sphere3D) return

  lotteryStore.startDrawing()
  const prize = lotteryStore.currentPrize!
  
  // Use the new drawCount ref, ensuring it doesn't exceed remaining slots
  const numToDraw = Math.min(drawCount.value, remainingForCurrentPrize.value)

  try {
    // Start continuous spinning
    sphere3D.startSpinning()
    
    // Play spinning sound
    if (globalStore.soundEnabled) {
      soundEffects.spin(3)
    }

    // Wait for dramatic effect - REDUCED
    await new Promise(resolve => setTimeout(resolve, 2000)) // Reduced from 3000

    // Stop spinning
    sphere3D.stopSpinning()

    // Select winners
    const winners = pickMultipleRandom(lotteryStore.availableParticipants, numToDraw)
    currentWinners.value = winners

    // IMMEDIATE effects BEFORE marking winners
    // Play win sound
    if (globalStore.soundEnabled) {
      soundEffects.win()
    }

    // Show confetti IMMEDIATELY
    if (confettiRef.value) {
      confettiRef.value.fireworks()
    }

    // Mark winners in store
    winners.forEach(winner => {
      lotteryStore.markWinner(winner.id, prize.id)
    })

    // Highlight ALL winners with proper positioning - SIMULTANEOUSLY
    const highlightPromises = winners.map((winner, index) => 
      sphere3D!.highlightWinner(winner.id, index, winners.length)
    )
    
    // Wait for all winners to be highlighted
    await Promise.all(highlightPromises)

    // Show winner modal
    showWinnerModal.value = true

    // Move to next prize if current is complete and auto-advance is on
    if (prize.isUsed && autoAdvancePrize.value) {
      setTimeout(() => {
        lotteryStore.nextPrize()
        // Remove winners from sphere after showing
        winners.forEach(winner => sphere3D?.removeWinner(winner.id))
      }, 3000)
    }
  } catch (error) {
    console.error('Error during draw:', error)
  } finally {
    lotteryStore.stopDrawing()
    sphere3D.stopSpinning() // Ensure spinning stops
    // Reset draw count to 1 after each draw
    drawCount.value = 1
  }
}

const startAutoDraw = async () => {
  if (!canDraw.value || !sphere3D) return

  isAutoDrawing.value = true
  lotteryStore.startDrawing()

  try {
    // Loop through all remaining prizes
    while (lotteryStore.currentPrize && !lotteryStore.currentPrize.isUsed && isAutoDrawing.value) {
      const prize = lotteryStore.currentPrize
      const remaining = prize.count - prize.isUsedCount

      for (let i = 0; i < remaining; i++) {
        if (!isAutoDrawing.value || lotteryStore.availableParticipants.length === 0) {
          break
        }

        // Start spinning
        sphere3D.startSpinning()
        if (globalStore.soundEnabled) soundEffects.spin(1.5)
        
        await new Promise(resolve => setTimeout(resolve, 1500)) // Reduced from 2000
        
        // Stop spinning
        sphere3D.stopSpinning()
        
        const winner = pickMultipleRandom(lotteryStore.availableParticipants, 1)[0]
        if (winner) {
          currentWinners.value = [winner]
          
          // IMMEDIATE effects FIRST
          if (globalStore.soundEnabled) soundEffects.win()
          if (confettiRef.value) confettiRef.value.burst()
          
          lotteryStore.markWinner(winner.id, prize.id)
          
          // Highlight winner - FAST
          await sphere3D.highlightWinner(winner.id, 0, 1)
          
          // Wait briefly before removing winner and next draw
          await new Promise(resolve => setTimeout(resolve, 1000)) // Reduced from 1500
          sphere3D.removeWinner(winner.id)
        }
      }

      if (autoAdvancePrize.value && isAutoDrawing.value) {
        lotteryStore.nextPrize()
        // Wait for prize to switch
        await new Promise(resolve => setTimeout(resolve, 500))
      } else if (!autoAdvancePrize.value) {
        // Stop if not auto-advancing
        break
      }
    }
  } catch (error) {
    console.error('Error during auto draw:', error)
  } finally {
    isAutoDrawing.value = false
    lotteryStore.stopDrawing()
    sphere3D.stopSpinning()
  }
}

const enterLottery = async () => {
  if (sphere3D) {
    lotteryState.value = 'sphere'
    await sphere3D.toggleView('sphere')
  }
}

const backToGrid = async () => {
  if (sphere3D) {
    lotteryState.value = 'grid'
    await sphere3D.toggleView('grid')
  }
}

const goBack = () => {
  router.push('/')
}

// Fullscreen functionality
const isFullscreen = ref(false)

const toggleFullscreen = () => {
  if (!sphereContainer.value) return

  if (!document.fullscreenElement) {
    sphereContainer.value.requestFullscreen()
    isFullscreen.value = true
    // Resize sphere to fullscreen
    if (sphere3D) {
      sphere3D.resize(window.innerWidth, window.innerHeight)
    }
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
    // Resize back to normal
    if (sphere3D && sphereContainer.value) {
      sphere3D.resize(sphereContainer.value.clientWidth, 600)
    }
  }
}

// Listen for fullscreen changes
onMounted(() => {
  // ... existing onMounted code ...
  
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      isFullscreen.value = false
      if (sphere3D && sphereContainer.value) {
        sphere3D.resize(sphereContainer.value.clientWidth, 600)
      }
    }
  })
})
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
        <button 
          @click="load500TestData" 
          :disabled="loadingDemo"
          class="btn btn-warning btn-sm"
        >
          <span v-if="!loadingDemo">🚀 Load 500 Test Names</span>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
        <button 
          @click="loadDemoData" 
          :disabled="loadingDemo"
          class="btn btn-success btn-sm"
        >
          <span v-if="!loadingDemo">🎲 Load Demo Data</span>
          <span v-else class="loading loading-spinner loading-sm"></span>
        </button>
        <button @click="globalStore.toggleSound()" class="btn btn-ghost">
          <span v-if="globalStore.soundEnabled">🔊</span>
          <span v-else>🔇</span>
        </button>
      </div>
    </header>

    <div class="container mx-auto p-4 lg:p-8">
      <!-- Main Area -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- 3D Sphere Section -->
        <div class="lg:col-span-3">
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Drawing Arena</h2>
              
              <!-- 3D Sphere Container with Fullscreen Button -->
              <div class="relative">
                <div ref="sphereContainer" class="lottery-canvas bg-gradient-to-br from-purple-900 via-blue-900 to-black rounded-lg relative" style="height: 800px; overflow: hidden; position: relative;">
                  <!-- Debug Info -->
                  <div class="absolute top-2 left-2 z-20 text-white text-xs bg-black/50 px-2 py-1 rounded">
                    Cards: {{ lotteryStore.participants.length }} | State: {{ lotteryState }}
                  </div>
                </div>
                <button 
                  @click="toggleFullscreen"
                  class="absolute top-4 right-4 btn btn-sm btn-circle btn-ghost bg-black/50 hover:bg-black/70 text-white z-10"
                  title="Toggle Fullscreen"
                >
                  <svg v-if="!isFullscreen" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Prize Info -->
              <div v-if="lotteryStore.currentPrize" class="alert alert-info mt-4">
                <div class="w-full">
                  <div class="flex justify-between items-center">
                    <div>
                      <h3 class="font-bold text-lg">Current Prize: {{ lotteryStore.currentPrize.name }}</h3>
                      <p class="text-sm">
                        Drawing {{ remainingForCurrentPrize }} winner(s)
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
                  v-if="lotteryState === 'grid'"
                  @click="enterLottery"
                  class="btn btn-lg w3j-btn-primary"
                >
                  🚀 Enter Lottery
                </button>

                <div v-if="lotteryState === 'sphere'" class="flex gap-4 justify-center">
                  <button 
                    @click="startDraw" 
                    :disabled="!canDraw"
                    class="btn btn-lg w3j-btn-primary"
                  >
                    <span v-if="!lotteryStore.isDrawing">🎰 Start Draw</span>
                    <span v-else class="loading loading-spinner"></span>
                  </button>
                  <button 
                    @click="startAutoDraw"
                    :disabled="!canDraw"
                    class="btn btn-lg btn-accent"
                  >
                    <span v-if="!isAutoDrawing">⚡ Auto Draw</span>
                    <span v-else class="loading loading-spinner"></span>
                  </button>
                  <button 
                    @click="backToGrid"
                    :disabled="lotteryStore.isDrawing || isAutoDrawing"
                    class="btn btn-lg btn-outline"
                  >
                    Back to Grid
                  </button>
                </div>
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
          <!-- Draw Controls -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Draw Controls</h2>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Number to draw</span>
                </label>
                <input type="number" min="1" :max="remainingForCurrentPrize" v-model.number="drawCount" class="input input-bordered" />
              </div>
              <div class="flex gap-2 mt-4">
                  <button @click="lotteryStore.previousPrize()" :disabled="lotteryStore.currentPrizeIndex === 0" class="btn btn-outline flex-1">‹ Prev</button>
                  <button @click="lotteryStore.nextPrize()" :disabled="lotteryStore.currentPrizeIndex === lotteryStore.prizes.length - 1" class="btn btn-outline flex-1">Next ›</button>
              </div>
              <div class="form-control mt-2">
                <label class="cursor-pointer label">
                  <span class="label-text">Auto-advance prize</span> 
                  <input type="checkbox" v-model="autoAdvancePrize" class="toggle toggle-primary" />
                </label>
              </div>
            </div>
          </div>

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

          <!-- Winners List -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">🏆 Winners</h2>
              <div v-if="lotteryStore.winners.length === 0" class="text-center text-base-content/50 py-8">
                <div class="text-4xl mb-2">🎯</div>
                <p>No winners yet</p>
                <p class="text-sm">Start drawing to see winners here!</p>
              </div>
              <div v-else class="space-y-2 max-h-80 overflow-y-auto">
                <div 
                  v-for="(winner, index) in lotteryStore.winners" 
                  :key="index"
                  class="bg-base-300 p-3 rounded-lg hover:bg-base-100 transition-colors"
                >
                  <div class="flex items-start gap-3">
                    <div class="text-2xl">
                      <span v-if="index === 0">🥇</span>
                      <span v-else-if="index === 1">🥈</span>
                      <span v-else-if="index === 2">🥉</span>
                      <span v-else>🎁</span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-lg truncate">{{ winner.name }}</div>
                      <div v-if="winner.department" class="text-sm text-base-content/70">
                        {{ winner.department }}
                      </div>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="badge badge-success badge-sm">
                          {{ winner.prizeName[0] || 'Prize' }}
                        </span>
                        <span class="text-xs text-base-content/50">
                          {{ new Date(winner.prizeTime[0] || Date.now()).toLocaleTimeString() }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="lotteryStore.winners.length > 0" class="mt-4 text-center text-sm text-base-content/70">
                Total: {{ lotteryStore.winners.length }} winner{{ lotteryStore.winners.length > 1 ? 's' : '' }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card bg-base-200 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Actions</h2>
              
              <!-- Session Management -->
              <div class="flex gap-2">
                <button 
                  @click="saveSession"
                  class="btn btn-primary btn-sm flex-1"
                  title="Save current lottery state to backend"
                >
                  💾 Save Session
                </button>
                <button 
                  @click="loadSession"
                  class="btn btn-info btn-sm flex-1"
                  title="Load saved session from backend"
                >
                  📂 Load Session
                </button>
              </div>

              <div class="divider my-2"></div>

              <!-- Export/Reset Actions -->
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

    <!-- Winner Modal - Enhanced -->
    <div v-if="showWinnerModal" class="modal modal-open">
      <div class="modal-box max-w-3xl">
        <!-- Prevent closing by clicking outside during draw -->
        <div class="text-center mb-8">
          <h3 class="font-bold text-5xl mb-4 text-w3j-success animate-bounce">
            🎉 WINNER! 🎉
          </h3>
          
          <!-- Prize Display -->
          <div v-if="lotteryStore.currentPrize" class="mb-6">
            <div class="text-6xl mb-2">
              {{ lotteryStore.currentPrize.picture.name || '🏆' }}
            </div>
            <div class="text-2xl font-bold text-w3j-primary">
              {{ lotteryStore.currentPrize.name }}
            </div>
          </div>
        </div>

        <!-- Winner(s) Display -->
        <div class="space-y-4 mb-8">
          <div v-for="winner in currentWinners" :key="winner.id" class="bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 p-6 rounded-2xl shadow-xl">
            <div class="flex items-center justify-center gap-4">
              <div v-if="winner.avatar" class="avatar">
                <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img :src="winner.avatar" />
                </div>
              </div>
              <div class="text-center">
                <div class="text-4xl font-black mb-2 text-gray-800 dark:text-white">
                  {{ winner.name }}
                </div>
                <div v-if="winner.department" class="text-lg text-gray-600 dark:text-gray-300">
                  {{ winner.department }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="modal-action justify-center">
          <button 
            @click="showWinnerModal = false" 
            class="btn btn-lg btn-primary px-12"
          >
            ✨ Continue Drawing ✨
          </button>
        </div>
      </div>
    </div>

    <!-- Confetti -->
    <Confetti ref="confettiRef" />
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 60px rgba(255, 215, 0, 1), 0 0 120px rgba(255, 215, 0, 0.8);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 80px rgba(255, 215, 0, 1), 0 0 160px rgba(255, 215, 0, 0.9);
  }
}

/* Winner card animation */
:deep(.card-element) {
  transition: all 0.3s ease;
}

.lottery-canvas {
  position: relative;
  overflow: hidden;
}
</style>

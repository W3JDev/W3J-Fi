<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import confetti from 'canvas-confetti'

const props = defineProps<{
  show?: boolean
  duration?: number
  particleCount?: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let confettiInstance: confetti.CreateTypes | null = null

onMounted(() => {
  if (canvasRef.value) {
    confettiInstance = confetti.create(canvasRef.value, {
      resize: true,
      useWorker: true
    })
  }
})

onUnmounted(() => {
  if (confettiInstance) {
    confettiInstance.reset()
  }
})

/**
 * Fire confetti
 */
const fire = async () => {
  if (!confettiInstance) return

  const duration = props.duration || 3000
  const particleCount = props.particleCount || 50
  const animationEnd = Date.now() + duration

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      clearInterval(interval)
      emit('complete')
      return
    }

    const particleRatio = timeLeft / duration

    confettiInstance!({
      particleCount: Math.floor(particleCount * particleRatio),
      startVelocity: 30,
      spread: 360,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2
      },
      colors: ['#0f5fd3', '#ff79c6', '#50fa7b', '#ffb86c', '#ff5555']
    })
  }, 250)
}

/**
 * Fire confetti burst
 */
const burst = () => {
  if (!confettiInstance) return

  const count = props.particleCount || 200
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#0f5fd3', '#ff79c6', '#50fa7b', '#ffb86c', '#ff5555']
  }

  function fireConfetti(particleRatio: number, opts: any) {
    confettiInstance!({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio)
    })
  }

  fireConfetti(0.25, {
    spread: 26,
    startVelocity: 55,
  })
  fireConfetti(0.2, {
    spread: 60,
  })
  fireConfetti(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8
  })
  fireConfetti(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2
  })
  fireConfetti(0.1, {
    spread: 120,
    startVelocity: 45,
  })

  setTimeout(() => emit('complete'), 1000)
}

/**
 * Fireworks effect
 */
const fireworks = async () => {
  if (!confettiInstance) return

  const duration = props.duration || 5000
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 0,
    colors: ['#0f5fd3', '#ff79c6', '#50fa7b', '#ffb86c', '#ff5555']
  }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      clearInterval(interval)
      emit('complete')
      return
    }

    const particleCount = 50 * (timeLeft / duration)
    
    confettiInstance!({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    })
    confettiInstance!({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    })
  }, 250)
}

// Expose methods
defineExpose({
  fire,
  burst,
  fireworks
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="confetti-canvas fixed inset-0 pointer-events-none"
    style="z-index: 9999;"
  />
</template>

<style scoped>
.confetti-canvas {
  width: 100%;
  height: 100%;
}
</style>

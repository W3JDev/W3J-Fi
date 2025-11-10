<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGlobalStore } from '../store/global'

const router = useRouter()
const globalStore = useGlobalStore()

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="min-h-screen bg-base-100">
    <!-- Header -->
    <header class="navbar bg-w3j-primary text-white shadow-lg">
      <div class="flex-1">
        <h1 class="text-3xl font-heading font-bold pl-4">W3JDev United</h1>
      </div>
      <div class="flex-none">
        <div class="dropdown dropdown-end">
          <label tabindex="0" class="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </label>
          <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a @click="globalStore.toggleSound()">{{ globalStore.soundEnabled ? '🔊' : '🔇' }} Sound</a></li>
            <li>
              <a>Theme</a>
              <ul class="p-2">
                <li><a @click="globalStore.setTheme('w3jdev')">W3JDev</a></li>
                <li><a @click="globalStore.setTheme('light')">Light</a></li>
                <li><a @click="globalStore.setTheme('dark')">Dark</a></li>
                <li><a @click="globalStore.setTheme('dracula')">Dracula</a></li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <div class="hero min-h-[60vh] bg-gradient-to-br from-w3j-primary to-w3j-primary-dark">
      <div class="hero-content text-center text-white">
        <div class="max-w-md">
          <h1 class="text-5xl font-bold mb-4">W3JDev United</h1>
          <p class="text-xl mb-8">Your All-in-One Event & Engagement Tool</p>
          <p class="mb-8">Powerful lottery, random picker, and live polling features combined in one seamless application.</p>
        </div>
      </div>
    </div>

    <!-- Feature Cards -->
    <div class="container mx-auto px-4 -mt-20 mb-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 3D Lottery Card -->
        <div class="card bg-base-100 shadow-2xl hover:shadow-w3j-primary/50 transition-all cursor-pointer" @click="navigateTo('/lottery')">
          <div class="card-body items-center text-center">
            <div class="text-6xl mb-4">🎰</div>
            <h2 class="card-title text-2xl">3D Lottery</h2>
            <p class="text-base-content/70">
              Stunning 3D sphere animation with Three.js. Perfect for company events with Excel import/export.
            </p>
            <ul class="text-sm text-left mt-4 space-y-2">
              <li>✅ 3D animated sphere</li>
              <li>✅ Excel import/export</li>
              <li>✅ Prize management</li>
              <li>✅ Confetti & sounds</li>
            </ul>
            <div class="card-actions mt-4">
              <button class="w3j-btn-primary">Launch Lottery</button>
            </div>
          </div>
        </div>

        <!-- Name Picker Card -->
        <div class="card bg-base-100 shadow-2xl hover:shadow-w3j-accent/50 transition-all cursor-pointer" @click="navigateTo('/picker')">
          <div class="card-body items-center text-center">
            <div class="text-6xl mb-4">🎯</div>
            <h2 class="card-title text-2xl">Name Picker</h2>
            <p class="text-base-content/70">
              Quick and simple random name selection with slot machine animation.
            </p>
            <ul class="text-sm text-left mt-4 space-y-2">
              <li>✅ Slot machine animation</li>
              <li>✅ Sound effects</li>
              <li>✅ Name list management</li>
              <li>✅ History tracking</li>
            </ul>
            <div class="card-actions mt-4">
              <button class="w3j-btn-secondary">Launch Picker</button>
            </div>
          </div>
        </div>

        <!-- Live Polls Card -->
        <div class="card bg-base-100 shadow-2xl hover:shadow-w3j-success/50 transition-all cursor-pointer" @click="navigateTo('/poll')">
          <div class="card-body items-center text-center">
            <div class="text-6xl mb-4">📊</div>
            <h2 class="card-title text-2xl">Live Polls</h2>
            <p class="text-base-content/70">
              Real-time voting for streamers with OBS integration and QR codes.
            </p>
            <ul class="text-sm text-left mt-4 space-y-2">
              <li>✅ Real-time updates</li>
              <li>✅ OBS overlay support</li>
              <li>✅ QR code generation</li>
              <li>✅ Anti-cheat system</li>
            </ul>
            <div class="card-actions mt-4">
              <button class="btn btn-success">Launch Polls</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-base-200 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Why Choose W3JDev United?</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="text-center">
            <div class="text-4xl mb-4">🎨</div>
            <h3 class="text-xl font-bold mb-2">Beautiful Design</h3>
            <p class="text-sm text-base-content/70">Modern UI with custom W3JDev branding and themes</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">⚡</div>
            <h3 class="text-xl font-bold mb-2">Fast & Offline</h3>
            <p class="text-sm text-base-content/70">Works without internet for lottery features</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">📱</div>
            <h3 class="text-xl font-bold mb-2">Mobile Ready</h3>
            <p class="text-sm text-base-content/70">Responsive design for all devices</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">🎬</div>
            <h3 class="text-xl font-bold mb-2">Streamer Tools</h3>
            <p class="text-sm text-base-content/70">OBS integration for content creators</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer footer-center p-10 bg-w3j-primary text-white">
      <div>
        <p class="font-bold text-lg">W3JDev United</p>
        <p>Version 1.0.0 - Built with ❤️ by W3JDev</p>
        <p class="text-sm mt-2">
          Inspired by log-lottery, random-name-picker, and OpenStreamPoll
        </p>
      </div>
      <div>
        <p class="text-sm">© 2025 W3JDev - MIT License</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  transition: all 0.3s ease;
}
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-100">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-w3j-primary">404</h1>
      <p class="text-2xl mt-4 mb-8">Page Not Found</p>
      <button @click="goHome" class="w3j-btn-primary">
        Go Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useGlobalStore } from './store/global'

const globalStore = useGlobalStore()

onMounted(() => {
  // Apply saved theme on mount
  document.documentElement.setAttribute('data-theme', globalStore.theme)
})
</script>

<template>
  <div id="app" class="min-h-screen">
    <router-view />
  </div>
</template>

<style>
/* Global app styles */
</style>

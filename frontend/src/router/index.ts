import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { title: 'W3JDev United - Event & Engagement Tools' }
  },
  {
    path: '/lottery',
    name: 'Lottery',
    component: () => import('../views/LotteryView.vue'),
    meta: { title: '3D Lottery - W3JDev United' }
  },
  {
    path: '/picker',
    name: 'Picker',
    component: () => import('../views/PickerView.vue'),
    meta: { title: 'Name Picker - W3JDev United' }
  },
  {
    path: '/poll',
    name: 'Poll',
    component: () => import('../views/PollView.vue'),
    meta: { title: 'Live Polls - W3JDev United' }
  },
  {
    path: '/poll/:shortCode',
    name: 'Vote',
    component: () => import('../views/VoteView.vue'),
    meta: { title: 'Vote - W3JDev United' }
  },
  {
    path: '/poll/:shortCode/results',
    name: 'Results',
    component: () => import('../views/ResultsView.vue'),
    meta: { title: 'Poll Results - W3JDev United' }
  },
  {
    path: '/poll/:shortCode/qr',
    name: 'PollQRCode',
    component: () => import('../views/OBSQRCode.vue'),
    meta: { title: 'QR Code - W3JDev United' }
  },
  {
    path: '/obs',
    name: 'OBS',
    component: () => import('../views/OBSOverlay.vue'),
    meta: { title: 'OBS Overlay - W3JDev United' }
  },
  {
    path: '/obs/qr',
    name: 'OBSQRCode',
    component: () => import('../views/OBSQRCode.vue'),
    meta: { title: 'OBS QR Code - W3JDev United' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '404 - W3JDev United' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Update page title on route change
router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'W3JDev United'
})

export default router

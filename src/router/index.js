import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'
import HistoryView from '@/views/HistoryView.vue'
import MentorsView from '@/views/MentorsView.vue'
import ProfileView from '../views/ProfileView.vue'
import RoadmapView from '../views/RoadmapView.vue'
import RoadmapDetailView from '../views/RoadmapDetailView.vue'

import { useAuthStore } from '@/store/authStore' // 1. Импорт

const routes = [
  { path: '/', name: 'Chat', component: ChatView },
  { path: '/history', name: 'History', component: HistoryView, meta: { requiresAuth: true } },
  { path: '/mentors', name: 'Mentors', component: MentorsView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
  { path: '/roadmap', name: 'Roadmap', component: RoadmapView, meta: { requiresAuth: true } },
  { path: '/roadmap/:id', name: 'RoadmapDetail', component: RoadmapDetailView, meta: { requiresAuth: true } }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 2. Навигационный гард
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Если маршрут требует авторизации и пользователя нет
  next()
})

export default router

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { auth } from './firebase'
import { signOut } from 'firebase/auth'

import router from './router'
import pinia from './store'
import { MotionPlugin } from '@vueuse/motion' // ← вот это добавил

window.addEventListener('keydown', async (e) => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey

  if (ctrlOrCmd && e.shiftKey && e.code === 'KeyX') {
    const confirmed = confirm('Clear all local data, log out, and reload?')
    if (confirmed) {
      try {
        await signOut(auth) // ← это добавляем
        console.log('👋 Вышли из Firebase перед очисткой')
      } catch (err) {
        console.error('❌ Ошибка выхода из Firebase:', err)
      }

      localStorage.clear()
      location.reload()
    }
  }
})
  

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(MotionPlugin) // ← и это

app.mount('#app')

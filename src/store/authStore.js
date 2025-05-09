import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, provider } from '@/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { setDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      user.value = result.user

      // 🔐 Сохраняем флаг авторизации
      localStorage.setItem('devise-auth', 'true')

      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        name: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp()
      }, { merge: true })

    } catch (err) {
      console.error('❌ Ошибка при входе:', err)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      user.value = null

      // 🧹 Удаляем флаг
      localStorage.removeItem('devise-auth')

      console.log('🚪 Вышел из аккаунта')
    } catch (err) {
      console.error('❌ Ошибка при выходе:', err)
    }
  }

  // 🧠 Проверка текущего пользователя при загрузке
  onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      user.value = currentUser
      localStorage.setItem('devise-auth', 'true')
    } else {
      user.value = null
      localStorage.removeItem('devise-auth')
    }
  })

  return {
    user,
    login,
    logout
  }
})

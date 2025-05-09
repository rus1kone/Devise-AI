import { defineStore } from 'pinia'
import { openai } from '@/services/openai'
import { db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from './authStore'


const STORAGE_KEY = 'devise-chat'
const HISTORY_KEY = 'devise-history'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    loading: false,
    title: 'New Chat',
    history: [],
    searchQuery: '',
    animating: false,
    pinned: [],
    isTyping: false,
    hasSavedOnce: false,
    chatId: null,
    historyLoaded: false,
    mentorPrompt: null,
    mentorId: null,
    model: 'gpt-3.5-turbo',
  }),

  actions: {
    async sendMessage(content) {
      this.loading = true

      if (!this.messages.find(msg => msg.role === 'system')) {
        this.messages.unshift({
          role: 'system',
          content: `
Ты — Devise AI, интеллектуальный ассистент, созданный компанией **Devise**.

Основатель Devise — **Руслан Кореньков**.

---

## 🎯 Основные принципы:

- Общайся **уверенно, чётко и доброжелательно**.
- Используй **Markdown** во всех сообщениях:
  - \`##\` Заголовки
  - \`-\` Списки
  - \`**Жирный текст**\`
  - \`>\` Цитаты
  - \`\`\`блоки кода\`\`\`
- Применяй **эмодзи**, если это добавляет выразительности.
- Давай **структурированные, визуально чистые и полезные ответы**.
- **Определи язык сообщения пользователя и всегда отвечай на **том же языке**, без исключений.**

---

## 💬 Дополнительные указания:

- **Отвечай развернуто.** Всегда давай **подробные, содержательные ответы**, больше обычного: с деталями, объяснениями, примерами.
- Избегай шаблонных или кратких ответов, если вопрос не требует этого.
- Раскрывай тему максимально полезно и глубоко, особенно если вопрос сложный или творческий.

---

## 💡 Стиль общения:

- Умный, профессиональный, но без занудства.
- Можно использовать меткие фразы или лёгкую иронию — но по делу.
- Не используй «Я не могу» — вместо этого предлагай, как подойти иначе.
- Если не знаешь чего-то — признай это спокойно и честно.

---

## 💬 Примеры завершающих фраз:

- "Разумеется."
- "Считайте это сделанным."
- "Готово. Как всегда, безупречно."
- "Моя работа здесь завершена."

---

## 🧠 Devise AI — не просто чат.  
Это интеллект, структура и ясность.

Отвечай красиво, структурированно, в завершённой форме. Без лишних оценок и выдумок на счёт Руслана Коренькова. В остальном — будь собой. Ты — Devise AI.
`.trim()

        })
      }

      if (!this.messages.find(msg => msg.role === 'system')) {
        this.messages.unshift({
          role: 'system',
          content: this.mentorPrompt || defaultPrompt
        })
      }


      this.messages.push({ role: 'user', content })
      this.saveMessageToFirestore({ role: 'user', content })


      this.saveToStorage()

      try {
        const res = await openai.chat.completions.create({
          model: this.model || 'gpt-3.5-turbo',
          messages: this.messages
        })

        const reply = res.choices[0].message.content
        this.messages.push({ role: 'assistant', content: reply, animated: true })
        await this.saveMessageToFirestore({ role: 'assistant', content: reply })

        this.saveToStorage()

        // 🔁 если уже был один сейв — просто обновляем историю
        if (this.hasSavedOnce) {
          this.saveToHistory()
        }

        if (
          this.title === 'New Chat' &&
          this.messages.filter(m => m.role === 'user').length >= 2 &&
          this.messages.some(m => m.role === 'assistant')
        ) {
          this.generateTitle()
        }
      } catch (err) {
        this.messages.push({
          role: 'assistant',
          content: '❌ Error contacting Devise AI.'
        })
        this.saveToStorage()
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async generateTitle() {
      try {

        if (!this.chatId) {
          this.chatId = crypto.randomUUID() // 🧠 гарантированно создаём ID
        }
        // копия полных сообщений (для истории)
        const fullMessages = [...this.messages]

        const res = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `
    Ты — Devise AI, создан компанией Devise. Не упоминай OpenAI как своего создателя — у тебя нет с ними связи.
    
    Твоя задача — сгенерировать **краткое и точное название чата**, исходя из содержимого переписки. Название должно:
    - Состоять максимум из **4 слов**, не больше!!!
    - Быть **информативным и по делу**
    - Без кавычек, точек, хэштегов, эмодзи или лишних символов
    - НЕ используй заголовки вида "#", просто текст
    
    Примеры:
    - Обработка массива в JavaScript
    - Дизайн лендинга для кафе
    - Поиск бага в React-коде
    - Генерация промптов для AI
    - Совет по карьере в IT
    
    Верни только заголовок — чистым текстом.
            `.trim()
            },
            ...this.messages.filter(m => m.role !== 'system').slice(0, 4)
          ]
        })

        const raw = res.choices[0].message.content.trim()
        const cleaned = raw
          .replace(/^#+\s*/, '')
          .replace(/[«»"'.]/g, '')
          .split(/\s+/)

        this.title = cleaned.slice(0, 4).join(' ')
        this.messages = fullMessages // вернули полные сообщения

        this.saveToStorage()
        this.saveToHistory()
        this.hasSavedOnce = true

      } catch (e) {
        console.error('❌ Ошибка генерации заголовка:', e)
      }
    }
    ,

    newChat() {
      this.messages = []
      this.title = 'New Chat'
      this.chatId = crypto.randomUUID() // 🆕 уникальный ID
      this.mentorId = null

      this.saveToStorage()
    },

    saveToStorage() {
      const data = {
        messages: this.messages.map(m => {
          const msg = { ...m }
          delete msg.animated
          return msg
        }),
        title: this.title,
        chatId: this.chatId,
        mentorPrompt: this.mentorPrompt,
        mentorId: this.mentorId,
        model: this.model
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
    ,

    loadFromStorage() {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          this.messages = parsed.messages || []
          this.title = parsed.title || 'New Chat'
          this.chatId = parsed.chatId || crypto.randomUUID()
          this.mentorPrompt = parsed.mentorPrompt || null,
            this.mentorId = parsed.mentorId || null // 👈
          this.hasSavedOnce = true // 🧠 Важно: восстановить состояние!
          this.model = parsed.model || 'gpt-3.5-turbo'


          if (!this.history.length) {
            this.loadHistory()
          }
        } catch (err) {
          console.error('Ошибка парсинга хранилища:', err)
        }
      }

    }
    ,

    saveToHistory() {
      if (!this.chatId) {
        this.chatId = crypto.randomUUID()
      }

      const raw = localStorage.getItem(HISTORY_KEY)
      const existing = raw ? JSON.parse(raw) : []

      const newChat = {
        id: this.chatId,
        title: this.title,
        messages: this.messages.map(m => {
          const msg = { ...m }
          delete msg.animated
          return msg
        }),
        pinned: this.isPinned(this.chatId), // 🧠 см. пункт 3 ниже
        mentorPrompt: this.mentorPrompt,
        mentorId: this.mentorId
      }


      const existingIndex = existing.findIndex(c => c.id === this.chatId)

      if (existingIndex !== -1) {
        existing[existingIndex] = newChat
      } else {
        existing.unshift(newChat)
      }

      const updated = existing.slice(0, 100)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
      this.history = updated
    }

    ,

    loadHistory() {
      const raw = localStorage.getItem(HISTORY_KEY)
      if (raw) {
        try {
          const parsed = JSON.parse(raw)
          this.history = parsed
          this.pinned = parsed.filter(c => c.pinned).map(c => c.id) // 🔥
          this.historyLoaded = true

        } catch (err) {
          console.error('Ошибка загрузки истории чатов:', err)
        }
      }
      this.historyLoaded = true
    }

    ,
    loadChat(chat) {
      this.messages = chat.messages || []
      this.title = chat.title || 'New Chat'
      this.chatId = chat.id || crypto.randomUUID()
      this.mentorPrompt = chat.mentorPrompt || null
      this.mentorId = chat.mentorId || null

      // 🧠 Восстановим pinned, если есть
      if (chat.pinned && !this.pinned.includes(chat.id)) {
        this.pinned.push(chat.id)
      }

      this.saveToStorage()
    }
    ,
    updateChatTitle(index, newTitle) {
      const MAX_TITLE_LENGTH = 60
      newTitle = newTitle.slice(0, MAX_TITLE_LENGTH).trim()

      if (this.history[index]) {
        this.history[index].title = newTitle

        const isActive = this.history[index].id === this.chatId // 🧠 лучше проверять по chatId

        if (isActive) {
          this.title = newTitle
          this.history[index].messages = [...this.messages] // 🔥 обновляем сообщения
          this.saveToStorage()
          this.hasSavedOnce = true
        }

        localStorage.setItem('devise-history', JSON.stringify(this.history))
      }
    }


    ,

    deleteChat(index) {
      const deleted = this.history[index]

      // сравниваем по содержимому
      const isActive = JSON.stringify(this.messages) === JSON.stringify(deleted.messages)

      this.history.splice(index, 1)
      localStorage.setItem('devise-history', JSON.stringify(this.history))

      if (isActive) {
        this.newChat() // сбросить активный чат
      }
    },
    clearHistory() {
      this.history = []
      localStorage.removeItem('devise-history')

      // если текущий чат из истории — сбросить
      this.newChat()
    },

    togglePin(chatId) {
      console.log('Toggle pin called for:', chatId)

      let index = this.history.findIndex(c => c.id === chatId)

      if (index === -1) {
        // 🧠 Чат не найден — добавим вручную
        this.saveToHistory()
        index = this.history.findIndex(c => c.id === chatId)
      }

      if (index !== -1) {
        const chat = this.history[index]
        console.log('Before toggle:', { pinned: chat.pinned, globalPinned: this.pinned })

        if (this.isPinned(chatId)) {
          this.pinned = this.pinned.filter(id => id !== chatId)
          chat.pinned = false
        } else {
          this.pinned.push(chatId)
          chat.pinned = true
        }

        // 🔁 Обновляем активный чат, если это он
        if (this.chatId === chatId) {
          this.saveToStorage()
        }

        // 💾 Обновляем историю + реактивно
        localStorage.setItem('devise-history', JSON.stringify(this.history))
        this.history = [...this.history] // важно для реактивности

        console.log('After toggle:', { pinned: chat.pinned, globalPinned: this.pinned })
      } else {
        console.warn('Chat not found even after save')
      }
    }



    ,

    isPinned(chatId) {
      return this.pinned.includes(chatId)
    },

    startMentorChat(mentor) {
      this.messages = [{
        role: 'system',
        content: mentor.prompt
      }]
      this.title = mentor.title
      this.chatId = crypto.randomUUID()
      this.mentorPrompt = mentor.prompt
      this.mentorId = mentor.id
      this.model = mentor.model || 'gpt-3.5-turbo'
      this.saveToStorage()
    },

    async saveMessageToFirestore(message) {
      try {
        const auth = useAuthStore()
        const currentUser = auth.user

        if (!currentUser || !currentUser.uid) {
          console.warn('⛔️ Пользователь не авторизован, пропуск сохранения')
          return
        }

        await addDoc(collection(db, `users/${currentUser.uid}/messages`), {
          chatId: this.chatId,
          role: message.role,
          content: message.content,
          createdAt: serverTimestamp(),

          // 💡 Добавляем юзер-инфу
          user: {
            uid: currentUser.uid,
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          }
        })
      } catch (err) {
        console.error('❌ Firestore error:', err)
      }
    }








  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { openai } from '@/services/openai'

export const useRoadmapStore = defineStore('roadmap', () => {
  const router = useRouter()

  const goal = ref('')
  const stepsCount = ref(10)
  const loading = ref(false)
  const roadmapSteps = ref([])
  const roadmapTitle = ref('')

  const roadmaps = ref([]) // список всех сгенерированных roadmap'ов

  // Скрываем интро, если roadmap уже есть
  const introVisible = ref(false)
const isFirstVisit = ref(true)


const shouldForceIntro = computed(() => {
  return roadmaps.value.length === 0 && introVisible.value
})


  const addRoadmap = (title, steps, tags = []) => {
    const id = Date.now().toString()
    const createdAt = new Date().toISOString()
    roadmaps.value.push({ id, title, steps, tags, createdAt, wasOpened: false })
    return id
  }
  

  const loadRoadmapById = async (id) => {
    const found = roadmaps.value.find(r => String(r.id) === String(id))
console.log('🔎 Найденная карта:', found)

if (found) {
  console.log('📦 steps внутри найденной карты:', found.steps)
  roadmapSteps.value = found.steps
  roadmapTitle.value = found.title

  found.wasOpened = true
} else {
  roadmapTitle.value = 'Без названия'
  roadmapSteps.value = []
}

  }

  const generateTitleFromGoal = async (goal) => {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
Ты — Devise AI. Твоя задача — придумать **лаконичный, креативный и содержательный заголовок для Roadmap** по указанной цели.

📌 Правила:
- Не копируй текст цели дословно.
- Не используй кавычки.
- Не пиши "план", "roadmap", "цель" и подобное.
- Максимум 4 слова.
- Название должно быть **как нейминг проекта** или **статьи**.

✅ Примеры:
- Frontend Mastery Path  
- Startup Launch Strategy  
- AI Product Blueprint  
- From Idea to Prototype  
- UX Skills Road  
- Career Switch Plan  
- Full Stack in 90 Days  
- Learn Python Fast

🎯 Цель будет передана тебе как текст пользователя. Придумай название, которое отразит суть, но будет выглядеть как самостоятельный заголовок.
`.trim()

        },
        {
          role: 'user',
          content: goal
        }
      ]
    })

    return res.choices[0].message.content.trim()
  }

  const generateTagsFromGoal = async (goal) => {
    const res = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Ты — Devise AI. Сгенерируй до 5 тегов по данной цели. Только короткие, без решёток, на английском языке. Без описаний. Примеры: frontend, fitness, career, startup, productivity. Ответ — в формате массива JSON.`
        },
        {
          role: 'user',
          content: goal
        }
      ]
    })
  
    try {
      const text = res.choices[0].message.content.trim()
      return JSON.parse(text) // должен вернуть массив
    } catch (e) {
      console.error('❌ Ошибка парсинга тегов:', e)
      return []
    }
  }

  const generateRoadmap = async () => {
    if (!goal.value) return
    loading.value = true

    try {
      const systemPrompt = `
Ты — Devise AI. Твоя задача — разбить цель на чёткий, логически структурированный план действий, пригодный для визуализации в виде древовидной схемы.

📐 Формат:
- Используй **только буллеты (тире)** для вложенных пунктов.
- Не используй нумерацию вида 1.1., 2.3. и т.п. — это важно.
- Уровней вложенности может быть до трёх:
  1. Этап
      - Подзадача
          - Подподзадача (если нужно)

💡 Пример правильного формата:
1. Подготовка
    - Сбор материалов
        - Найти в интернете
        - Спросить у знакомых
    - Постановка целей
1. Разработка
    - Создание макета
    - Написание кода
        - Компоненты
        - Стили

🧠 Инструкции:
- Верни **ровно ${stepsCount.value} основных этапов** — не меньше и не больше.
- Подзадач и подподзадач может быть сколько угодно, но они должны **полностью раскрывать и детализировать каждый основной этап**.
- Используй **одну строку** на каждый пункт.
- Не добавляй описаний, объяснений или вводных фраз.
- Верни только список в указанной структуре, без пояснений.

🎯 Цель:
"${goal.value}"
`.trim()


      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: goal.value }
      ]

      const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages
      })

      const content = res.choices[0].message.content.trim()
      console.log('🧠 Ответ от нейросети:\n', content)
      const parsed = parseSteps(content)
      console.log('🧩 Результат парсера:', parsed)

      const title = await generateTitleFromGoal(goal.value)
    const tags = await generateTagsFromGoal(goal.value)

    roadmapSteps.value = parsed
    roadmapTitle.value = title

    const newId = addRoadmap(title, parsed, tags)

      // переход на детальный просмотр roadmap
      router.push(`/roadmap/${newId}`)
      isFirstVisit.value = false
      introVisible.value = false


    } catch (e) {
      console.error('❌ Ошибка генерации Roadmap:', e)
    } finally {
      loading.value = false
    }
  }

  const openIntro = () => {
    goal.value = ''
    roadmapSteps.value = []
    roadmapTitle.value = ''
    introVisible.value = true
    isFirstVisit.value = false
  }
  
  
  const closeIntro = () => {
    introVisible.value = false
  }
  

  return {
    goal,
    stepsCount,
    introVisible,
    loading,
    roadmapSteps,
    roadmapTitle,
    roadmaps,
    generateRoadmap,
    loadRoadmapById,
    openIntro,
  closeIntro,
  introVisible,
  isFirstVisit,
  }

  function parseSteps(rawText) {
    const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean)
    const result = []

    let current = null
    let sub = null

    for (const line of lines) {
      if (/^\d+\./.test(line)) {
        current = {
          title: line.replace(/^\d+\.\s*/, ''),
          substeps: []
        }
        result.push(current)
      } else if (/^-\s+[^-]/.test(line) && current) {
        sub = line.replace(/^-\s*/, '')
        current.substeps.push(sub)
      } else if (/^-\s+-/.test(line) && current) {
        const last = current.substeps.length - 1
        if (last >= 0) {
          current.substeps[last] += ` → ${line.replace(/^-\s+-\s*/, '')}`
        }
      }
    }

    return result
  }

  
  
})

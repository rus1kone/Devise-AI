<script setup>
import { ref, watch } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { useRoadmapStore } from '@/store/roadmapStore'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const showMask = ref(false)
const showBlocker = ref(false)
const maskRef = ref(null)

onMounted(() => {
  const currentId = String(route.params.id)
  const found = store.roadmaps.find(r => String(r.id) === currentId)

  if (found && !found.wasOpened) {
    showMask.value = true
    showBlocker.value = true

    // Помечаем как "уже открытый"
    found.wasOpened = true

    // Убираем блокер чуть раньше — например, через 6800мс
    setTimeout(() => {
      showBlocker.value = false
    }, 6800)
  }
})


function handleAnimationEnd() {
  console.log('🎉 Маска завершила анимацию (через @animationend)')
  showMask.value = false
  showBlocker.value = false
}




const store = useRoadmapStore()
const { setViewport } = useVueFlow()

const nodes = ref([])
const edges = ref([])

// Автообновление графа, когда roadmapSteps меняется
watch(
  () => store.roadmapSteps,
  (steps) => {
    console.log('🔥 ROADMAP STEPS:', steps)
    generateFlow(steps)

    setTimeout(() => {
      const container = document.querySelector('.flow-container')
      if (!container) return

      const containerWidth = container.clientWidth
      const contentCenterX = 150
      const zoom = 1
      const xOffset = (containerWidth / 2 - contentCenterX * zoom)

      setViewport({
        x: xOffset,
        y: 100,
        zoom
      })
    }, 100)
  },
  { immediate: true, deep: true }
)


function generateFlow(steps) {
  nodes.value = []
  edges.value = []

  let y = 0
  const stepX = 0
  const subStepXOffset = 250
  let nodeId = 1

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const stepId = String(nodeId++)

    // 🌑 Основной шаг
    nodes.value.push({
      id: stepId,
      type: i === 0 ? 'input' : undefined,
      position: { x: stepX, y },
      data: { label: `${i + 1}. ${step.title}` },
      style: {
        backgroundColor: '#262626',
        color: '#F3F4F6',
        border: '1px solid #2F2F2F',
        borderRadius: '14px',
        padding: '14px 20px',
        fontSize: '15px',
        fontWeight: 600,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.35)',
      }
    })

    // 🟫 Подзадачи
    if (step.substeps?.length) {
      for (let j = 0; j < step.substeps.length; j++) {
        const subId = String(nodeId++)
        const subY = y + (j + 1) * 60
        nodes.value.push({
          id: subId,
          position: {
            x: stepX + (j % 2 === 0 ? -subStepXOffset : subStepXOffset),
            y: subY
          },
          data: { label: step.substeps[j] },
          style: {
            backgroundColor: '#1E1E1E',
            color: '#D1D5DB',
            border: '1px solid #2A2A2A',
            borderRadius: '12px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
          }
        })

        // 🔗 Пунктирная тёмная связь: шаг → подзадача
        edges.value.push({
          id: `e${stepId}-${subId}`,
          source: stepId,
          target: subId,
          animated: true,
          style: {
            stroke: '#4B4B4B',
            strokeWidth: 2,
            strokeDasharray: '4 2'
          }
        })
      }
      y += (step.substeps.length + 1) * 60
    } else {
      y += 100
    }

    // 🔗 Сплошная тёмная связь: шаг → следующий шаг
    if (i < steps.length - 1) {
      const nextStepId = String(nodeId)
      edges.value.push({
        id: `e${stepId}-${nextStepId}`,
        source: stepId,
        target: nextStepId,
        animated: false,
        style: {
          stroke: '#3B3B3B',
          strokeWidth: 2.5
        }
      })
    }
  }
}



</script>



<template>
    <div class="flow-container">
      <div v-if="showMask" ref="maskRef" class="flow-mask show" @animationend="handleAnimationEnd" />
<div v-if="showBlocker" class="flow-blocker"></div>

      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :min-zoom="0.5"
        :max-zoom="1.5"
        class="bg-zinc-950"
      />
    </div>
  </template>

<style>
@import '@vue-flow/core/dist/style.css';

.flow-container {
  width: 100%;
    height: 100vh;
  overflow: hidden;
  position: relative;
}

.flow-mask {
  position: absolute;
  inset: 0;
  z-index: 999;
  top: 70px;

  background-color: rgba(33, 33, 33, 1);
  backdrop-filter: blur(60px);
  -webkit-backdrop-filter: blur(60px);

  overflow: hidden;
  opacity: 0;

  box-shadow: 0 -10px 15px rgba(33, 33, 33, 0.9);
}

.flow-mask.show {
  opacity: 1;
  animation: slide-mask 7.5s ease-out forwards;
  animation-fill-mode: forwards;
}




.flow-mask::before {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 500%;
  background: linear-gradient(0deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
  animation: shimmer-vertical 2.4s infinite linear;
}









@keyframes slide-mask {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  40% {
    transform: translateY(30%);
    opacity: 1;
  }
  60% {
    transform: translateY(60%);
    opacity: 1;
  }
  75% {
    transform: translateY(70%);
    opacity: 1;
  }
  100% {
    transform: translateY(150%);
    opacity: 0;
  }
}

@keyframes shimmer-vertical {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}



.flow-blocker {
  position: absolute;
  inset: 0;
  z-index: 1000; /* выше карты, но ниже маски */
  top: 70px;
  background: transparent; /* полностью невидимый */
  pointer-events: all;
}


</style>

<template>
    <div class="roadmap-detail-view">
      <RoadmapTopBar />
      <div class="roadmap-body">
        <RoadmapFlow />
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRoute } from 'vue-router'
  import { useRoadmapStore } from '@/store/roadmapStore'
  import { onMounted, computed } from 'vue'
  
  import RoadmapTopBar from '@/components/roadmap/RoadmapTopBar.vue'
 
  import RoadmapFlow from '@/components/roadmap/RoadmapFlow.vue'
  
  const route = useRoute()
  const store = useRoadmapStore()
  const roadmapId = route.params.id
  
  // Загрузка roadmap по ID (можно позже сделать из Firebase или массива)
  onMounted(async () => {
    console.log('🌍 Все карты:', store.roadmaps)
console.log('🔎 Ищу карту по id:', roadmapId)

  await store.loadRoadmapById(roadmapId)

  // ⚠️ форсим реактивность, чтобы сработал watch в RoadmapFlow
  setTimeout(() => {
    store.roadmapSteps = [...store.roadmapSteps] // создаём новый массив — триггерим watch
  }, 100)
})
  </script>
  
  <style scoped>
  .roadmap-detail-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
  }
  
  .roadmap-body {
    overflow-y: auto;
    height: 100%;
  }
  </style>
  
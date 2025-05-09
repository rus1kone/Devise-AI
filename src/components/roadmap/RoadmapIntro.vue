<template>
    <div
  v-if="shouldShowIntro"
  class="roadmap__intro"
  @click.self="handleOverlayClick"
>

      <div class="roadmap__modal">
        <div class="roadmap__header">
          <h2 class="roadmap__title">Create Your Roadmap</h2>
          <p class="roadmap__subtitle">Describe your goal and choose the level of detail</p>
        </div>
  
        <!-- Dropdown -->
       <div class="roadmap__content">
        <div class="roadmap__dropdown">
          <button class="roadmap__dropdown-button" @click="dropdownOpen = !dropdownOpen">
            <span>{{ selectedStepsLabel }}</span>
            <svg class="roadmap__dropdown-icon" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
  
          <div v-if="dropdownOpen" class="roadmap__dropdown-options">
            <div
              v-for="option in stepOptions"
              :key="option"
              @click="selectSteps(option)"
              class="roadmap__dropdown-option"
            >
              {{ option }} steps
            </div>
          </div>
        </div>
  
        <!-- Input -->
        <textarea
          v-model="store.goal"
          class="roadmap__textarea"
          rows="3"
          placeholder="e.g. Prepare a 3-month study plan for university exams"
        ></textarea>
  
        <!-- Button -->
        <button
  class="roadmap__button"
  :disabled="!store.goal || store.loading"
  @click="handleSubmit"
>
  <span v-if="!store.loading">Build Roadmap</span>
  <span v-else class="loading-content">
    <Loader class="spin-icon" size="18" />
    Generating...
  </span>
</button>

       </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useRoadmapStore } from '@/store/roadmapStore'
  import { storeToRefs } from 'pinia'
  import { Loader } from 'lucide-vue-next'

  
  const dropdownOpen = ref(false)
  const stepOptions = [5, 10, 15, 20, 30]
  const selectedSteps = ref(10)
  const goal = ref('')
  const store = useRoadmapStore()
  const { roadmaps } = storeToRefs(store)
  
  const selectedStepsLabel = computed(() => `${selectedSteps.value} steps`)
  const isForcedIntro = computed(() => roadmaps.value.length === 0)

const shouldShowIntro = computed(() => {
  return store.isFirstVisit && roadmaps.value.length === 0 || store.introVisible
})


  
  function selectSteps(count) {
    store.stepsCount = count
    selectedSteps.value = count
    dropdownOpen.value = false
  }
  
  
function handleSubmit() {
  store.generateRoadmap()
}

function handleOverlayClick() {
  const isEmpty = roadmaps.value.length === 0
  if (!store.isFirstVisit && !isEmpty) {
    store.closeIntro()
  }
}

  </script>
  
  <style scoped>
  .roadmap__intro {
    position: absolute;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
  
  .roadmap__modal {
    width: 100%;
    max-width: 32rem;
    background: #1f1f1f;
    border-radius: 14px;
    /* padding: 24px 24px; */
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: #f0f0f0;
  }
  
  .roadmap__header {
    text-align: center;
    /* border-bottom: 1px solid #474747; */
    padding: 24px 24px;
  }
  

  /*  */
  .roadmap__title {
    font-size: 20px;
  font-weight: 600;
  color: #f0f0f0;
  }
  
  .roadmap__subtitle {
    font-size: 14px;
  color: #b0b0b0;
  padding: 0 24px;
  }

  .roadmap__content{
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    padding-bottom: 24px;
    gap: 1.5rem;
  }
  
  .roadmap__dropdown {
    position: relative;
  }
  
  .roadmap__dropdown-button {
    width: 100%;
    text-align: left;
    padding: 0.75rem 1rem;
    background: #2a2a2a;
    color: #f4f4f5;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: none;
    cursor: pointer;
  }
  
  .roadmap__dropdown-icon {
    width: 1rem;
    height: 1rem;
    opacity: 0.5;
  }
  
  .roadmap__dropdown-options {
    position: absolute;
    top: 100%;
    margin-top: 0.5rem;
    width: 100%;
    background: #2a2a2a;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }
  
  .roadmap__dropdown-option {
    padding: 0.5rem 1rem;
    font-size: 14px;
    color: #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .roadmap__dropdown-option:hover {
    background-color: #3a3a3a;
  }
  
  .roadmap__textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    background: #2a2a2a;
    color: #f4f4f5;
    resize: none;
    outline: none;
  }
  
  .roadmap__textarea::placeholder {
    color: #777;
  }
  
  .roadmap__button {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    background-color: #fff;
    color: #000;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: all 0.1s ease 0s;
  }
  
  .roadmap__button:hover:not(:disabled) {
    opacity: 0.7;
  }
  
  .roadmap__button:disabled {
    background-color: #676767;
  color: #2f2f2f;
  cursor: default;
  }

  .loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spin-icon {
  animation: spin 1s linear infinite;
  color: #000;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

  </style>
  
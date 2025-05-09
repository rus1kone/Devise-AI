<template>
    <div class="thinking-dots">
      <span class="dot" :class="{ visible: step >= 1 }">.</span>
      <span class="dot" :class="{ visible: step >= 2 }">.</span>
      <span class="dot" :class="{ visible: step >= 3 }">.</span>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  
  const step = ref(0)
  let interval = null
  
  onMounted(() => {
    interval = setInterval(() => {
      step.value = (step.value % 3) + 1
    }, 400)
  })
  
  onBeforeUnmount(() => {
    clearInterval(interval)
  })
  </script>
  
  <style scoped>
  .thinking-dots {
    font-size: 32px;
    color: #b4b4b4;
    display: flex;
    gap: 4px;
    height: 28px;
    line-height: 1;
    font-weight: 600;
  }
  
  .dot {
    opacity: 0;
    transition: opacity 0.25s ease;
  }
  
  .dot.visible {
    opacity: 1;
  }
  </style>
  
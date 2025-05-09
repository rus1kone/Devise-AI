<script setup>
import { ref, onMounted } from 'vue'
import ChatTopBar from '@/components/chat/ChatTopBar.vue'
import ChatMessages from '@/components/chat/ChatMessages.vue'
import MessageInput from '@/components/chat/MessageInput.vue'
import { useChatStore } from '@/store/chatStore'

const chat = useChatStore()

const scrollContainer = ref(null)

const props = defineProps({
  scrollContainer: Object
})


onMounted(() => {
  chat.loadFromStorage()
})
</script>

<template>
  <div class="chat-view">
    <ChatTopBar />
    <div class="chat-body" ref="scrollContainer">
      <ChatMessages :scroll-container="scrollContainer" />
    </div>
    <MessageInput />
  </div>
</template>


<style scoped>
.chat-view {
  display: flex;
  flex-direction: column;
  height: 100vh; /* обязательно, чтобы sticky работал */
  width: 100%;
  overflow: hidden;
  height: 100%;
}

.chat-body {
  margin-top: 35px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
</style>

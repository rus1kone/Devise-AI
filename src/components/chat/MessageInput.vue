<template>
  <div class="message">
    <form class="message-input" @submit.prevent="handleSend">
      <textarea v-model="input" class="message-input__field" placeholder="Ask anything..." ref="inputRef"
        @input="autoResize" @keydown.enter.exact.prevent="handleSend" @keydown.shift.enter.stop" rows="1"></textarea>



      <button class="message-input__send" :disabled="!input.trim() || chat.loading || chat.isTyping">
        <SendHorizontal size="18" />
      </button>


    </form>
    <p class="message__text">
      Devise AI might be wrong — trust, but verify.
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

import { SendHorizontal, Square } from 'lucide-vue-next'
import { useChatStore } from '@/store/chatStore'

const input = ref('')
const inputRef = ref(null)

const chat = useChatStore()

onMounted(() => {
  inputRef.value?.focus()
})

const autoResize = () => {
  const el = inputRef.value
  if (!el) return

  el.style.height = 'auto' // сброс
  el.style.height = el.scrollHeight + 'px' // подгон
}

function handleSend() {
  if (!input.value.trim()) return
  chat.sendMessage(input.value)
  input.value = ''
  nextTick(() => autoResize()) // сбросим высоту

}



onMounted(() => {
  inputRef.value?.focus()
  autoResize()
})

</script>


<style scoped>
.message {
  width: 100%;
  border-top: 1px solid #212121;
  position: sticky;
  background-color: #212121;
  bottom: 0;
  z-index: 1000;
  left: 0;
}

.message-input {
  display: flex;
  padding: 16px;
  background-color: #303030;
  max-width: 800px;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  border-radius: 25px;
}

.message-input__field {
  flex: 1;
  resize: none;
  overflow: hidden;
  color: #ececec;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 15px;
  border: none;
  outline: none;
  background: transparent;
  line-height: 1.5;
  font-family: inherit;
  max-height: 160px;
  /* ограничим */
  overflow-y: scroll;

}

.message-input__field::-webkit-scrollbar {
  width: 5px;
}

.message-input__field::-webkit-scrollbar-track {
  background: transparent;
}

.message-input__field::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.message-input__field:hover::-webkit-scrollbar-thumb {
  background-color: #929292;
}



.message-input__send {
  background: none;
  border: none;
  color: #000;
  margin-left: 12px;
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  padding-left: 1px;
  transition: all .1s ease 0s;
}

.message-input__send:hover {
  opacity: 0.7;
}

.message-input__send:disabled {
  background-color: #676767;
  color: #2f2f2f;
  cursor: default;
}

.message-input__send:disabled:hover {
  opacity: 1;
}

.message__text {
  text-align: center;
  font-size: 12px;
  color: #b4b4b4;
  padding: 8px 0;
}
</style>
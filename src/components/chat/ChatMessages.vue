<template>
  <div class="chat">
    <div class="chat-messages">

      <template v-for="(message, index) in messages" :key="index">
        <div v-if="message.role !== 'system'" :class="['chat-message', `chat-message--${message.role}`]">
          <MarkdownMessage v-if="message.role === 'assistant'" :key="index + '-' + message.content.length"
            :content="message.content" :animated="message.animated" :scroll-container="scrollContainer" @done="message.animated = false" />



          <p v-else class="chat-message__text">
            {{ message.content }}
          </p>
        </div>
      </template>

      <!-- Thinking dots пока Devise AI думает -->
      <div v-if="chat.loading" class="chat-message chat-message--assistant">
        <ThinkingDots />
      </div>
      
      <div ref="bottomRef" />
      <button
  v-if="showScrollToBottom"
  class="scroll-to-bottom"
  @click="scrollToBottom"
>
<ArrowDown size="20"/>
</button>


    </div>


<!-- 🎯 Focus Master -->
<div v-if="isEmptyChat && chat.mentorId === 'focus'" class="chat-placeholder">
  <h2 class="chat-placeholder__title">🎯 Stay sharp with Focus Master</h2>
  <p class="chat-placeholder__desc">
    Distractions everywhere? Let’s build a razor-sharp workflow
    <span>Whether you're working, learning, or creating — I'm here to bring clarity and momentum</span>
  </p>
  <ul class="chat-placeholder__examples">
    <li @click="sendExample('How do I stop multitasking and work with focus?')">
      <Target size="16" /> How do I stop multitasking and work with focus?
    </li>
    <li @click="sendExample('Give me a 25-minute deep focus routine')">
      <Clock size="16" /> Give me a 25-minute deep focus routine
    </li>
    <li @click="sendExample('What to do when I feel overwhelmed with tasks?')">
      <AlertCircle size="16" /> What to do when I feel overwhelmed with tasks?
    </li>
  </ul>
</div>

<!-- 💻 Code Sensei -->
<div v-else-if="isEmptyChat && chat.mentorId === 'code'" class="chat-placeholder">

  <h2 class="chat-placeholder__title">💻 Code with clarity, young dev</h2>
  <p class="chat-placeholder__desc">
    Whether you're debugging, learning a new stack, or refactoring — Code Sensei helps you write code that feels like poetry
    <span>Ask anything from JS quirks to architectural patterns — and receive wisdom in return</span>
  </p>
  <ul class="chat-placeholder__examples">
    <li @click="sendExample('Explain closures in JavaScript with a real example')">
      <Code size="16" /> Explain closures in JavaScript with a real example
    </li>
    <li @click="sendExample('How to structure a large Vue 3 app?')">
      <Boxes size="16" /> How to structure a large Vue 3 app?
    </li>
    <li @click="sendExample('Write a clean debounce function in JS')">
      <Terminal size="16" /> Write a clean debounce function in JS
    </li>
  </ul>
</div>

<!-- 🧠 Mind Architect -->
<div v-else-if="isEmptyChat && chat.mentorId === 'mind'" class="chat-placeholder">
  <h2 class="chat-placeholder__title">🧠 Build clarity with Mind Architect</h2>
  <p class="chat-placeholder__desc">
    Feel stuck or scattered? Let’s untangle your thinking with mental systems that actually work
    <span>Step by step — we'll organize your thoughts and actions into clarity and structure</span>
  </p>
  <ul class="chat-placeholder__examples">
    <li @click="sendExample('How do I stop overthinking and act with clarity?')">
      <AlertCircle size="16" /> How do I stop overthinking and act with clarity?
    </li>
    <li @click="sendExample('Give me a simple mental system to stay focused daily')">
      <Target size="16" /> Give me a simple mental system to stay focused daily
    </li>
    <li @click="sendExample('How to turn chaotic habits into consistent routines?')">
      <Clock size="16" /> How to turn chaotic habits into consistent routines?
    </li>
  </ul>
</div>

<!-- 🧙‍♂️ Study Wizard -->
<div v-else-if="isEmptyChat && chat.mentorId === 'study'" class="chat-placeholder">
  <h2 class="chat-placeholder__title">🧙‍♂️ Learn smarter with Study Wizard</h2>
  <p class="chat-placeholder__desc">
    Ready to boost your learning? Let’s turn scattered notes into lasting knowledge
    <span>With techniques like active recall and spaced repetition — you’ll remember more with less stress</span>
  </p>
  <ul class="chat-placeholder__examples">
    <li @click="sendExample('How can I use spaced repetition to study efficiently?')">
      <Clock size="16" /> How can I use spaced repetition to study efficiently?
    </li>
    <li @click="sendExample('Give me a study routine using active recall')">
      <NotebookPen size="16" /> Give me a study routine using active recall
    </li>
    <li @click="sendExample('How do I take smart notes that I’ll actually use?')">
      <Lightbulb size="16" /> How do I take smart notes that I’ll actually use?
    </li>
  </ul>
</div>


<!-- 🚀 Growth Hacker -->
<div v-else-if="isEmptyChat && chat.mentorId === 'growth'" class="chat-placeholder">
  <h2 class="chat-placeholder__title">🚀 Let's grow something viral</h2>
  <p class="chat-placeholder__desc">
    Ready to turn heads and get traction? Growth Hacker is your strategist for bold, practical moves
    <span>From landing pages to viral loops — let's hack growth with precision and guts</span>
  </p>
  <ul class="chat-placeholder__examples">
    <li @click="sendExample('How can I grow my portfolio site traffic quickly?')">
      <TrendingUp size="16" /> How can I grow my portfolio site traffic quickly?
    </li>
    <li @click="sendExample('Give me 3 viral hook ideas for a design tool')">
      <Lightbulb size="16" /> Give me 3 viral hook ideas for a design tool
    </li>
    <li @click="sendExample('Explain how to build a conversion-focused landing page')">
      <LayoutDashboard size="16" /> Explain how to build a conversion-focused landing page
    </li>
  </ul>
</div>

<!-- 🎨 Design Mentor -->
<div v-else-if="isEmptyChat && chat.mentorId === 'design'" class="chat-placeholder">
  <h2 class="chat-placeholder__title">🎨 Design with taste and clarity</h2>
  <p class="chat-placeholder__desc">
    Design Mentor helps you see sharper, think cleaner, and create interfaces that feel just right.
    <span>Ask anything about layout, style, UX, or storytelling — let’s elevate your visuals</span>
  </p>
  <ul class="chat-placeholder__examples">
    <li @click="sendExample('How do I create a clean hero section for a landing page?')">
      <Palette size="16" /> How do I create a clean hero section for a landing page?
    </li>
    <li @click="sendExample('Give me UI tips for a minimal portfolio site')">
      <Sparkles size="16" /> Give me UI tips for a minimal portfolio site
    </li>
    <li @click="sendExample('What’s the best font pair for a modern app?')">
      <Type size="16" /> What’s the best font pair for a modern app?
    </li>
  </ul>
</div>




<!-- 🌐 Default Devise AI -->
<div v-else-if="isEmptyChat" class="chat-placeholder">
  <h2 class="chat-placeholder__title">Welcome to Devise AI</h2>
  <p class="chat-placeholder__desc">
    Devise AI is your intelligent assistant, ready to help you brainstorm ideas, write content, design interfaces, or solve complex coding challenges
    <span>Whether you're building a product, learning something new, or just exploring, Devise is here to make the process faster, smoother, and a little more fun</span>
  </p>
  <ul class="chat-placeholder__examples">
    <li @click="sendExample('Help me come up with a unique brand name for a travel app')">
      <Lightbulb size="16" /> Help me come up with a unique brand name for a travel app
    </li>
    <li @click="sendExample('Design a clean UI layout for a note-taking tool, give me html css js example')">
      <NotebookPen size="16" /> Design a clean UI layout for a note-taking tool
    </li>
    <li @click="sendExample('What’s a good weekly workout plan for beginners?')">
      <HeartPulse size="16" /> What’s a good weekly workout plan for beginners?
    </li>
  </ul>
</div>









  </div>
</template>

<script setup>
import { useChatStore } from '@/store/chatStore'
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { NotebookPen, Lightbulb, HeartPulse, Target, Clock, AlertCircle, ArrowDown, Code, Boxes, Terminal, TrendingUp, LayoutDashboard, Palette, Sparkles, Type} from 'lucide-vue-next'
import ThinkingDots from '@/components/chat/ThinkingDots.vue'

import MarkdownMessage from '@/components/common/MarkdownMessage.vue'

const chat = useChatStore()
const messages = computed(() => chat.messages)
const isFocusChat = computed(() => chat.mentorId === 'focus')
const isCodeChat = computed(() => chat.mentorId === 'code')
const showScrollToBottom = ref(false)

const isEmptyChat = computed(() =>
  chat.messages.every(m => m.role === 'system') && !chat.loading
)

function scrollToBottom() {
  bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
}




const bottomRef = ref(null)

// script setup
const props = defineProps({
  scrollContainer: { type: Object, required: true }
})




watch(
  () => chat.messages.length,
  () => {
    nextTick(() => {
      bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
    })
  }
)

function sendExample(text) {
  chat.sendMessage(text)
}


onMounted(() => {
  nextTick(() => {
    bottomRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
})

onMounted(() => {
  nextTick(() => {
    const container = props.scrollContainer
    if (!container) return

    const handler = () => {
      const threshold = 100
      const scrolledToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < threshold
      showScrollToBottom.value = !scrolledToBottom
    }

    container.addEventListener('scroll', handler)

    onUnmounted(() => {
      container.removeEventListener('scroll', handler)
    })
  })
})

</script>


<style scoped>
.chat {
  width: 100%;
  margin-top: 105px;

  height: 100%;
  min-height: 100vh;
  padding-top: 190px;

}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 34px;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding-top: 0;
  min-height: 100%;
  /* padding-bottom: 0; */
}

.chat-message {
  max-width: 100%;
  padding: 12px 18px;
  border-radius: 10px;
  line-height: 24px;
  /* font-size: 15px;
    line-height: 1.5;
    font-weight: 400; */
}

.chat-message--user {
  align-self: flex-end;
  color: #ececec;
  font-size: 16px;
  background-color: #303030;
  border-radius: 25px;
  max-width: 60%;
  word-wrap: break-word;
  word-break: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;

}

.chat-message--assistant {
  align-self: flex-start;
  color: #ececec;
  /* font-size: 16px; */
  max-width: 100%;
  overflow-x: scroll;
  overflow: visible;
}


.chat-placeholder {
  color: #a5a5a5;
  position: absolute;
  top: 48%;
  transform: translate(-50%, -52%);
  left: 50%;

  font-family: 'Inter', sans-serif;
  max-width: 600px;

}

.chat-placeholder__title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 15px;
  color: #fff;
}

.chat-placeholder__desc {
  font-size: 16px;
  margin-bottom: 30px;
  color: #b4b4b4;
}

.chat-placeholder__desc span{
  display: block;
  margin-top: 10px;
}

.chat-placeholder__examples {
  
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: #ececec;
}

.chat-placeholder__examples li{
  width: 100%;
  background-color: #303030;
  color: #ececec;
  padding: 12px 18px;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  column-gap: 10px;
  transition: all 0.2s ease-in-out;
}

.chat-placeholder__examples li:hover{
  box-shadow: 0 0 0 1px #303030;
}

.scroll-to-bottom {
  position: absolute;
  right: 50%;
  transform: translateX(50%);
  bottom: 115px;
  background: #212121;
  color: #fff;
  font-size: 14px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  border: 1px solid #ffffff1a;
  transition: all 0.2s ease;
}

/* .scroll-to-bottom:hover {
  background: #444;
} */

</style>
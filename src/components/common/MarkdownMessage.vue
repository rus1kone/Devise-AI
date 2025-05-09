<template>
  <div class="markdown-message" v-html="compiledMarkdown" />
</template>

<script setup>
import MarkdownIt from 'markdown-it'
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/store/chatStore'

import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'







const md = new MarkdownIt({
  breaks: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (_) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})



const chat = useChatStore()

const emit = defineEmits(['done'])

const props = defineProps({
  content: { type: String, required: true },
  animated: { type: Boolean, default: false },
  scrollContainer: { type: Object, required: true }
})



// const md = new MarkdownIt({ breaks: true, linkify: true })

const visibleText = ref('')
let index = 0
let animationStopped = false

const scrollToBottom = () => {
  if (props.scrollContainer && !animationStopped) {
    requestAnimationFrame(() => {
      props.scrollContainer.scrollTop = props.scrollContainer.scrollHeight
    })
  }
}


const type = () => {
  if (index < props.content.length) {
    visibleText.value += props.content[index]
    index++

    scrollToBottom()



    const delay = Math.random() * 6 + 3
    setTimeout(type, delay)
  } else {
    emit('done')
    chat.isTyping = false

  }
}

onMounted(() => {
  if (props.animated) {
    visibleText.value = ''
    index = 0
    chat.isTyping = true // 🧠 Запуск анимации
    type()
  } else {
    visibleText.value = props.content
    chat.isTyping = false // на всякий
  }

  const el = document.querySelector('.chat-messages')
  if (el) {
    el.addEventListener('wheel', () => {
      animationStopped = true
    }, { passive: true })
  }
})


const compiledMarkdown = computed(() => md.render(visibleText.value))

watch(compiledMarkdown, () => {
  nextTick(() => {
    addCopyButtons()
  })
})

function addCopyButtons() {
  const blocks = document.querySelectorAll('.markdown-message pre')

  blocks.forEach(pre => {
    if (pre.parentElement?.classList.contains('code-block-wrapper')) return

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'
    wrapper.style.position = 'relative'

    // создаём обёртку для tooltip
    const tooltipWrapper = document.createElement('div')
    tooltipWrapper.className = 'tooltip-wrapper'
    tooltipWrapper.style.position = 'absolute'
    tooltipWrapper.style.top = '10px'
    tooltipWrapper.style.right = '10px'
    tooltipWrapper.style.display = 'inline-block'

    const button = document.createElement('button')
    button.className = 'copy-btn'
    button.style.padding = '4px'
    button.style.border = 'none'
    button.style.color = '#fff'
    button.style.cursor = 'pointer'
    button.style.borderRadius = '6px'
    button.style.opacity = '0.7'
    button.style.transition = 'opacity 0.3s'

    // SVG иконка Copy
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy-icon lucide-copy">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
      </svg>
    `

    const tooltip = document.createElement('span')
    tooltip.className = 'tooltip-text'
    tooltip.textContent = 'Copy code'
    tooltip.style.position = 'absolute'
    tooltip.style.top = 'calc(100% + 6px)'
    tooltip.style.padding = '5px 12px'
    tooltip.style.background = '#0d0d0d'
    tooltip.style.color = '#ececec'
    tooltip.style.borderRadius = '4px'
    tooltip.style.fontSize = '14px'
    tooltip.style.whiteSpace = 'nowrap'
    tooltip.style.opacity = '0'
    tooltip.style.transition = 'opacity 0.1s'
    tooltip.style.pointerEvents = 'none'
    tooltip.style.border = '1px solid #303030'

    tooltip.style.left = '50%'
tooltip.style.transform = 'translateX(-50%)'


    tooltipWrapper.addEventListener('mouseenter', () => {
      button.style.opacity = '1'
      tooltip.style.opacity = '1'
    })
    tooltipWrapper.addEventListener('mouseleave', () => {
      button.style.opacity = '0.7'
      tooltip.style.opacity = '0'
    })

    button.addEventListener('click', () => {
      const code = pre.querySelector('code')?.innerText
      if (!code) return

      navigator.clipboard.writeText(code).then(() => {
        tooltip.textContent = 'Copied!'

        // чекмарка
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-check-icon lucide-check">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
        `

        setTimeout(() => {
          tooltip.textContent = 'Copy code'
          button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-copy-icon lucide-copy">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
          `
        }, 3200)
      })
    })

    tooltipWrapper.appendChild(button)
    tooltipWrapper.appendChild(tooltip)

    const parent = pre.parentElement
    if (parent) {
      wrapper.appendChild(tooltipWrapper)
      wrapper.appendChild(pre.cloneNode(true))
      parent.replaceChild(wrapper, pre)
    }
  })
}

</script>



<style>
.markdown-message {
  font-size: 16px;
  word-wrap: break-word;
  line-height: 1.7;
}

/* Все твои стили ниже */

.markdown-message h1,
.markdown-message h2,
.markdown-message h3 {
  font-weight: 600;
  margin: 1rem 0 0.5rem;
  font-size: 20px;
  color: #ffffff;
}

.markdown-message p {
  margin: 0.5rem 0;
}

.markdown-message ul {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
  list-style-type: disc;
}

.markdown-message ol {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
  list-style-type: decimal;
}

.markdown-message li {
  margin-bottom: 10px;
  margin-top: 10px;
}

.markdown-message code {
  background: #424242;
  font-size: 14px;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  color: #ececec;
}

.markdown-message code.language-html,
.markdown-message code.language-css,
.markdown-message code.language-js,
.markdown-message code.language-javascript,
.markdown-message code.language-typescript,
.markdown-message code.language-jsx,
.markdown-message code.language-vue {
  background: transparent !important;
  color: #fff;
}

.hljs code {
  background: transparent !important;
}


.markdown-message pre {
  background: #171717;
  padding: 10px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 14px;
  color: #fff;
  margin: 1rem 0;
  border: 1px solid #303030;
}

.markdown-message blockquote {
  border-left: 1px solid #555;
  padding-left: 1rem;
  color: #aaa;
  font-style: italic;
  margin: 0.5rem 0;
}

.markdown-message hr {
  all: unset;
  border: none;
  height: 1px;
  background-color: #444;
  margin: 1.5rem 0;
}


</style>

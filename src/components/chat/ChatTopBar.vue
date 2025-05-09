<template>
  <div class="topbar" :class="{ 'topbar--expanded': ui.sidebarHidden }">

    <h2 v-if="auth.user" class="topbar__title">
      {{ animatedTitle }}
      <component v-if="mentorIconComponent" :is="mentorIconComponent" size="22"
        style="margin-right: 8px; vertical-align: -4px;" />

    </h2>

    <div v-else class="topbar__title-wrapper">
      <h2 class="topbar__title topbar__title--no-user">
        {{ animatedTitle }}
        <component v-if="mentorIconComponent" :is="mentorIconComponent" size="22"
          style="margin-right: 8px; vertical-align: -4px;" />

      </h2>
    </div>


    <div class="topbar__actions">
      <div class="topbar__user">
        <template v-if="!auth.user">
          <button class="login" @click="auth.login">Log in</button>
          <button class="register" @click="auth.login">Register</button>
        </template>
      </div>


      <div v-if="auth.user" class="tooltip-wrapper" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
        <button ref="newChatBtnRef" @click="handleClick" class="topbar__icon-btn">
          <BadgePlus size="27" />
        </button>
        <span v-if="showTooltip" class="tooltip-text">New chat</span>
      </div>

      <div v-if="auth.user" class="tooltip-wrapper" @mouseenter="showPinTooltip = true"
        @mouseleave="showPinTooltip = false">
        <button class="topbar__icon-btn" @click="handlePinClick">
          <component :is="chat.isPinned(chat.chatId) ? PinOff : Pin" :size="27"
            :class="{ active: chat.isPinned(chat.chatId) }" />
        </button>
        <span v-if="showPinTooltip" class="tooltip-text">
          {{ chat.isPinned(chat.chatId) ? 'Unpin chat' : 'Pin chat' }}
        </span>
      </div>

      <div v-if="auth.user" class="tooltip-wrapper" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
        <button v-if="auth.user" class="topbar__icon-btn" @click="showSettingsModal = true">
          <Settings size="27" />
        </button>
        <span v-if="showTooltip" class="tooltip-text">Settings</span>
      </div>




      <div v-if="auth.user" class="topbar__user-wrapper relative">
        <div class="topbar__user-logo" @click.stop="toggleUserMenu">
          <img :src="user?.photoURL" :alt="user?.displayName || 'Avatar'"
            class="w-full h-full object-cover rounded-full cursor-pointer" />
        </div>

        <!-- Меню под аватаркой -->
        <div v-if="showUserMenu" ref="userMenuRef" class="user-menu">
          <button class="user-menu__item" @click="$router.push('/profile')">
            <CircleUser size="19" style="margin-right: 10px;" />
            Profile
          </button>

          <button class="user-menu__item" @click="showSettingsModal = true">
            <Settings size="19" style="margin-right: 10px;" />
            Global settings
          </button>

          <div class="separator"></div>

          <button class="user-menu__item" @click="handleLogout">
            <LogOut size="19" style="margin-right: 10px;" />
            Logout
          </button>
        </div>

      </div>

    </div>
  </div>


  <Teleport to="body">
    <div v-if="showSettingsModal" class="modal-backdrop" @click.self="closeSettings">
      <div class="modal">
        <div class="modal-header">
          <h3>Chat Settings</h3>
          <button class="close-icon" @click="closeSettings">
            <X size="23" />
          </button>
        </div>

        <!-- Custom Dropdown: Model -->
        <div class="setting-block">
          <label>
            <Cpu size="18" style="margin-right: 6px; vertical-align: middle;" />
            Model
          </label>

          <div class="dropdown" @click="toggleModel">
            <div class="dropdown-selected">
              {{ getModelLabel(selectedModel) }}
              <ChevronDown size="18" class="dropdown-icon" />
            </div>

            <ul v-if="modelOpen" class="dropdown-list">
              <li class="dropdown-option" :class="{ disabled: false }" @click.stop="selectModel('gpt-3.5-turbo')">
                DAI-Beta (default)
              </li>
              <li class="dropdown-option disabled">DAI-1.0 (Soon)</li>
              <li class="dropdown-option disabled">DAI-1.1 (Soon)</li>
            </ul>
          </div>
        </div>


        <!-- Custom Dropdown: Response format -->
        <div class="setting-block">
          <label>
            <TextCursorInput size="18" style="margin-right: 6px; vertical-align: middle;" />
            Response format
          </label>

          <div class="dropdown" @click="toggleFormat">
            <div class="dropdown-selected">
              {{ getFormatLabel(responseFormat) }}
              <ChevronDown size="18" class="dropdown-icon" />
            </div>

            <ul v-if="formatOpen" class="dropdown-list">
              <li class="dropdown-option" @click.stop="selectFormat('short')">Short</li>
              <li class="dropdown-option" @click.stop="selectFormat('default')">Default</li>
              <li class="dropdown-option" @click.stop="selectFormat('detailed')">Detailed</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </Teleport>


</template>

<script setup>
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { BadgePlus, Settings, Pin, PinOff, X, Cpu, LogOut, CircleUser, TextCursorInput, ChevronDown } from 'lucide-vue-next'
import { Brain, Code, Atom, GraduationCap, TrendingUp, Palette } from 'lucide-vue-next'

const mentorIcons = {
  focus: Brain,
  code: Code,
  mind: Atom,
  study: GraduationCap,
  growth: TrendingUp,
  design: Palette
}

const mentorIconComponent = computed(() => {
  return chat.mentorId ? mentorIcons[chat.mentorId] : null
})


const chat = useChatStore()
const ui = useUIStore()
const auth = useAuthStore()
const showSettingsModal = ref(false)
const modelOpen = ref(false)
const formatOpen = ref(false)
const selectedModel = ref('gpt-3.5-turbo')
const responseFormat = ref('default')
const newChatBtnRef = ref(null)
const showTooltip = ref(true)
const showPinTooltip = ref(true)
const user = computed(() => auth.user)
const showUserMenu = ref(false)
const userMenuRef = ref(null)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleClickOutside = (e) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handlePinClick() {
  chat.togglePin(chat.chatId)

  // 🔥 Спрятать тултип при клике
  showPinTooltip.value = false

  // ⏱ Показать снова при следующем наведении
  setTimeout(() => {
    showPinTooltip.value = true
  }, 200)
}


function handleClick() {
  chat.newChat()

  // 🔥 Моментально скрываем tooltip
  showTooltip.value = false

  // ⏱ Показываем его снова после короткой паузы (при следующем ховере)
  setTimeout(() => {
    showTooltip.value = true
  }, 20000)
}

function handleLogout() {
  chat.newChat()
  auth.logout()
}


function toggleModel() {
  modelOpen.value = !modelOpen.value
  if (modelOpen.value) formatOpen.value = false
}
function selectModel(model) {
  selectedModel.value = model
  modelOpen.value = false
}

function getModelLabel(value) {
  if (value === 'gpt-3.5-turbo') return 'DAI-Beta (default)'
  if (value === 'gpt-4') return 'DAI-1.0'
  return value
}

function toggleFormat() {
  formatOpen.value = !formatOpen.value
  if (formatOpen.value) modelOpen.value = false
}

function selectFormat(format) {
  responseFormat.value = format
  formatOpen.value = false
}

function getFormatLabel(value) {
  if (value === 'short') return 'Short'
  if (value === 'default') return 'Default'
  if (value === 'detailed') return 'Detailed'
  return value
}



const animatedTitle = ref('')


let typingInterval = null

watch(
  () => chat.title,
  (newTitle) => {
    clearInterval(typingInterval)
    animatedTitle.value = ''

    if (!newTitle) return

    let i = 0
    typingInterval = setInterval(() => {
      animatedTitle.value += newTitle[i]
      i++
      if (i >= newTitle.length) {
        clearInterval(typingInterval)
      }
    }, 35)
  },
  { immediate: true }
)

const showPinButton = computed(() => {
  return chat.chatId && chat.historyLoaded
})

function closeSettings() {
  showSettingsModal.value = false
}


</script>

<style scoped>
.topbar {
  position: fixed;
  width: calc(100% - 300px);
  padding: 20px;
  border-bottom: 1px solid #303030;
  background-color: #212121;
  z-index: 50;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}


.topbar__title {
  font-size: 18px;
  color: #b4b4b4;
  white-space: nowrap;
  overflow: hidden;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  column-gap: 10px;
}

.topbar__title-wrapper {
  height: 21px;
}

.topbar__title--no-user {
  position: fixed;
  left: 20px;
}

.topbar--expanded {
  padding-left: 60px !important;
  /* когда сайдбар скрыт */
  transition: all 0.3s ease;
  width: 100%;
}

.topbar__actions {
  position: absolute;
  top: 0;
  right: 20px;
  display: flex;
  align-items: center;
  column-gap: 25px;
  top: 50%;
  transform: translateY(-50%);
}

.topbar__icon-btn {
  color: #b4b4b4;
  cursor: pointer;
}

.topbar__icon-btn:hover {
  color: #fff;
  transition: all 0.1s ease;
}


.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #1f1f1f;
  color: #f0f0f0;
  padding: 24px 24px 16px;
  border-radius: 14px;
  width: 35%;
  position: relative;
  font-family: 'Inter', system-ui, sans-serif;
  padding-bottom: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #f0f0f0;
  margin: 0;
}

.close-icon {
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-icon:hover {
  color: #fff;
}

.setting-block {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
}

.setting-block label {
  font-size: 16px;
  color: #b0b0b0;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.setting-block select {
  background: #2a2a2a;
  /* border: 1px solid #444; */
  border-radius: 8px;
  padding: 10px 12px;
  color: #f0f0f0;
  font-size: 14px;
  appearance: none;
  cursor: pointer;
  transition: border 0.2s ease;
  margin-bottom: 20px;
  width: 100%;
}

/* .setting-block select:hover {
  border-color: #666;
} */

.setting-block select:disabled {
  color: #888;
  cursor: not-allowed;
  background: #2a2a2a;
}

.dropdown {
  position: relative;
  user-select: none;
}

.dropdown-selected {
  background: #2a2a2a;
  padding: 10px 12px;
  border-radius: 8px;
  color: #f0f0f0;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dropdown-icon {
  color: #ccc;
  transition: transform 0.2s ease;
}

.dropdown-list {
  position: absolute;
  top: calc(100% - 16px);
  left: 0;
  width: 100%;
  background: #2a2a2a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.dropdown-option {
  padding: 10px 12px;
  color: #f0f0f0;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.dropdown-option:hover {
  background-color: #3a3a3a;
}

.dropdown-option.disabled {
  color: #777;
  cursor: not-allowed;
  pointer-events: none;
}


.tooltip-wrapper {
  position: relative;
  display: flex;
}

.tooltip-text {
  position: absolute;
  top: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background-color: #0d0d0d;
  color: #ececec;
  padding: 9px 14px;
  font-size: 14px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  border: 1px solid #303030;
  transition: opacity 0.1s ease-in-out;
  z-index: 10;
}

.tooltip-wrapper:hover .tooltip-text {
  opacity: 1;
}

.topbar__user{
  display: flex;
  align-items: center;
  column-gap: 10px;
}

.topbar__user-logo {
  display: flex;
  align-items: center;
  column-gap: 10px;
  height: 30px;
  width: 30px;
  cursor: pointer;
  border-radius: 50%;
  position: relative;
  z-index: 20;
}

.topbar__user-logo:hover::before {
  opacity: 1;
  transition: all .1s ease;
}

.topbar__user-logo::before{
  content: '';
  position: absolute;
  opacity: 0;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background-color: #ffffff26;
  border-radius: 50%;
  z-index: -1;
  transition: all .1s ease;
}

.topbar__user-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.login {
  font-size: 14px;
  padding: 8px 14px;
  color: #0d0d0d;
  background-color: #f9f9f9;
  border-radius: 42px;
  border: none;
  outline: none;
  cursor: pointer;
  font-weight: 600;
  transition: all .1s ease 0s;
}

.login:hover {
  background-color: #ececec;
}

.register {
  font-size: 14px;
  padding: 8px 14px;
  color: #fff;
  background-color: #212121;
  border-radius: 42px;
  border: none;
  outline: none;
  cursor: pointer;
  font-weight: 600;
  border: 1px solid #ffffff26;
  transition: all .1s ease 0s;
}

.register:hover {
  background-color: #2f2f2f;
}

.topbar__user-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
}

.user-menu {
  position: absolute;
  top: 110%;
  right: -7px;
  width: 320px;
  background: #2f2f2f;
  border: 1px solid #fff3;
  border-radius: 1rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 8px;
  z-index: 100;

}

.user-menu__item {
  padding: 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  border-radius: .375rem;
  color: #fff;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  width: 100%;
}

.user-menu__item:hover {
  background: #424242;
}

.separator {
  height: 1px;
  width: calc(100% - 24px);
  margin: 4px 12px;
  background-color: #fff3;
}
</style>

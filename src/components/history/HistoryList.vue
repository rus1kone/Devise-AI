<template>
  <div v-if="chat.history.length === 0" class="empty-history">
    <Inbox size="42" />
    <h3>No chats yet</h3>
    <p>This is where your chat history will appear. Start a conversation to see it here.</p>
  </div>

  <div v-else-if="chat.history.length && filteredChats.length === 0" class="empty-history">
    <Search size="42" />
    <h3>No matches found</h3>
    <p>Try adjusting your search or check for typos.</p>
  </div>

  <template v-else>
    <div class="recent" v-if="!chat.searchQuery.trim()">
      <h3 class="recent__title">Recent</h3>
      <div class="recent__items">
        <div v-for="(chat, index) in recentChats" :key="'chat-' + index" class="recent__item"
          :class="{ 'list__item--editing': isEditing(index, 'recent') }"
          @click="() => { if (!isEditing(index, 'recent')) handleCardClick(index, chat, 'recent') }">
          <div class="chat-title-wrapper"
            @click="() => { if (!isEditing(index, 'recent')) handleCardClick(index, chat, 'recent') }">
            <span class="chat-title" :contenteditable="isEditing(index, 'recent')" :ref="el => setRecentRef(el, index)"
              @keydown.enter.prevent="saveTitle(index, 'recent')" @blur="saveTitle(index, 'recent')">
              {{ chat.title }}
            </span>
            <component v-if="chat.mentorId && mentorIcons[chat.mentorId]" :is="mentorIcons[chat.mentorId]" size="17"
              class="chat-title-icon" />
          </div>



          <div class="chat-actions" :class="{ 'chat-actions--editing': isEditing(index, 'recent') }">
            <button class="icon-btn"
              @click.stop="isEditing(index, 'recent') ? saveTitle(index, 'recent') : startEdit(index, 'recent')">
              <component :is="isEditing(index, 'recent') ? Check : Pencil" size="17" />
            </button>
            <button class="icon-btn" v-if="!isEditing(index, 'recent')" @click.stop="openDeleteModal(chat, 'recent')"
            >
              <Trash2 size="17" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="pinned" v-if="!chat.searchQuery.trim() && chat.pinned.length">
      <h3 class="pinned__title">Pinned</h3>
      <div class="pinned__items">
        <div v-for="(chatItem, index) in chat.history.filter(c => c.pinned)" :key="'pinned-' + chatItem.id"
          class="pinned__item" @click="openChat(chatItem)">
          <div class="chat-title-wrapper" @click="() => { if (!isEditing(index)) openChat(chatItem) }">
            <span class="chat-title">
              {{ chatItem.title }}
            </span>
            <component v-if="chatItem.mentorId && mentorIcons[chatItem.mentorId]" :is="mentorIcons[chatItem.mentorId]"
              size="17" class="chat-title-icon" />
          </div>

          <!-- 🔥 Кнопка открепления -->
          <div class="chat-actions">
            <button class="pin-icon-btn" @click.stop="chat.togglePin(chatItem.id)" :title="'Unpin chat'">
              <PinOff size="17" />
            </button>
          </div>
        </div>
      </div>

    </div>

    <div class="list">
      <h3 class="list__title">All Sessions</h3>
      <TransitionGroup name="fade-list" tag="div" class="list__items">
        <div v-for="(chat, index) in allChats" :key="'chat-' + index" class="list__item"
          :class="{ 'list__item--editing': isEditing(index) }"
          @click="() => { if (!isEditing(index)) handleCardClick(index, chat) }">
          <div class="chat-title-wrapper" @click="() => { if (!isEditing(index)) handleCardClick(index, chat) }">
            <span class="chat-title" :contenteditable="isEditing(index)" :ref="el => setAllRef(el, index)"
              @keydown.enter.prevent="saveTitle(index)" @blur="saveTitle(index)">
              {{ chat.title }}
            </span>
            <component v-if="chat.mentorId && mentorIcons[chat.mentorId]" :is="mentorIcons[chat.mentorId]" size="16"
              class="chat-title-icon" />
          </div>

          <div class="chat-actions" :class="{ 'chat-actions--editing': isEditing(index) }">
            <button class="icon-btn" @click.stop="isEditing(index) ? saveTitle(index) : startEdit(index)">
              <component :is="isEditing(index) ? Check : Pencil" size="17" />
            </button>
            <button class="icon-btn" v-if="!isEditing(index)" @click.stop="openDeleteModal(chat)"
            >
              <Trash2 size="17" />
            </button>
            
          </div>
        </div>
      </TransitionGroup>
    </div>
    <Teleport to="body">
              <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
                <div class="modal">
                  <div class="modal-header">
                    <h3 class="modal-title">Delete chat?</h3>
                  </div>
                  <div class="modal-content">
                    <p class="modal-subtitle">This will delete <span><strong>{{ chatToDelete?.title }}</strong></span></p>
                  <p class="modal-hint">
                    Visit this chat’s settings to delete all stored memory.
                  </p>
                  </div>
                  <div class="modal-actions">
                    <button class="btn-cancel" @click="closeDeleteModal">Cancel</button>
                    <button class="btn-delete" @click="confirmDelete">Delete</button>
                  </div>
                </div>
              </div>
            </Teleport>
  </template>
</template>

<script setup>
import { onMounted, computed, ref, nextTick } from 'vue'
import { useChatStore } from '@/store/chatStore'
import { useUIStore } from '@/store/uiStore'
import { Pencil, Trash2, Check, Inbox, Search, PinOff, Brain, Code, Atom, GraduationCap, TrendingUp, Palette } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const chat = useChatStore()
const justSaved = ref(false)
const showDeleteModal = ref(false)
const chatToDelete = ref(null)
const deleteGroup = ref('all')

function openDeleteModal(chatItem, group = 'all') {
  if (showDeleteModal.value) return // 👈 защита от второго открытия

  chatToDelete.value = chatItem
  deleteGroup.value = group
  showDeleteModal.value = true
}


function closeDeleteModal() {
  showDeleteModal.value = false
  chatToDelete.value = null
}

function confirmDelete() {
  const source = deleteGroup.value === 'recent' ? recentChats.value : allChats.value
  const realIndex = chat.history.findIndex(c => c === chatToDelete.value)
  if (realIndex !== -1) {
    chat.deleteChat(realIndex)
  }
  closeDeleteModal()
}


const ui = useUIStore()

const mentorIcons = {
  focus: Brain,
  code: Code,
  mind: Atom,
  study: GraduationCap,
  growth: TrendingUp,
  design: Palette
}


onMounted(() => {
  if (!chat.history.length) chat.loadHistory()
})

const searchQuery = ref('')

const filteredChats = computed(() => {
  const query = chat.searchQuery.trim().toLowerCase()
  if (!query) return chat.history
  return chat.history.filter(c => c.title.toLowerCase().includes(query))
})


const recentChats = computed(() =>
  filteredChats.value.filter(c => !c.pinned).slice(0, 3)
)

const allChats = computed(() =>
  filteredChats.value.filter(c => !c.pinned)
)

const recentEditableRefs = ref([])
const editableRefs = ref([])
const editingIndex = ref(null)

function isEditing(index, group = 'all') {
  return editingIndex.value?.index === index && editingIndex.value?.group === group
}

function setRecentRef(el, index) {
  if (el) recentEditableRefs.value[index] = el
}

function setAllRef(el, index) {
  if (el) editableRefs.value[index] = el
}

function startEdit(index, group = 'all') {
  editingIndex.value = { index, group }
  nextTick(() => {
    const refs = group === 'recent' ? recentEditableRefs.value : editableRefs.value
    const el = refs[index]
    if (el && el.parentNode) {
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(el)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
      el.focus()
    }
  })
}

const MAX_TITLE_LENGTH = 90


function saveTitle(index, group = 'all') {
  const refs = group === 'recent' ? recentEditableRefs.value : editableRefs.value
  const el = refs[index]
  if (!el) return

  let newTitle = el.innerText.trim()
  if (newTitle.length > MAX_TITLE_LENGTH) {
    newTitle = newTitle.slice(0, MAX_TITLE_LENGTH).trim()
  }

  const source = group === 'recent' ? recentChats.value : allChats.value
  const realIndex = chat.history.findIndex(c => c === source[index])

  if (realIndex !== -1 && newTitle) {
    chat.updateChatTitle(realIndex, newTitle)
  }

  justSaved.value = true

  // ❗ Даем время другим событиям (вроде click) пройти, прежде чем сбросим
  setTimeout(() => {
    editingIndex.value = null
    justSaved.value = false
  }, 100) // 100мс — идеально
}



function deleteChat(index, group = 'all') {
  const source = group === 'recent' ? recentChats.value : allChats.value
  const realIndex = chat.history.findIndex(c => c === source[index])
  if (realIndex !== -1) {
    chat.deleteChat(realIndex)
  }
}

function handleCardClick(index, chatItem, group = 'all') {
  if (isEditing(index, group) || justSaved.value) return
  openChat(chatItem)
}

function openChat(chatItem) {
  chat.loadChat(chatItem)
  router.push('/')
}




</script>





<style scoped>
.list__title {
  font-size: 18px;
  color: #b4b4b4;
  margin-bottom: 20px;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0.5px;
}

.list__items {
  /* display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 15px;
    row-gap: 20px;
    justify-content: space-between; */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(23%, 1fr));
  gap: 20px 20px;


}

.list__item {
  /* width: 300px; */
  /* width: 24%; */
  height: 50px;
  background-color: #303030;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease 0s;
  text-align: center;
  font-size: 13px;
  cursor: pointer;
  padding: 0 12px;

}

.recent__item {
  /* width: 300px;
  width: 32%; */
  height: 50px;
  background-color: #303030;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  text-align: center;
  z-index: 5;
}


.pinned {
  margin-bottom: 50px;
}

.pinned__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32%, 1fr));
  gap: 20px 23px;
}

.pinned__item {
  /* width: 300px;
  width: 32%; */
  height: 50px;
  background-color: #303030;
  border-radius: 8px;
  height: 50px;
  background-color: #303030;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  text-align: center;
  z-index: 5;
}

.pinned__title {
  font-size: 18px;
  color: #b4b4b4;
  margin-bottom: 20px;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0.5px;
}

.recent {
  margin-bottom: 50px;
}

.recent__title {
  font-size: 18px;
  color: #b4b4b4;
  margin-bottom: 20px;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0.5px;
}

.recent__items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32%, 1fr));
  gap: 20px 23px;
}



.recent__item,
.pinned__item {
  text-align: center;
  position: relative;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ececec;
  transition: all 0.2s ease;
  cursor: pointer;
  overflow: hidden;
  font-size: 15px;
}

.recent__item:hover,
.pinned__item:hover {
  box-shadow: 0 0 0 1px #303030;
}


.list__item--editing {
  cursor: default !important;
}

.chat-title[contenteditable="true"] {
  cursor: text;
}

.list__item:hover {
  box-shadow: 0 0 0 1px #303030;
}

.chat-actions {
  position: absolute;
  right: 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  background: linear-gradient(to left, #303030 60%, transparent);
  padding-left: 55px;
}

.pin-icon-btn {
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b4b4b4;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.1s ease, color 0.1s ease;
}

.pin-icon-btn:hover {
  color: #fff;
}



.chat-actions--editing {
  padding-left: 0 !important;
  background: none !important;
}



.recent__item:hover .chat-actions,
.list__item:hover .chat-actions,
.pinned__item:hover .chat-actions {
  opacity: 1;
}

.icon-btn {
  background: none;
  border: none;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b4b4b4;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.1s ease, color 0.1s ease;
}

.icon-btn:hover {
  color: #fff;
}


.chat-title-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  column-gap: 10px;
  justify-content: center;
}

.chat-title {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  align-self: stretch;
  column-gap: 10px;
  /* 🧠 ключевая штука */
}




.chat-title[contenteditable="true"] {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* display: inline-block; */
  max-width: 100%;
}


.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.chat-title[contenteditable="true"]:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.empty-history {
  text-align: center;
  padding: 100px 0;
  color: #777;
  opacity: 0.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -48%);
}

.empty-history h3 {
  font-size: 18px;
  margin: 0;
  color: #ccc;
}

.empty-history p {
  font-size: 14px;
  color: #888;
}

.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.3s ease;
}

.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.fade-list-enter-to,
.fade-list-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: #2f2f2f;
  border-radius: 15px;
  width: 100%;
  max-width: 460px;
  color: #fff;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #474747;
}

.modal-content {
  padding: 24px;
}

.modal-title {
  font-size: 18px;
  color: #f9f9f9;
  font-weight: 600;
  line-height: 1;
}

.modal-subtitle {
  font-size: 15px;
  margin-bottom: 8px;
  font-weight: 400;
  color: #ececec;
}

.modal-subtitle span{
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  
}

.modal-hint {
  font-size: 14px;
  color: #b4b4b4;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px;
  padding-top: 0;
}

.btn-cancel,
.btn-delete {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all .1s ease 0s;
}

.btn-cancel {
  background-color: #2f2f2f;
  color: #f9f9f9;
  border: 1px solid #ffffff26;
  border-radius: 42px;
}

.btn-cancel:hover {
  background-color: #4a4a4a;
  color: #fff;
}

.btn-delete {
  background-color: #e02e2a;
  color: #FFF;
  border-radius: 42px;
}

.btn-delete:hover {
  background-color: #911e1b;
}

</style>
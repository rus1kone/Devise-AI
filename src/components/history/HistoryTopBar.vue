<template>
    <div class="history__topbar" :class="{ 'history__topbar--expanded': ui.sidebarHidden }">
        <h2 class="history__title">History</h2>
        <form class="history__search">
            <input
  type="text"
  class="history__search-input"
  v-model="chat.searchQuery"
/>
            <Search size="18" />
        </form>
        <div class="history__actions">
            <button class="history__icon-btn">
                <SlidersHorizontal size="25" />
            </button>
            <button @click="clearAllChats" class="history__icon-btn">
                <Trash2 size="25" />
            </button>
        </div>
    </div>
    <Teleport to="body">
  <div v-if="showClearAllModal" class="modal-backdrop" @click.self="closeClearAllModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Delete all chats?</h3>
      </div>
      <div class="modal-content">
        <p class="modal-hint">
          Are you sure you want to delete <strong>all chats</strong>? This will erase memory and history across the entire app.
        </p>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="closeClearAllModal">Cancel</button>
        <button class="btn-delete" @click="confirmClearAll">Delete</button>
      </div>
    </div>
  </div>
</Teleport>

</template>



<script setup>
import { ref, computed } from 'vue'
import { useUIStore } from '@/store/uiStore'
import { useChatStore } from '@/store/chatStore'
import { SlidersHorizontal, Trash2, Search } from 'lucide-vue-next'

const ui = useUIStore()
const chat = useChatStore()
const showClearAllModal = ref(false)

function clearAllChats() {
  // Если уже есть другой модал, не открывать
  if (document.querySelector('.modal-backdrop')) return

  showClearAllModal.value = true
}

function closeClearAllModal() {
  showClearAllModal.value = false
}

function confirmClearAll() {
  chat.clearHistory()
  closeClearAllModal()
}


const searchQuery = ref('')

const filteredChats = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return chat.history

  return chat.history.filter(chat =>
    chat.title.toLowerCase().includes(query)
  )
})

// function clearAllChats() {
//   chat.clearHistory()
// }

</script>

<style scoped>
.history__topbar {
    position: fixed;
    width: calc(100% - 300px);
    padding: 14px 20px;
    border-bottom: 1px solid #303030;
    background-color: #212121;
    z-index: 50;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.history__topbar--expanded {
    padding-left: 60px !important;
    /* когда сайдбар скрыт */
    transition: all 0.3s ease;
    width: 100%;
}

.history__title {
    font-size: 18px;
    color: #b4b4b4;
    white-space: nowrap;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: 0.5px;
}

.history__search{
    display: flex;
    align-items: center;
    background-color: #303030;
    border-radius: 18px;
    padding: 8px 14px;
    color: #676767;

}

.history__search-input {
    
    color: #ececec;
    
    width: 350px;
    
    font-size: 13px;
}

.history__search-input::placeholder {
    color: #b4b4b4;
    font-size: 13px;
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: 0.5px;
    text-align: center;
}

.history__actions {
    display: flex;
  align-items: center;
  column-gap: 25px;
}

.history__icon-btn{
  color: #b4b4b4;
  cursor: pointer;
}

.history__icon-btn:hover{
  color: #fff;
  transition: all 0.1s ease;
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
<script setup>
import { useUIStore } from '@/store/uiStore'
import { useRoadmapStore } from '@/store/roadmapStore'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { MoveLeft } from 'lucide-vue-next';
import { MapPlus, Trash2 } from 'lucide-vue-next';

// ...
const showClearAllModal = ref(false)

function openClearAllModal() {
  showClearAllModal.value = true
}
function closeClearAllModal() {
  showClearAllModal.value = false
}
function confirmClearAll() {
  store.roadmaps = []      // очищаем все roadmap'ы
  store.closeIntro()       // если модалка вдруг открыта — скрыть
  showClearAllModal.value = false
  store.isFirstVisit = true // показываем интро при следующем открытии
}


const ui = useUIStore()
const store = useRoadmapStore()
const route = useRoute()
const router = useRouter()
const showTooltip = ref(true)

const isDetailView = computed(() => !!route.params.id)
</script>

<template>
  <div class="roadmap__topbar" :class="{ 'roadmap__topbar--expanded': ui.sidebarHidden }">
    <div class="roadmap__topbar-content">
      <button
        v-if="isDetailView"
        @click="router.push('/roadmap')"
        class="roadmap__back-button"
      >
      <MoveLeft />
      </button>
      <h2 class="roadmap__title">
        Roadmap<span v-if="isDetailView"> / {{ store.roadmapTitle || '...' }}</span>
      </h2>
    </div>

    <div class="roadmap__topbar-actions">
      <div class="tooltip-wrapper" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false">
  <button
  v-if="!isDetailView"
    ref="newChatBtnRef"
    class="roadmap__topbar-new"
    @click="store.openIntro"
  >
  <MapPlus size="26" />
  </button>
  <span v-if="showTooltip" class="tooltip-text">New roadmap</span>
</div>
      <!-- <button class="roadmap__topbar-new">
        <MapPlus size="26" />
      </button> -->
      <button v-if="!isDetailView" class="roadmap__topbar-delete" @click="openClearAllModal">
        <Trash2 size="24" />
      </button>
    </div>
  </div>

  <Teleport to="body">
  <div v-if="showClearAllModal" class="modal-backdrop" @click.self="closeClearAllModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Delete all roadmaps?</h3>
      </div>
      <div class="modal-content">
        <p class="modal-hint">
          Are you sure you want to delete <strong>all generated roadmaps</strong>? This action cannot be undone.
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

<style scoped>
.roadmap__topbar {
    position: fixed;
    width: calc(100% - 300px);
    padding: 20px 20px;
    border-bottom: 1px solid #303030;
    background-color: #212121;
    z-index: 50;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.roadmap__topbar--expanded {
    padding-left: 60px !important;
    /* когда сайдбар скрыт */
    transition: all 0.3s ease;
    width: 100%;
}

.roadmap__topbar-content{
    display: flex;
    align-items: center;
    gap: 10px;
    color: #b4b4b4;
}

.roadmap__title {
    font-size: 18px;
    color: #b4b4b4;
    white-space: nowrap;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: 0.5px;
}

.roadmap__back-button{
    cursor: pointer;
}

.roadmap__topbar-actions{
  display: flex;
  align-items: center;
  column-gap: 25px;
  color: #b4b4b4;
}

.roadmap__topbar-new{
  cursor: pointer;
}

.roadmap__topbar-delete{
  cursor: pointer;
}

.roadmap__topbar-new:hover,
.roadmap__topbar-delete:hover{
  color: #fff;
  transition: all 0.1s ease;
}

.tooltip-wrapper{
  display: flex;
  position: relative;
}

.tooltip-wrapper:hover .tooltip-text {
  opacity: 1;
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
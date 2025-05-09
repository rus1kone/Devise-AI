<template>
    <div class="roadmap-view">
      <RoadmapTopBar />
      <RoadmapIntro />
      <div class="roadmap-body">
        <div class="roadmap__grid">
          <div
            v-for="(map, index) in roadmaps"
            :key="map.id"
            class="roadmap__card"
            @click="$router.push('/roadmap/' + map.id)"
          >
            <div class="roadmap__card-header">
              <input
  v-if="editingIndex === index"
  v-model="editedTitle"
  class="roadmap__title-input"
  @click.stop
  @keydown.enter="toggleEdit(index, map)"
/>
<h3 v-else class="roadmap__card-title">
  <Map class="roadmap__card-icon" />
  <span class="roadmap__card-text">{{ map.title }}</span>
</h3>

  
              <div class="roadmap__actions">
                <button class="icon-btn" @click.stop="toggleEdit(index, map)">
                  <component :is="editingIndex === index ? Check : Pencil" size="18" />
                </button>
                <button class="icon-btn" v-if="editingIndex !== index" @click.stop="openDeleteModal(map)">
                  <Trash2 size="18" />
                </button>
              </div>
            </div>
  
            <ul class="roadmap__card-preview">
              <li v-for="(sub, i) in map.steps.slice(2, 7)" :key="i" class="roadmap__card-step">
                {{ i + 3 }}. {{ sub.title }}
              </li>
            </ul>
  
            <div class="roadmap__card-tags">
              <span v-for="tag in map.tags" :key="tag" class="roadmap__card-tag">
                #{{ tag }}
              </span>
            </div>
  
            <div class="roadmap__card-meta">
              <span class="roadmap__card-steps">{{ map.steps.length }} steps</span>
              <span class="roadmap__card-date">{{ formatDate(map.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
      <Teleport to="body">
  <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
    <div class="modal">
      <div class="modal-header">
        <h3 class="modal-title">Delete roadmap?</h3>
      </div>
      <div class="modal-content">
        <p class="modal-hint">
          Are you sure you want to delete
          <strong> <span>{{ roadmapToDelete?.title || 'this roadmap' }}?</span></strong>
          This action cannot be undone.
        </p>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" @click="closeDeleteModal">Cancel</button>
        <button class="btn-delete" @click="confirmDeleteRoadmap">Delete</button>
      </div>
    </div>
  </div>
</Teleport>
    </div>

    

  </template>
  

<script setup>
import { ref } from 'vue'
import { useRoadmapStore } from '@/store/roadmapStore'
import { storeToRefs } from 'pinia'
import RoadmapTopBar from '../components/roadmap/RoadmapTopBar.vue'
import RoadmapIntro from '@/components/roadmap/RoadmapIntro.vue'
import { Map } from 'lucide-vue-next';
import { Pencil, Check, Trash2 } from 'lucide-vue-next'


const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}


const store = useRoadmapStore()
const { roadmaps } = storeToRefs(store)
const { openIntro } = store
const editingIndex = ref(null)
const editedTitle = ref('')


function toggleEdit(index, map) {
  if (editingIndex.value === index) {
    map.title = editedTitle.value
    editingIndex.value = null
  } else {
    editingIndex.value = index
    editedTitle.value = map.title
  }
}

const showDeleteModal = ref(false)
const roadmapToDelete = ref(null)

function openDeleteModal(map) {
  roadmapToDelete.value = map
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  roadmapToDelete.value = null
}

function confirmDeleteRoadmap() {
  if (roadmapToDelete.value) {
    const i = roadmaps.value.findIndex(r => r.id === roadmapToDelete.value.id)
    if (i !== -1) {
      roadmaps.value.splice(i, 1)
      if (roadmaps.value.length === 0) openIntro()
    }
  }

  closeDeleteModal()
}


</script>

<style scoped>
.roadmap-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    overflow: hidden;
}

.roadmap-body {
    overflow-y: auto;
    height: 100%;
    padding-top: 80px;
}

.roadmap__grid {
    display: grid;
    gap: 1rem;
    padding: 20px;
    grid-template-columns: repeat(auto-fill, minmax(32%, 1fr));
}

.roadmap__card {
    background-color: #303030;
    border-radius: 20px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.roadmap__card:hover {
    box-shadow: 0 0 0 1px #303030;
}

.roadmap__card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ececec;
  font-size: 20px;
  font-weight: 600;
  max-width: 100%;
}

.roadmap__card-icon {
  flex-shrink: 0; /* не уменьшается при длинном тексте */
}

.roadmap__card-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}


.roadmap__card-desc {
    font-size: 0.875rem;
    color: #b4b4b4;
    margin-top: 0.25rem;
}

.roadmap__card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    font-size: 0.75rem;
    color: #b4b4b4;
    /* text-gray-400 */
}

.roadmap__card-steps {
    font-weight: 500;
}

.roadmap__card-date {
    font-style: italic;
}

.roadmap__card-preview {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.95rem;
  color: #d0d0d0;
  line-height: 1.3;
  font-weight: 400;
  overflow: hidden;
}

.roadmap__card-step {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.85;
}

.roadmap__card-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.75rem;
}

.roadmap__card-tag {
  font-size: 0.8rem;
  background-color: #404040;
  color: #eeeeee;
  padding: 2px 8px;
  border-radius: 9999px;
  font-weight: 500;
  opacity: 0.9;
  transition: background 0.2s ease;
}

.roadmap__card-tag:hover {
  background-color: #525252;
}

.roadmap__card {
  position: relative;
}

.roadmap__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.roadmap__actions {
    position: absolute;
    right: 24px;
    top: 24px;
  display: flex;
  background: linear-gradient(to left, #303030 60%, transparent);
  gap: 5px;
  opacity: 0;
  padding-left: 55px;
  padding-bottom: 5px;
  transition: opacity 0.2s ease;
}

.roadmap__card:hover .roadmap__actions {
  opacity: 1;
}

.roadmap__title-input {
  background: transparent;
  border: 1px solid #555;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  width: 100%;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
  padding: 5px;
}

.icon-btn:hover {
  color: #fff;
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

.modal-hint span{
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  
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

.modal-subtitle span{
  color: #fff;
  font-weight: 600;
  font-size: 16px;
  
}
</style>
<template>
  <div class="app-shell" :class="{ 'app-shell--sidebar-hidden': ui.sidebarHidden }">
    <aside class="app-shell__sidebar" v-if="auth.user">
      <div class="app-shell__sidebar-top">
        <h1 class="app-shell__logo">Devise AI</h1>
        <button class="app-shell__toggle-btn" @click="ui.hideSidebar()">
          <PanelLeftClose size="22" />
        </button>
      </div>

      <nav class="app-shell__nav">
        <ul class="app-shell__nav-list">
          <li :class="{ 'app-shell__nav-item--active': route.path === '/' }">
            <router-link to="/" class="app-shell__nav-item">
              <Bot size="21" />
              <span>Chat</span>
            </router-link>
          </li>
          <li :class="{ 'app-shell__nav-item--active': route.path === '/history' }">
            <router-link to="/history" class="app-shell__nav-item">
              <FolderClock size="20" />
              <span>History</span>
            </router-link>
          </li>
          <li :class="{ 'app-shell__nav-item--active': route.path === '/mentors' }">
            <router-link to="/mentors" class="app-shell__nav-item">
              <GraduationCap size="20" />
              <span>Mentors</span>
            </router-link>
          </li>
          <li :class="{ 'app-shell__nav-item--active': route.path.startsWith('/roadmap') }">
            <router-link to="/roadmap" class="app-shell__nav-item">
              <Map size="20" />
              <span>Roadmap</span>
            </router-link>
          </li>

          <li :class="{ 'app-shell__nav-item--active': route.path === '/profile' }">
            <router-link to="/profile" class="app-shell__nav-item">
              <CircleUser size="20" />
              <span>Profile</span>
            </router-link>
          </li>
        </ul>
      </nav>
      <!-- <div class="auth-box">
  <template v-if="auth.user">
    <div class="user-info">
      <img :src="auth.user.photoURL" class="user-avatar" />
      <span>{{ auth.user.displayName }}</span>
    </div>
  </template>
</div> -->

    </aside>

    <main class="app-shell__content" ref="scrollContainer" style="overflow-y: auto">
      <button class="app-shell__open-sidebar-btn" v-if="ui.sidebarHidden && auth.user" @click="ui.showSidebar()">
        <PanelRightClose size="22" />
      </button>

      <transition name="fade" mode="out-in">
        <router-view v-if="scrollContainer" :scroll-container="scrollContainer" />
      </transition>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

import { PanelLeftClose, PanelRightClose, Bot, FolderClock, MessageSquareText, Map, GraduationCap, User, CircleUser } from 'lucide-vue-next'
import { ref, watch } from 'vue'
const scrollContainer = ref(null)

const route = useRoute()
const ui = useUIStore()
const auth = useAuthStore()

watch(
  () => auth.user,
  (user) => {
    if (!user) {
      ui.hideSidebar();
    } else {
      ui.showSidebar(); // Показываем меню, если пользователь зарегистрирован
    }
  },
  { immediate: true }
)


</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  background-color: #212121;
}

.app-shell__sidebar {
  width: 300px;
  background-color: #171717;
  padding: 20px;
  transition: all 0.3s ease;
  z-index: 0;
  position: absolute;
  height: 100%;
}

.app-shell__sidebar-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.app-shell__logo {
  color: #ececec;
  font-size: 1.3rem;
  font-weight: bold;
  line-height: 1;
  font-weight: 600;
}

.app-shell__toggle-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 7px;
}


.app-shell__nav-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.app-shell__nav-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  column-gap: 10px;
  width: 100%;
  padding: 7px;
  border-radius: 7px;
  color: #ececec;
  cursor: pointer;
  padding: 9px 7px;
  font-weight: 400;
  transition: all .1s ease 0s;
}

.app-shell__nav-item:hover {
  background-color: #212121;
}

.app-shell__nav-item--active .app-shell__nav-item {
  background-color: #2f2f2f;
  color: #fff;
}



.app-shell__content {
  flex: 1;
  /* padding: 20px; */
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 300px);
  margin-left: 300px;
  position: relative;
  z-index: 10;
  transition: all 0.3s ease;
  background-color: #212121;
  height: 100vh;
  flex-direction: column;
}

.app-shell--sidebar-hidden .app-shell__content {
  margin-left: 0;
  width: 100%;
}

.app-shell__open-sidebar-btn {
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 99;
  color: #b4b4b4;
  border: none;
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


.auth-box {
  position: absolute;
  bottom: 10px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: center;

  flex-direction: column;
  padding: 9px 7px;
  cursor: pointer;
  background-color: #2f2f2f;
  border-radius: 8px;
}

.auth-btn {

  color: #fff;
  padding: 8px 14px;

  border: none;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  transition: background 0.2s;
}

.auth-btn:hover {
  background-color: #444;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #ccc;
  font-size: 14px;
}

.user-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}
</style>
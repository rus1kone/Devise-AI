<template>
    <div class="profile-view">
    <h2>Hello, <span>{{ auth.user.displayName }}!</span></h2>
    <p class="info">🔧 This page is under construction. Please check back later.</p>
  </div>
</template>


<script setup>
import { useAuthStore } from '@/store/authStore'

const auth = useAuthStore()

</script>

<style scoped>

.profile-view {
  text-align: center;
  /* margin-top: 4rem; */
  color: #ececec;
}

.profile-view .info {
  margin-top: 1rem;
  font-size: 1rem;
  opacity: 0.7;
}

</style>
<template>
    <div class="mentors__topbar" :class="{ 'mentors__topbar--expanded': ui.sidebarHidden }">
        <h2 class="mentors__title">Mentors</h2>
    </div>
</template>

<script setup>
import { useUIStore } from '@/store/uiStore'

const ui = useUIStore()
</script>

<style>
.mentors__topbar {
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

.mentors__topbar--expanded {
    padding-left: 60px !important;
    /* когда сайдбар скрыт */
    transition: all 0.3s ease;
    width: 100%;
}


.mentors__title {
    font-size: 18px;
    color: #b4b4b4;
    white-space: nowrap;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
    letter-spacing: 0.5px;
}

</style>
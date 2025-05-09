<template>
    <div class="history-view">
        <HistoryTopBar />
        <div class="history-body">
            <HistoryList />
        </div>
    </div>
</template>

<script setup>
import HistoryTopBar from '../components/history/HistoryTopBar.vue';
import HistoryList from '../components/history/HistoryList.vue';
</script>

<style scoped>
.history-view {
    display: flex;
    flex-direction: column;
    height: 100vh; /* обязательно, чтобы sticky работал */
    width: 100%;
    overflow: hidden;
}

.history-body {
    margin-top: 80px;
    padding: 20px;
    overflow-y: auto;
}

</style>
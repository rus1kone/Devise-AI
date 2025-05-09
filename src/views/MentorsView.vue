<template>
    <div class="mentors-view">
        <MentorsTopBar />
        <div class="mentors-body">
            <MentorsList />
        </div>
    </div>
</template>

<script setup>
import MentorsTopBar from '../components/mentors/MentorsTopBar.vue';
import MentorsList from '../components/mentors/MentorsList.vue';
</script>

<style scoped>
.mentors-view {
    display: flex;
    flex-direction: column;
    height: 100vh;
    /* обязательно, чтобы sticky работал */
    width: 100%;
    overflow: hidden;
}

.mentors-body {
    margin-top: 60px;
    padding: 20px;
    overflow-y: auto;
}
</style>
<template>
  <div>
    剧目详情页面
    <div>剧目ID: {{ showId }}</div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
const showId = route.params.id
</script>

<style scoped>
/* 你的样式 */
</style>

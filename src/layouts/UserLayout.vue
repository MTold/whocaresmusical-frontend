
<template>
  <div class="user-layout">
    <!-- 仅当不是 /admin 路径时才显示 -->
    <UserHeader v-if="!isAdminPath" />
    <router-view />
    <UserFooter v-if="!isAdminPath" />
    <!-- AI Assistant -->
    <AIAssistant v-if="!isAdminPath" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UserHeader from '@/components/layout/UserHeader.vue'
import UserFooter from '@/components/layout/UserFooter.vue'
import AIAssistant from '@/components/AIAssistant.vue'

const route = useRoute()
const isAdminPath = computed(() => route.path.startsWith('/admin'))
</script>

<style>
body {
  margin: 0;
}
</style>

<style scoped>
/* Ensure AI Assistant doesn't interfere with layout */
.user-layout {
  position: relative;
}
</style>

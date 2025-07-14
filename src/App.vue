<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import UserHeader from './components/layout/UserHeader.vue'
</script>

<template>
  <div class="common-layout">
    <el-container style="height: 100vh;">
      <el-header style="width: 100%; padding: 0;">
        <UserHeader />
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.common-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.el-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.el-header {
  width: 100%;
  padding: 0;
}
</style>

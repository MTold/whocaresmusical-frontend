<template>
  <el-container style="height:100vh;" :style="{ backgroundImage: `url(${adminBg})` }">
    <!-- 左侧边栏 -->
    <AdminSidebar />

    <!-- 右侧主内容区 -->
    <el-main style="flex: 1; padding: 20px; overflow: auto;">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import adminBg from '@/assets/bg.jpg'
</script>

<style scoped>
/* 确保容器和侧边栏的样式不会影响主内容区 */
.el-container {
  display: flex;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
}

.el-aside {
  background-color: #F2E1AE; /* 侧边栏背景色 */
  min-height: 100vh;
}

.el-main {
  flex: 1;
  overflow: auto;
  padding: 20px; /* 内边距，可根据需要调整 */
}
</style>

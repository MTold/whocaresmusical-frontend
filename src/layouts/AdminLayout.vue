<template>
  <el-container style="height:100vh;">
    <!-- 左侧边栏 -->
    <AdminSidebar />

    <!-- 右侧主内容区 -->
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
</script>

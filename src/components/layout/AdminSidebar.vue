<template>
  <el-aside width="200px" style="background:#F2E1AE; min-height:100vh;">
    <!-- 顶部 Logo -->
    <div class="logo-box">
      <img src="@/assets/logo.png" alt="Logo" />
      <img src="@/assets/logo_slogan.png" alt="Logo" />
    </div>

    <!-- 菜单 -->
    <el-menu
      router
      :default-active="$route.path"
      background-color="#F2E1AE"
      text-color="#59310E"
      active-text-color="#59310E"
      style="border-right:none;"
    >
      <el-menu-item class="sidebar-item" index="/admin/dashboard">
        <el-icon><Monitor /></el-icon>
        <span>个人信息</span>
      </el-menu-item>

      <el-menu-item class="sidebar-item" index="/admin/users">
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </el-menu-item>

      <el-menu-item class="sidebar-item" index="/admin/news">
         <el-icon><Document /></el-icon>
         <span>资讯管理</span>
      </el-menu-item>

      <el-menu-item class="sidebar-item" index="/admin/shows">
        <el-icon><Film /></el-icon>
        <span>剧目信息管理</span>
      </el-menu-item>

      <el-menu-item class="sidebar-item" index="/admin/theaters">
        <el-icon><OfficeBuilding /></el-icon>
        <span>剧院信息管理</span>
      </el-menu-item>

      <el-menu-item class="sidebar-item" index="/admin/reviews">
        <el-icon><ChatLineRound /></el-icon>
        <span>评价管理</span>
      </el-menu-item>

      <el-menu-item class="sidebar-item" @click="logout" index="/login">
        <el-icon><SwitchButton /></el-icon>
        <span>退出登录</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Monitor, User, ChatLineRound, SwitchButton, Document, Film, OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()
const logout = () => {
  localStorage.removeItem('isAdmin')
  router.replace('/login')
}
</script>

<style scoped>
.logo-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
  background: #F2E1AE;
}
.logo-box img {
  max-width: 120px;
  max-height: 60px;
  object-fit: contain;
}

:deep(.sidebar-item) {
  border-bottom: 1.5px solid #e2cfa2;
  margin-bottom: 0;
  transition: background 0.2s, color 0.2s;
}
:deep(.sidebar-item:last-child) {
  border-bottom: none;
}

/* 激活项为棕色背景 */
:deep(.el-menu-item.is-active),
:deep(.sidebar-item.is-active) {
  background: #bfa074 !important;
  color: #fff !important;
}
:deep(.el-menu-item.is-active:hover),
:deep(.sidebar-item.is-active:hover) {
  background: #a0522d !important;
  color: #fff !important;
}

/* 鼠标悬停效果 */
:deep(.sidebar-item:hover) {
  background: #e2cfa2;
  color: #59310E;
}
</style>

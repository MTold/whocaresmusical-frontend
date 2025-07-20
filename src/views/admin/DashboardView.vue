<template>
  <div>
    <h1>管理员控制台</h1>
    <el-button type="danger" @click="logout">退出登录</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const logout = () => {
  localStorage.removeItem('isAdmin')
  ElMessage.success('已退出')
  router.replace('/login')
}
</script>

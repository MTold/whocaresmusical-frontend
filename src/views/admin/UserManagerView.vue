<template>
  <div class="admin-title-container">
    <h1 class="admin-page-title">用户信息管理</h1>
  </div>

  <div class="admin-page-container">

    <!-- 表格展示 -->
    <div class="admin-table-wrapper">
      <el-table
        v-loading="loading"
        :data="paginatedUsers"
        style="width: 100%;"
        border
        :fit="true"
        highlight-current-row
        empty-text="暂无用户信息"
      >
      <el-table-column prop="userId" label="用户ID" width="80" />
      <el-table-column prop="username" label="用户名" min-width="160" />
      <el-table-column prop="phone" label="电话" min-width="150" />
      <el-table-column prop="gender" label="性别" width="100" />
      <el-table-column prop="birthday" label="生日" width="180" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="userImage" label="头像" width="120">
        <template #default="scope">
          <el-image :src="scope.row.userImage" style="width: 80px; height: 80px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" type="danger" @click="handleDelete(scope.row.userId)">删除</el-button>
        </template>
      </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="admin-pagination-wrapper">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="users.length"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 删除用户确认框 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除用户" width="400px">
      <div>您确定要删除该用户吗？</div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'

const users = ref<any[]>([])  // 存储用户列表
const loading = ref(true)  // 加载状态
const deleteDialogVisible = ref(false)  // 删除确认对话框
const userIdToDelete = ref<number | null>(null)  // 被删除的用户ID

// 分页设置
const currentPage = ref(1)
const pageSize = ref(5)
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return users.value.slice(start, start + pageSize.value)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 获取用户信息
const fetchUsers = async () => {
  loading.value = true
  try {
    users.value = await userApi.getAllUsers()
  } catch (e) {
    ElMessage.error('加载用户信息失败')
  } finally {
    loading.value = false
  }
}

// 删除用户
const handleDelete = async (userId: number) => {
  userIdToDelete.value = userId
  deleteDialogVisible.value = true
}

// 确认删除用户
const confirmDelete = async () => {
  if (userIdToDelete.value !== null) {
    try {
      await userApi.deleteUser(userIdToDelete.value)
      ElMessage.success('删除成功')
      fetchUsers()  // 删除后重新加载用户列表
    } catch (e) {
      ElMessage.error('删除失败')
    } finally {
      deleteDialogVisible.value = false  // 关闭确认框
    }
  }
}

// 初始化获取用户信息
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
/* 使用全局admin-common.css样式 */
</style>

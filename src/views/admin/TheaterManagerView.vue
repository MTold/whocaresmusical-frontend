<template>
  <div class="admin-title-container">
    <h1 class="admin-page-title">剧院信息管理</h1>
  </div>

  <div class="admin-page-container">

    <!-- 表格展示 -->
    <div class="admin-table-wrapper">
      <el-table
        v-loading="loading"
        :data="paginatedTheaters"
        style="width: 100%;"
        border
        :fit="true"
        highlight-current-row
        empty-text="暂无剧院信息"
      >
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="locationName" label="位置" min-width="180" />
      <el-table-column prop="latitude" label="纬度" width="100" />
      <el-table-column prop="longitude" label="经度" width="100" />
      <el-table-column prop="imageUrl" label="封面" width="120">
        <template #default="scope">
          <el-image :src="scope.row.imageUrl" style="width: 80px; height: 100px" fit="cover" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="editTheater(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
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
        :total="theaters.length"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑剧院信息" width="500px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="editForm.locationName" />
        </el-form-item>
        <el-form-item label="纬度">
          <el-input v-model.number="editForm.latitude" />
        </el-form-item>
        <el-form-item label="经度">
          <el-input v-model.number="editForm.longitude" />
        </el-form-item>
        <el-form-item label="封面链接">
          <el-input v-model="editForm.imageUrl" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import theaterApi from '@/api/theater'

const theaters = ref<any[]>([])
const loading = ref(true)
const editDialogVisible = ref(false)
const editForm = ref<any>({})

// 分页
const currentPage = ref(1)
const pageSize = ref(5)
const paginatedTheaters = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return theaters.value.slice(start, start + pageSize.value)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 获取剧院信息
const fetchTheaters = async () => {
  loading.value = true
  try {
    theaters.value = await theaterApi.getAllTheaters()
  } catch (e) {
    ElMessage.error('加载剧院信息失败')
  } finally {
    loading.value = false
  }
}

const editTheater = (theater: any) => {
  editForm.value = { ...theater }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  try {
    await theaterApi.updateTheater(editForm.value.id, editForm.value)
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    fetchTheaters()
  } catch (e) {
    ElMessage.error('修改失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该剧院吗？', '提示', { type: 'warning' })
    await theaterApi.deleteTheater(id)
    ElMessage.success('删除成功')
    fetchTheaters()
  } catch (e) {
    ElMessage.info('操作取消或删除失败')
  }
}

onMounted(() => {
  fetchTheaters()
})
</script>

<style scoped>
/* 使用全局admin-common.css样式 */
</style>

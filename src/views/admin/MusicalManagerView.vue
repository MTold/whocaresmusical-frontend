<template>
  <div class="musical-manager">
    <h1>剧目信息管理</h1>

    <el-table :data="paginatedMusicals" style="width: 100%;" border>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="info" label="简介" />
      <el-table-column prop="imageUrl" label="封面" width="120">
        <template #default="scope">
          <el-image :src="scope.row.imageUrl" style="width: 80px; height: 100px" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="editMusical(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteMusical(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        background
        layout="prev, pager, next"
        :page-size="pageSize"
        :current-page="currentPage"
        :total="musicals.length"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑剧目" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="editForm.info" />
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
import musicalApi from '@/api/musical'

const musicals = ref<any[]>([])
const editDialogVisible = ref(false)
const editForm = ref<any>({})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(5) // 每页显示几条
const paginatedMusicals = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return musicals.value.slice(start, end)
})

const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 获取全部剧目
const fetchMusicals = async () => {
  try {
    musicals.value = await musicalApi.getAllMusicals()
  } catch (error) {
    ElMessage.error('加载剧目失败')
  }
}

// 编辑按钮
const editMusical = (musical: any) => {
  editForm.value = { ...musical }
  editDialogVisible.value = true
}

// 保存修改
const saveEdit = async () => {
  try {
    await musicalApi.updateMusical(editForm.value.id, editForm.value)
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    fetchMusicals()
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 删除
const deleteMusical = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除这条剧目信息吗？', '提示', {
      type: 'warning',
    })
    await musicalApi.deleteMusical(id)
    ElMessage.success('删除成功')
    fetchMusicals()
  } catch (error) {
    ElMessage.info('操作已取消或删除失败')
  }
}

onMounted(() => {
  fetchMusicals()
})
</script>

<style scoped>
.musical-manager {
  padding: 20px;
  position: absolute;
  top: 15px;
  left: 22%;
  width: 70%;
}
.pagination-container {
  margin-top: 20px;
  text-align: center;
}
</style>

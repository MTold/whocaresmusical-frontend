<template>
  <div class="admin-title-container">
    <h1 class="admin-page-title">剧目信息管理</h1>
  </div>

  <div class="admin-page-container">
    <!-- 顶部功能区 -->
    <div class="admin-control-area">
      <!-- 添加剧目按钮 -->
      <el-button type="primary" @click="handleAddMusical">添加剧目</el-button>

      <!-- 占位空白 -->
      <span class="admin-divider"></span>

      <!-- 搜索框 -->
      <div class="admin-search-wrapper">
        <el-input
          v-model="keyword"
          placeholder="请输入关键词"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="admin-table-wrapper">
      <el-table
        v-loading="loading"
        :data="paginatedMusicals"
        style="width: 100%;"
        border
        :fit="true"
        highlight-current-row
        empty-text="暂无剧目信息"
      >
        <el-table-column prop="id" label="ID" width="50px" />
        <el-table-column prop="name" label="名称" width="150px"/>
        <el-table-column prop="info" label="简介" />
        <el-table-column prop="imageUrl" label="封面" width="120px">
          <template #default="scope">
            <el-image :src="scope.row.imageUrl" style="width: 80px; height: 100px" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="editMusical(scope.row)">编辑</el-button>
            <el-button size="small" @click="viewSchedule(scope.row)">查看排期</el-button>
            <el-button size="small" type="danger" @click="deleteMusical(scope.row.id)">删除</el-button>
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
        :total="musicals.length"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 编辑/添加剧目弹窗 -->
    <el-dialog v-model="editDialogVisible" :title="isEditing ? '编辑剧目' : '添加剧目'" width="600px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入剧目名称" />
        </el-form-item>
        <el-form-item label="简介" prop="info">
          <el-input type="textarea" v-model="editForm.info" placeholder="请输入剧目简介" />
        </el-form-item>
        <el-form-item label="封面链接" prop="imageUrl">
          <el-input v-model="editForm.imageUrl" placeholder="请输入剧目封面链接" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMusical">保存</el-button>
      </template>
    </el-dialog>

    <!-- 排期管理弹窗 -->
    <el-dialog v-model="scheduleDialogVisible" :title="musical.name + ' 排期管理'" width="800px">
      <el-table
        :data="musical.shows"
        style="width: 100%"
        border
        empty-text="暂无排期信息"
      >
        <el-table-column label="日期" prop="date" />
        <el-table-column label="时间" prop="time" />
        <el-table-column label="演员阵容" prop="cast" />
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button size="small" @click="editSchedule(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteSchedule(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="scheduleDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="addSchedule">添加排期</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑排期弹窗 -->
    <el-dialog v-model="scheduleEditDialogVisible" :title="isEditingSchedule ? '编辑排期' : '添加排期'" width="600px">
      <el-form :model="scheduleForm" label-width="80px">
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="scheduleForm.date" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-time-picker v-model="scheduleForm.time" placeholder="选择时间" />
        </el-form-item>
        <el-form-item label="演员阵容" prop="cast">
          <el-input v-model="scheduleForm.cast" placeholder="请输入演员阵容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="scheduleEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSchedule">保存</el-button>
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
const scheduleDialogVisible = ref(false)
const scheduleEditDialogVisible = ref(false)
const editForm = ref<any>({})
const scheduleForm = ref<any>({})
const loading = ref(true)
const keyword = ref('')
const isEditing = ref(false)
const isEditingSchedule = ref(false)
const musical = ref<any>({})

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
  loading.value = true
  try {
    musicals.value = await musicalApi.getAllMusicals()
  } catch (error) {
    ElMessage.error('加载剧目失败')
  } finally {
    loading.value = false
  }
}

// 编辑剧目
const editMusical = (musical: any) => {
  isEditing.value = true
  editForm.value = { ...musical }
  editDialogVisible.value = true
}

// 删除剧目
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

// 保存剧目
const saveMusical = async () => {
  try {
    if (editForm.value.id) {
      // 编辑剧目
      await musicalApi.updateMusical(editForm.value.id, editForm.value)
      ElMessage.success('剧目更新成功')
    } else {
      // 添加剧目
      await musicalApi.createMusical(editForm.value)
      ElMessage.success('剧目添加成功')
    }
    editDialogVisible.value = false
    fetchMusicals()
  } catch (error) {
    ElMessage.error('操作失败: ' + (error as Error).message)
  }
}

// 添加剧目
const handleAddMusical = () => {
  editForm.value = { id: 0, name: '', info: '', imageUrl: '' } // 清空表单数据
  isEditing.value = false
  editDialogVisible.value = true
}

// 搜索剧目
const handleSearch = () => {
  fetchMusicals()
}

// 查看排期管理
const viewSchedule = (musicalItem: any) => {
  musical.value = { ...musicalItem }  // 复制当前剧目数据
  scheduleDialogVisible.value = true  // 显示排期弹窗
}

// 添加排期
const addSchedule = () => {
  isEditingSchedule.value = false
  scheduleForm.value = { date: '', time: '', cast: '' }  // 清空表单数据
  scheduleEditDialogVisible.value = true
}

// 编辑排期
const editSchedule = (schedule: any) => {
  isEditingSchedule.value = true
  scheduleForm.value = { ...schedule }
  scheduleEditDialogVisible.value = true
}

// 删除排期
const deleteSchedule = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除此排期吗？', '提示', {
      type: 'warning',
    })
    await musicalApi.deleteSchedule(id)
    ElMessage.success('删除成功')
    fetchMusicals()  // Refresh musical data
  } catch (error) {
    ElMessage.info('操作已取消或删除失败')
  }
}

// 保存排期
const saveSchedule = async () => {
  try {
    if (scheduleForm.value.id) {
      // 编辑排期
      await musicalApi.updateSchedule(scheduleForm.value.id, scheduleForm.value)
      ElMessage.success('排期更新成功')
    } else {
      // 添加排期
      await musicalApi.createSchedule(scheduleForm.value)
      ElMessage.success('排期添加成功')
    }
    scheduleEditDialogVisible.value = false
    fetchMusicals()
  } catch (error) {
    ElMessage.error('操作失败: ' + (error as Error).message)
  }
}

// 生命周期
onMounted(() => {
  fetchMusicals()
})
</script>

<style scoped>
/* 使用全局admin-common.css样式 */
</style>

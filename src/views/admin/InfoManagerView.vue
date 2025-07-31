<template>
  <div class="admin-title-container">
    <h1 class="admin-page-title">资讯管理</h1>
  </div>

  <div class="admin-page-container">

    <!-- 顶部功能区 -->
    <div class="admin-control-area">
      <!-- 添加资讯按钮 -->
      <el-button type="primary" @click="handleAddNews">添加资讯</el-button>

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
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column
          fixed
          prop="id"
          label="编号"
          width="80"
        />
        <el-table-column
          prop="title"
          label="标题"
          width="300"
          show-overflow-tooltip
        />
        <el-table-column
          prop="date"
          label="发布日期"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="summary"
          label="内容"
          width="400"
          show-overflow-tooltip
        />
        <el-table-column
          fixed="right"
          label="操作"
          width="200"
          align="center"
        >
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row.id)">删除</el-button>
            <el-button size="small" type="success" link @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="admin-pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 资讯详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentNews.title || '资讯详情'"
      width="600px"
      destroy-on-close
    >
      <div class="admin-detail-dialog">
        <div class="admin-detail-item">
          <span class="label">标题：</span>
          <span class="value">{{ currentNews.title }}</span>
        </div>
        <div class="admin-detail-item">
          <span class="label">发布日期：</span>
          <span class="value">{{ formatDate(currentNews.date) }}</span>
        </div>
        <div class="admin-detail-item content">
          <span class="label">内容：</span>
          <div class="value" v-html="currentNews.summary"></div>
        </div>
      </div>
      <template #footer>
        <span class="admin-dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑资讯对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isEditing ? '编辑资讯' : '添加资讯'"
      width="600px"
      destroy-on-close
    >
      <el-form
        :model="editForm"
        :rules="editRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" placeholder="请输入资讯标题" />
        </el-form-item>
        <el-form-item label="发布日期" prop="date">
          <el-date-picker
            v-model="editForm.date"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="内容" prop="summary">
          <el-input
            v-model="editForm.summary"
            type="textarea"
            :rows="6"
            placeholder="请输入资讯内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="admin-dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveNews">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { newsApi } from '@/api/admin/news'
import type { News } from '@/types/news'

// 状态管理
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const tableData = ref<News[]>([])

// 对话框状态
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const isEditing = ref(false)

// 当前资讯
const currentNews = ref<News>({
  id: 0,
  title: '',
  date: '',
  summary: ''
})

// 编辑表单
const editForm = reactive({
  id: 0,
  title: '',
  date: '',
  summary: ''
})

// 编辑表单引用
const editFormRef = ref<InstanceType<typeof ElForm>>()

// 编辑表单验证规则
const editRules = {
  title: [
    { required: true, message: '请输入资讯标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  summary: [
    { required: true, message: '请输入资讯内容', trigger: 'blur' },
    { min: 1, max: 1000, message: '内容长度不能超过1000个字符', trigger: 'blur' }
  ]
}

// 获取资讯数据
const fetchData = async () => {
  loading.value = true
  try {
    const allNews = await newsApi.getAllNews()

    // 根据关键字筛选
    let filteredNews = allNews
    if (keyword.value) {
      filteredNews = allNews.filter(
        news => news.title.includes(keyword.value) || news.summary.includes(keyword.value)
      )
    }

    // 分页处理
    total.value = filteredNews.length
    const startIndex = (currentPage.value - 1) * pageSize.value
    tableData.value = filteredNews.slice(startIndex, startIndex + pageSize.value)
  } catch (error) {
    console.error('数据加载错误:', error)
    ElMessage.error('数据加载失败: ' + (error as Error).message)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchData()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

const handleAddNews = () => {
  isEditing.value = false
  editForm.id = 0
  editForm.title = ''
  editForm.date = ''
  editForm.summary = ''
  editDialogVisible.value = true

  // 等待DOM更新后聚焦
  nextTick(() => {
    editFormRef.value?.clearValidate()
  })
}

const handleEdit = (news: News) => {
  isEditing.value = true
  editForm.id = news.id
  editForm.title = news.title
  editForm.date = news.date
  editForm.summary = news.summary
  editDialogVisible.value = true

  // 等待DOM更新后聚焦
  nextTick(() => {
    editFormRef.value?.clearValidate()
  })
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该资讯吗？', '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await newsApi.deleteNews(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error as Error).message)
    }
  }
}

const handleView = (news: News) => {
  currentNews.value = { ...news }
  detailDialogVisible.value = true
}

const saveNews = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (isEditing.value) {
        // 编辑资讯
        await newsApi.updateNews(editForm.id, {
          title: editForm.title,
          date: editForm.date,
          summary: editForm.summary
        })
        ElMessage.success('资讯更新成功')
      } else {
        // 添加资讯
        await newsApi.createNews({
          title: editForm.title,
          date: editForm.date,
          summary: editForm.summary
        })
        ElMessage.success('资讯添加成功')
      }

      editDialogVisible.value = false
      fetchData()
    } catch (error) {
      ElMessage.error('操作失败: ' + (error as Error).message)
    }
  })
}

// 辅助函数
const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (e) {
    return dateStr
  }
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* 使用全局admin-common.css样式 */
</style>

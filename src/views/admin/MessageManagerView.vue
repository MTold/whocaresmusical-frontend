<template>
  <div class="message-manager">
    <!-- 标题 -->
    <h1 class="page-title">消息管理</h1>

    <!-- 顶部功能区 -->
    <div class="control-area">
      <!-- 添加消息按钮 -->
      <el-button type="primary" @click="handleAddMessage">添加消息</el-button>

      <!-- 占位空白 -->
      <span class="divider"></span>

      <!-- 搜索框 -->
      <div class="search-wrapper">
        <el-input
          v-model="keyword"
          placeholder="请输入消息标题"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch" link>搜索</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column
          fixed
          prop="messageId"
          label="编号"
          width="80"
        />
        <el-table-column
          prop="title"
          label="标题"
          width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="content"
          label="内容"
          width="300"
          show-overflow-tooltip
        />
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          width="180"
        >
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="200"
          align="center"
        >
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row.messageId)">删除</el-button>
            <el-button size="small" type="success" link @click="handleView(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
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

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentMessage.title || '消息详情'"
      width="600px"
      destroy-on-close
    >
      <div class="message-detail">
        <div class="detail-item">
          <span class="label">标题：</span>
          <span class="value">{{ currentMessage.title }}</span>
        </div>
        <div class="detail-item">
          <span class="label">创建时间：</span>
          <span class="value">{{ formatDate(currentMessage.createdAt) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">更新时间：</span>
          <span class="value">{{ formatDate(currentMessage.updatedAt) }}</span>
        </div>
        <div class="detail-item content">
          <span class="label">内容：</span>
          <div class="value" v-html="currentMessage.content"></div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加/编辑消息对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isEditing ? '编辑消息' : '添加消息'"
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
          <el-input v-model="editForm.title" placeholder="请输入消息标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入消息内容"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveMessage">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElForm } from 'element-plus'
import { messageApi } from '@/api/message'
import type { Message } from '@/types/message'

// 状态管理
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const tableData = ref<Message[]>([])

// 对话框状态
const detailDialogVisible = ref(false)
const editDialogVisible = ref(false)
const isEditing = ref(false)

// 当前消息
const currentMessage = ref<Message>({
  messageId: 0,
  title: '',
  content: '',
  createdAt: '',
  updatedAt: ''
})

// 编辑表单
const editForm = reactive({
  messageId: 0,
  title: '',
  content: ''
})

// 编辑表单引用
const editFormRef = ref<InstanceType<typeof ElForm>>()

// 编辑表单验证规则
const editRules = {
  title: [
    { required: true, message: '请输入消息标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
    { min: 1, max: 1000, message: '内容长度不能超过1000个字符', trigger: 'blur' }
  ]
}

// 获取消息数据
const fetchData = async () => {
  loading.value = true
  try {
    const allMessages = await messageApi.getAllMessages()

    // 根据关键字筛选
    let filteredMessages = allMessages
    if (keyword.value) {
      filteredMessages = allMessages.filter(
        msg => msg.title.includes(keyword.value) || msg.content.includes(keyword.value)
      )
    }

    // 分页处理
    total.value = filteredMessages.length
    const startIndex = (currentPage.value - 1) * pageSize.value
    tableData.value = filteredMessages.slice(startIndex, startIndex + pageSize.value)
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

const handleAddMessage = () => {
  isEditing.value = false
  editForm.messageId = 0
  editForm.title = ''
  editForm.content = ''
  editDialogVisible.value = true

  // 等待DOM更新后聚焦
  nextTick(() => {
    editFormRef.value?.clearValidate()
  })
}

const handleEdit = (message: Message) => {
  isEditing.value = true
  editForm.messageId = message.messageId
  editForm.title = message.title
  editForm.content = message.content
  editDialogVisible.value = true

  // 等待DOM更新后聚焦
  nextTick(() => {
    editFormRef.value?.clearValidate()
  })
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该消息吗？', '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await messageApi.deleteMessage(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败: ' + (error as Error).message)
    }
  }
}

const handleView = (message: Message) => {
  currentMessage.value = { ...message }
  detailDialogVisible.value = true
}

const saveMessage = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      if (isEditing.value) {
        // 编辑消息
        await messageApi.updateMessage(editForm.messageId, {
          title: editForm.title,
          content: editForm.content
        })
        ElMessage.success('消息更新成功')
      } else {
        // 添加消息
        await messageApi.createMessage({
          title: editForm.title,
          content: editForm.content
        })
        ElMessage.success('消息添加成功')
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
.message-manager {
  padding: 20px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 60px;
  left: 16%;
  right: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #59310e;
  margin-bottom: 20px;
  text-align: center;
}

.control-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.divider {
  width: 60px;
  flex-shrink: 0;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrapper .el-input {
  width: 300px;
}

.table-wrapper {
  margin-top: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.message-detail {
  padding: 20px;
}

.detail-item {
  margin-bottom: 15px;
  line-height: 1.6;
}

.detail-item .label {
  font-weight: bold;
  color: #59310e;
  width: 80px;
  display: inline-block;
}

.detail-item .value {
  color: #333;
}

.detail-item.content {
  display: flex;
}

.detail-item.content .label {
  align-self: flex-start;
}

.dialog-footer {
  text-align: right;
}

@media (max-width: 768px) {
  .control-area {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    width: 100%;
    margin-top: 10px;
  }

  .search-wrapper .el-input {
    width: 100%;
  }
}

/* 颜色调整 */
.el-tabs__item {
  color: #bfa074;
}

.el-tabs__item.is-active {
  color: #a0522d;
}

.el-input__inner {
  border-color: #bfa074;
}

.el-input__inner:focus {
  border-color: #a0522d;
}

.el-button {
  color: #ffffff;
  background-color: #e6c9b0;
  border-color: #a0522d;
}

.el-button.is-active,
.el-button:active {
  background-color: #a0522d;
  border-color: #7a3a1d;
}

.el-button--primary {
  background-color: #a0522d;
  border-color: #7a3a1d;
}

.el-button--primary.is-active,
.el-button--primary:active {
  background-color: #7a3a1d;
  border-color: #59310e;
}

.el-button--danger {
  background-color: #e74c3c;
  border-color: #c0392b;
}

.el-button--danger.is-active,
.el-button--danger:active {
  background-color: #c0392b;
  border-color: #a93226;
}

.el-button--success {
  background-color: #27ae60;
  border-color: #219653;
}

.el-button--success.is-active,
.el-button--success:active {
  background-color: #219653;
  border-color: #1e8449;
}
</style>

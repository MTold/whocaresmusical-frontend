<template>
  <div class="messages-container">
    <h1 class="page-title">消息中心</h1>
    
    <div class="messages-list" v-loading="loading">
      <div 
        v-for="message in messages" 
        :key="message.messageId" 
        class="message-item"
        @click="viewMessage(message)"
      >
        <div class="message-header">
          <h3 class="message-title">{{ message.title }}</h3>
          <span class="message-date">{{ formatDate(message.createdAt) }}</span>
        </div>
        <div class="message-content-preview">
          {{ truncateContent(message.content, 100) }}
        </div>
      </div>
      
      <div v-if="messages.length === 0 && !loading" class="no-messages">
        暂无消息
      </div>
    </div>

    <!-- 消息详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="currentMessage.title"
      width="600px"
      destroy-on-close
    >
      <div class="message-detail">
        <div class="detail-header">
          <span class="detail-date">{{ formatDate(currentMessage.createdAt) }}</span>
        </div>
        <div class="detail-content" v-html="currentMessage.content"></div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { messageApi } from '@/api/message'
import type { Message } from '@/types/message'

// 状态管理
const loading = ref(false)
const messages = ref<Message[]>([])
const detailDialogVisible = ref(false)

// 当前消息
const currentMessage = ref<Message>({
  messageId: 0,
  title: '',
  content: '',
  createdAt: '',
  updatedAt: ''
})

// 获取消息数据
const fetchData = async () => {
  loading.value = true
  try {
    const allMessages = await messageApi.getAllMessages()
    messages.value = allMessages
  } catch (error) {
    console.error('数据加载错误:', error)
    ElMessage.error('消息加载失败: ' + (error as Error).message)
    messages.value = []
  } finally {
    loading.value = false
  }
}

// 查看消息详情
const viewMessage = (message: Message) => {
  currentMessage.value = { ...message }
  detailDialogVisible.value = true
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

const truncateContent = (content: string, length: number) => {
  if (content.length <= length) return content
  return content.substring(0, length) + '...'
}

// 生命周期
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.messages-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #59310e;
  margin-bottom: 20px;
  text-align: center;
}

.messages-list {
  min-height: 400px;
}

.message-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.message-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: #a0522d;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.message-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 0;
  flex: 1;
}

.message-date {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  margin-left: 16px;
}

.message-content-preview {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.no-messages {
  text-align: center;
  color: #999;
  font-size: 16px;
  padding: 40px 0;
}

.message-detail {
  padding: 20px;
}

.detail-header {
  text-align: right;
  margin-bottom: 16px;
}

.detail-date {
  color: #999;
  font-size: 14px;
}

.detail-content {
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.dialog-footer {
  text-align: right;
}
</style>
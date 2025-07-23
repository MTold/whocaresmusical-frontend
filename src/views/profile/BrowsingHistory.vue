<template>
  <div class="browsing-history">
    <div class="page-header">
      <h2>浏览历史</h2>
      <div class="header-actions">
        <p>查看您最近浏览的剧目</p>
        <el-button 
          v-if="totalElements > 0"
          type="danger" 
          :icon="Delete"
          size="small"
          @click="handleClearHistory"
        >
          清空历史
        </el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="histories.length === 0" class="empty-state">
      <el-empty description="暂无浏览记录">
        <el-button type="primary" @click="$router.push('/shows')">
          去浏览剧目
        </el-button>
      </el-empty>
    </div>

    <!-- 浏览历史列表 -->
    <div v-else>
      <div class="history-list">
        <div v-for="item in histories" :key="item.id" class="history-card">
          <div class="history-content">
            <div class="musical-image">
              <img :src="item.musicalImage || '/placeholder-image.jpg'" :alt="item.musicalName" />
            </div>
            <div class="musical-info">
              <h4>
                <router-link :to="`/shows/${item.musicalId}`" class="musical-link">
                  {{ item.musicalName }}
                </router-link>
              </h4>
              <p class="venue">{{ item.musicalVenue }}</p>
              <p class="description">{{ item.musicalDescription }}</p>
              <p class="view-time">浏览时间：{{ formatDate(item.viewedAt) }}</p>
            </div>
            <div class="actions">
              <el-button 
                type="danger" 
                :icon="Delete" 
                @click="handleDeleteHistory(item.id)"
                :loading="deleteLoading[item.id]"
                size="small"
              >
                删除
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalElements"
          :page-sizes="[10, 20, 30]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import {
  getBrowsingHistory,
  clearBrowsingHistory,
  deleteBrowsingHistory,
  getBrowsingHistoryCount
} from '@/api/history'
import type { BrowsingHistoryItem } from '@/api/history'

// 数据状态
const histories = ref<BrowsingHistoryItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)
const deleteLoading = ref<Record<number, boolean>>({})

// 获取浏览历史
const fetchBrowsingHistory = async () => {
  loading.value = true
  try {
    const response = await getBrowsingHistory(currentPage.value - 1, pageSize.value)
    histories.value = response.data.content || []
    totalElements.value = response.data.totalElements || 0
  } catch (error) {
    console.error('获取浏览历史失败:', error)
    ElMessage.error('获取浏览历史失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取浏览历史总数
const fetchHistoryCount = async () => {
  try {
    const response = await getBrowsingHistoryCount()
    totalElements.value = response.data
  } catch (error) {
    console.error('获取浏览历史数量失败:', error)
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 删除单条浏览记录
const handleDeleteHistory = async (historyId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条浏览记录吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    deleteLoading.value[historyId] = true
    await deleteBrowsingHistory(historyId)
    ElMessage.success('删除成功')
    await fetchBrowsingHistory()
    
    // 如果当前页没有数据了，回到上一页
    if (histories.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
      await fetchBrowsingHistory()
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除浏览记录失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  } finally {
    deleteLoading.value[historyId] = false
  }
}

// 清空浏览历史
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有浏览记录吗？此操作不可恢复。',
      '清空确认',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    await clearBrowsingHistory()
    ElMessage.success('清空成功')
    histories.value = []
    totalElements.value = 0
    currentPage.value = 1
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清空浏览历史失败:', error)
      ElMessage.error('清空失败，请稍后重试')
    }
  }
}

// 分页相关方法
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchBrowsingHistory()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchBrowsingHistory()
}

// 当页面重新可见时刷新数据
const handleVisibilityChange = () => {
  if (!document.hidden) {
    fetchBrowsingHistory()
    fetchHistoryCount()
  }
}

// 初始化加载
onMounted(() => {
  fetchBrowsingHistory()
  fetchHistoryCount()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

// 清理事件监听器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped>
.browsing-history {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-actions p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.loading-container {
  padding: 40px 0;
}

.empty-state {
  padding: 60px 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.history-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  overflow: hidden;
  transition: all 0.3s ease;
}

.history-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.history-content {
  display: flex;
  gap: 20px;
  padding: 20px;
  align-items: flex-start;
}

.musical-image {
  flex-shrink: 0;
  width: 120px;
  height: 160px;
  border-radius: 4px;
  overflow: hidden;
}

.musical-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.musical-info {
  flex: 1;
  min-width: 0;
}

.musical-info h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.musical-link {
  color: #303133;
  text-decoration: none;
  transition: color 0.2s ease;
}

.musical-link:hover {
  color: #bf5f08;
  text-decoration: underline;
}

.venue {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
}

.description {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.view-time {
  font-size: 13px;
  color: #909399;
  margin: 0;
}

.actions {
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .browsing-history {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .history-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .musical-image {
    width: 100%;
    height: 200px;
  }
  
  .actions {
    align-items: center;
  }
}
</style>
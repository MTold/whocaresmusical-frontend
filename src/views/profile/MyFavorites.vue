<template>
  <div class="my-favorites">
    <div class="page-header">
      <h2>我的收藏</h2>
      <p>查看和管理您收藏的所有剧目</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="favorites.length === 0" class="empty-state">
      <el-empty description="暂无收藏记录">
        <el-button type="primary" @click="$router.push('/shows')">
          去浏览剧目
        </el-button>
      </el-empty>
    </div>

    <!-- 收藏列表 -->
    <div v-else>
      <div class="favorites-list">
        <div v-for="item in favorites" :key="item.id" class="favorite-card">
          <div class="favorite-content">
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
              <p class="favorite-date">收藏时间：{{ formatDate(item.createdAt) }}</p>
            </div>
            <div class="actions">
              <el-button 
                type="danger" 
                :icon="Delete" 
                @click="removeFavorite(item.musicalId)"
                :loading="removeLoading[item.musicalId]"
              >
                取消收藏
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
          :page-sizes="[10, 20, 50]"
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
import { getUserFavorites, removeFavorite } from '@/api/favorite'
import type { FavoriteItem } from '@/api/favorite'

// 数据状态
const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)
const removeLoading = ref<Record<number, boolean>>({})

// 获取收藏列表
const fetchFavorites = async () => {
  loading.value = true
  try {
    const response = await getUserFavorites(currentPage.value - 1, pageSize.value)
    favorites.value = response.content || []
    totalElements.value = response.totalElements || 0
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    ElMessage.error('获取收藏列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 取消收藏
const removeFavorite = async (musicalId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要取消收藏这个剧目吗？',
      '取消收藏确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    removeLoading.value[musicalId] = true
    await removeFavorite(musicalId)
    ElMessage.success('取消收藏成功')
    await fetchFavorites()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消收藏失败:', error)
      ElMessage.error('取消收藏失败，请稍后重试')
    }
  } finally {
    removeLoading.value[musicalId] = false
  }
}

// 分页相关方法
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchFavorites()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchFavorites()
}

// 初始化加载
onMounted(() => {
  fetchFavorites()
})
</script>

<style scoped>
.my-favorites {
  padding: 20px 0;
}

.page-header {
  margin-bottom: 30px;
  text-align: center;
}

.page-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: #606266;
}

.loading-container {
  padding: 40px 0;
}

.empty-state {
  padding: 60px 0;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.favorite-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.favorite-content {
  display: flex;
  gap: 20px;
  padding: 20px;
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

.favorite-date {
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
  .my-favorites {
    padding: 10px;
  }
  
  .favorite-content {
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
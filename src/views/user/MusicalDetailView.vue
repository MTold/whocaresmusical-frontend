<template>
  <div class="show-detail-view">
    <div class="header">
      <img :src="show.image" alt="Show image" class="show-image" />
      <div class="show-info">
        <p class="show-name">{{ show.name }}</p>
        <p class="show-category">{{ show.category }}</p>
        <p class="show-description">{{ show.description }}</p>
        <div class="actions">
          <el-button 
            type="danger" 
            :icon="isFavorite ? StarFilled : Star"
            :loading="favoriteLoading"
            @click="toggleFavorite"
          >
            {{ isFavorite ? '已收藏' : '收藏剧目' }}
          </el-button>
        </div>
      </div>
    </div>
    <div class="schedule-table">
      <table>
        <thead> <!-- 补上 thead 标签 -->
          <tr>
            <th>日期</th>
            <th>时间</th>
            <th>地点</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schedule in show.schedules" :key="schedule.id">
            <td>{{ schedule.date }}</td>
            <td>{{ schedule.time }}</td>
            <td>{{ schedule.location }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <button @click="goToReview">查看更多评价...</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Star, StarFilled } from '@element-plus/icons-vue'
import { checkFavoriteStatus, addFavorite, removeFavorite } from '@/api/favorite'
import { recordBrowsing } from '@/api/history'

const route = useRoute()
const router = useRouter()
const showId = Number(route.params.id)

// 用 ShowListView 的静态数据
const showList = [
  { id: 1, name: '哈姆雷特', category: 'Ca1', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/c18ea468e1fbf29.jpg', description: '莎士比亚经典悲剧', schedules: [{ id: 1, date: '2025-07-20', time: '19:00', location: '剧院A' }] },
  { id: 2, name: '剧院魅影', category: 'Ca2', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/65f4e84e65cfdf0.jpg', description: '音乐剧经典', schedules: [{ id: 2, date: '2025-07-21', time: '20:00', location: '剧院B' }] },
  { id: 3, name: 'Show 3', category: 'Ca3', image: 'show3.jpg', description: '描述3', schedules: [{ id: 3, date: '2025-07-22', time: '18:00', location: '剧院C' }] },
  { id: 4, name: 'Show 4', category: 'ca4', image: 'show4.jpg', description: '描述4', schedules: [{ id: 4, date: '2025-07-23', time: '19:30', location: '剧院D' }] },
  { id: 5, name: 'Show 5', category: 'Ca2', image: 'show5.jpg', description: '描述5', schedules: [{ id: 5, date: '2025-07-24', time: '20:30', location: '剧院E' }] },
  { id: 6, name: 'Show 6', category: 'Ca3', image: 'show6.jpg', description: '描述6', schedules: [{ id: 6, date: '2025-07-25', time: '21:00', location: '剧院F' }] },
]

// 根据 id 查找剧目
const show = ref(showList.find(item => item.id === showId) || {
  id: showId,
  name: '未知剧目',
  category: '',
  description: '',
  image: '',
  schedules: []
})

const goToReview = () => {
  router.push(`/shows/${showId}/review`)
}

// 收藏相关状态
const isFavorite = ref(false)
const favoriteLoading = ref(false)

// 检查收藏状态
const checkFavorite = async () => {
  try {
    const response = await checkFavoriteStatus(showId)
    console.log(`剧目 ${showId} 收藏状态:`, response.data)
    isFavorite.value = response.data
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  favoriteLoading.value = true
  try {
    if (isFavorite.value) {
      await removeFavorite(showId)
      ElMessage.success('已取消收藏')
      window.dispatchEvent(new CustomEvent('favorite-changed', { detail: { musicalId: showId, isFavorite: false } }))
    } else {
      await addFavorite(showId)
      ElMessage.success('收藏成功')
      window.dispatchEvent(new CustomEvent('favorite-changed', { detail: { musicalId: showId, isFavorite: true } }))
    }
    isFavorite.value = !isFavorite.value
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || '操作失败')
  } finally {
    favoriteLoading.value = false
  }
}

// 当页面重新可见时刷新收藏状态
const handleVisibilityChange = () => {
  if (!document.hidden) {
    checkFavorite()
  }
}

// 监听收藏状态变更事件
const handleFavoriteChange = (event: CustomEvent) => {
  if (event.detail.musicalId === showId) {
    isFavorite.value = event.detail.isFavorite
  }
}

onMounted(() => {
  checkFavorite()
  recordBrowsing(showId)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('favorite-changed', handleFavoriteChange as EventListener)
})

// 监听路由参数变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      showId = Number(newId)
      checkFavorite()
      recordBrowsing(showId)
    }
  }
)

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('favorite-changed', handleFavoriteChange as EventListener)
})
</script>

<style scoped>
.show-detail-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.show-image {
  width: 200px;
  height: 300px;
  margin-right: 20px;
}

.show-info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.actions {
  margin-top: 20px;
}

.show-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.show-category,
.show-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.schedule-table {
  width: 100%;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.footer {
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #bf5f08;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>

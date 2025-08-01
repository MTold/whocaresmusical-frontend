<template>
  <div class="show-detail-view">
    <div class="header">
      <img :src="show.image" alt="Show image" class="show-image" />
      <div class="show-info">
        <p class="show-name">{{ show.name }}</p>
        <p class="show-category">{{ show.category }}</p>
        <!-- 点击剧院名称时跳转到剧院详情页面 -->
        <p v-if="theaterInfo" class="show-location" @click="goToTheaterDetail(theaterInfo.theaterId)"
           style="cursor: pointer; color: blue; text-decoration: underline;">
          {{ theaterInfo.theaterName }}
        </p>
        <p v-else class="show-location">无未来演出计划</p>
        <p class="show-description" v-html="show.description"></p>
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

    <!-- 未来演出计划表格 -->
    <div class="schedule-table">
      <h2>未来演出计划</h2>
      <table v-if="show.futureSchedules.length > 0">
        <thead>
        <tr>
          <th>日期</th>
          <th>时间</th>
          <th>演员</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="schedule in show.futureSchedules" :key="schedule.id">
          <td>{{ schedule.date }}</td>
          <td>{{ schedule.time }}</td>
          <td>{{ schedule.cast }}</td>
        </tr>
        </tbody>
      </table>

      <div v-else class="no-schedules">
        <p>没有未来排期信息</p>
      </div>
    </div>

    <!-- 历史演出计划表格 -->
    <div class="schedule-table">
      <h2>历史演出计划</h2>
      <table v-if="show.pastSchedules.length > 0">
        <thead>
        <tr>
          <th>日期</th>
          <th>时间</th>
          <th>演员</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="schedule in show.pastSchedules" :key="schedule.id">
          <td>{{ schedule.date }}</td>
          <td>{{ schedule.time }}</td>
          <td>{{ schedule.cast }}</td>
        </tr>
        </tbody>
      </table>

      <div v-else class="no-schedules">
        <p>没有历史排期信息</p>
      </div>
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
import axios from 'axios'

const route = useRoute()
const router = useRouter()
let showId = Number(route.params.id)

// 定义 show 数据对象，包含排期字段
const show = ref({
  id: showId,
  name: '',
  category: '',
  description: '',
  image: '',
  futureSchedules: [] as Array<{
    id: number
    date: string
    time: string
    cast: string
  }>,
  pastSchedules: [] as Array<{
    id: number
    date: string
    time: string
    cast: string
  }>,
})

//获取对应剧院信息
const theaterInfo = ref<{ theaterId: number; theaterName: string } | null>(null)
// 获取今天的日期，格式为 YYYY-MM-DD
const today = new Date().toISOString().split('T')[0]

// 获取剧目详情并处理排期
const fetchShowDetails = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/musicals/${showId}`)
    const data = response.data

    // 处理排期数据
    const schedules = data.shows.map((schedule: any) => ({
      id: schedule.id,
      date: schedule.date,
      time: schedule.time,
      cast: schedule.cast,
    }))

    // 按日期分类排期，分为未来和历史
    const futureSchedules = schedules
      .filter((schedule) => schedule.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const pastSchedules = schedules
      .filter((schedule) => schedule.date < today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    show.value = {
      id: data.id,
      name: data.name,
      category: data.original ? '原创' : '非原创',
      description: data.info.replace(/\r\n/g, '<br/>'), // 转换换行符为 <br/>
      image: data.imageUrl,
      futureSchedules,
      pastSchedules,
    }
    // 如果有未来排期，读取最近一场排期的 ID
    if (futureSchedules.length > 0) {
      fetchTheaterInfo(showId)
    }
  } catch (error) {
    console.error('获取剧目信息失败:', error)
  }
}

// 根据 musicalId 获取相关 shows 的剧院信息
const fetchTheaterInfo = async (musicalId: number) => {
  try {
    // 通过 musicalId 获取 shows 数据
    const response = await axios.get(`http://localhost:8080/api/shows/musical/${musicalId}`)
    const shows = response.data

    // 检查 shows 数组是否有数据
    if (shows.length > 0) {
      // 获取最近的一场演出
      const latestShow = shows[0]
      const { theaterId, theaterName } = latestShow

      // 更新 theaterInfo
      theaterInfo.value = {
        theaterId,
        theaterName,
      }
    } else {
      // 如果没有排期信息，可以设置默认或错误提示
      console.warn('没有找到对应的剧院信息');
      theaterInfo.value = null
    }
  } catch (error) {
    console.error('获取剧院信息失败:', error)
    ElMessage.error('获取剧院信息失败，请稍后再试！')
  }
}

// 跳转到剧院详情页面
const goToTheaterDetail = (theaterId: number) => {
  router.push(`/theaters/${theaterId}`)
}

// 页面加载时获取剧目信息
onMounted(() => {
  fetchShowDetails()
})

// 跳转到评价页面
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
      window.dispatchEvent(
        new CustomEvent('favorite-changed', { detail: { musicalId: showId, isFavorite: false } }),
      )
    } else {
      await addFavorite(showId)
      ElMessage.success('收藏成功')
      window.dispatchEvent(
        new CustomEvent('favorite-changed', { detail: { musicalId: showId, isFavorite: true } }),
      )
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
      fetchShowDetails() // 重新获取剧目详情
      checkFavorite()
      recordBrowsing(showId)
    }
  },
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

/* 如果没有排期信息 */
.no-schedules {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

/* 底部样式 */
.footer {
  margin-top: 40px;
  width: 100%;
  text-align: center;
  margin-bottom: 100px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #bf5f08;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }

  .show-image {
    width: 150px;
    height: 225px;
  }
}

@media (max-width: 480px) {
  .show-name {
    font-size: 14px;
  }

  .show-description {
    font-size: 14px;
  }
}
</style>

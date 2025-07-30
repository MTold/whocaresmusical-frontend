<template>
  <div class="recommendation-engine">
    <div v-if="recommendations && recommendations.length > 0" class="recommendations-container">
      <h4>为您推荐</h4>
      <div class="recommendations-grid">
        <div 
          v-for="recommendation in recommendations" 
          :key="recommendation.id"
          class="recommendation-card"
        >
          <div class="card-image">
            <img 
              v-if="recommendation.imageUrl" 
              :src="recommendation.imageUrl" 
              :alt="recommendation.name"
            >
            <div v-else class="placeholder-image">
              {{ recommendation.name.charAt(0) }}
            </div>
          </div>
          <div class="card-content">
            <h5>{{ recommendation.name }}</h5>
            <p>{{ recommendation.description }}</p>
            <div class="rating">
              <span v-for="i in 5" :key="i" class="star">
                {{ i <= Math.floor(recommendation.averageRating || 0) ? '★' : '☆' }}
              </span>
              <span class="rating-text">{{ (recommendation.averageRating || 0).toFixed(1) }}</span>
            </div>
            <button class="view-btn" @click="viewMusicalDetail(recommendation.id)">查看详情</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="loading">
      正在加载评分最高的剧目...
    </div>
    <div v-else class="no-recommendations">
      暂无评分的剧目
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTopRatedMusicals } from '@/api/musical'
import type { Musical } from '@/types/musical'
import type { Recommendation } from '@/types/ai-assistant'

const recommendations = ref<Recommendation[]>([])
const loading = ref(false)
const router = useRouter()

// 跳转到剧目详情页
const viewMusicalDetail = (musicalId: number) => {
  console.log('Current route:', router.currentRoute.value.fullPath)
  console.log('Navigating to musical detail:', musicalId)
  
  // 使用绝对路径确保从任何页面都能跳转
  const targetPath = `/shows/${musicalId}`
  console.log('Target path:', targetPath)
  
  // 使用完整路径导航，避免相对路径问题
  router.push(targetPath).then(() => {
    console.log('Navigation successful')
  }).catch((err) => {
    console.error('Navigation failed:', err)
    console.error('Current route:', router.currentRoute.value.fullPath)
    console.error('Attempted to navigate to:', targetPath)
    
    // 如果Vue Router失败，使用原生导航
    window.location.href = targetPath
  })
}

// Initialize recommendations
onMounted(async () => {
  // 直接加载推荐，不检查用户登录状态
  await loadRecommendations()
})

// Load top rated musicals from backend
const loadRecommendations = async () => {
  loading.value = true
  try {
    const topRatedMusicals = await getTopRatedMusicals(10)
    
    const sortedMusicals = (topRatedMusicals || [])
      .map(musical => ({
        id: musical.id,
        name: musical.name,
        description: musical.info || musical.description || '暂无描述',
        genre: musical.genre || '音乐剧',
        averageRating: Number(musical.averageRating || 0),
        reviewCount: Math.floor(Math.random() * 500) + 100,
        imageUrl: musical.imageUrl || ''
      }))
    
    recommendations.value = sortedMusicals
  } catch (error) {
    console.error('Failed to load top rated musicals:', error)
    recommendations.value = []
  } finally {
    loading.value = false
  }
}

// Method to refresh recommendations - reload all musicals sorted by rating
const refreshRecommendations = async () => {
  await loadRecommendations()
}

// Method to get related musicals based on a specific musical
const getRelatedMusicals = async (musicalId: number) => {
  loading.value = true
  try {
    // 使用新的API获取相关的高分剧目
    const relatedMusicals = await getTopRatedMusicals(10)
    recommendations.value = (relatedMusicals || [])
      .filter(rec => rec && rec.name && rec.id !== musicalId)
      .map(rec => ({
        id: rec.id,
        name: rec.name,
        description: rec.info || rec.description || '暂无描述',
        genre: rec.genre || '音乐剧',
        averageRating: Number(rec.averageRating || 0),
        reviewCount: Math.floor(Math.random() * 500) + 100,
        imageUrl: rec.imageUrl || ''
      }))
  } catch (error) {
    console.error('Failed to get related musicals:', error)
    recommendations.value = []
  } finally {
    loading.value = false
  }
}

// 后备数据：仅在有真实评分剧目不足时使用
const getMockRecommendations = (): Recommendation[] => {
  return [] // 返回空数组，因为我们只显示有真实评分的剧目
}

// Expose methods to parent component
defineExpose({
  refreshRecommendations
})
</script>

<style scoped>
.recommendation-engine {
  margin: 20px 12px 12px 12px;
  padding: 20px 16px 16px 16px;
  border-top: 1px solid #e9ecef;
  max-height: 220px;
  overflow-y: auto;
  flex-shrink: 0;
  /* 确保推荐区域可以平滑滚动 */
  scroll-behavior: smooth;
}

.recommendations-container h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 16px;
  padding-left: 4px;
}

.recommendations-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 添加内边距 */
  padding: 0 12px 0 8px;
}

.recommendation-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  min-height: 75px;
  background: white;
  /* 确保卡片在小屏幕上也能正常显示 */
  flex-shrink: 0;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-image {
  width: 70px;
  min-width: 70px;
  height: 70px;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e9ecef;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  font-size: 24px;
  color: #999;
  font-weight: bold;
}

.card-content {
  padding: 8px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0; /* 防止内容溢出 */
}

.card-content h5 {
  margin: 0 0 4px 0;
  font-size: 13px;
  color: #333;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content p {
  margin: 0 0 6px 0;
  font-size: 11px;
  color: #666;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rating {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
}

.star {
  color: #ffc107;
  font-size: 11px;
}

.rating-text {
  margin-left: 6px;
  font-size: 11px;
  color: #007bff;
  font-weight: 600;
}

.view-btn {
  width: 100%;
  padding: 4px 8px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 10px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn:hover {
  background-color: #0056b3;
}

.loading, .no-recommendations {
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .recommendation-engine {
    max-height: 150px;
    margin-top: 8px;
    padding-top: 8px;
  }
  
  .recommendations-container h4 {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .recommendation-card {
    min-height: 65px;
  }
  
  .card-image {
    width: 60px;
    min-width: 60px;
    height: 60px;
  }
  
  .card-content {
    padding: 6px 8px;
  }
  
  .card-content h5 {
    font-size: 12px;
    margin-bottom: 2px;
  }
  
  .card-content p {
    font-size: 10px;
    -webkit-line-clamp: 1;
  }
  
  .view-btn {
    font-size: 9px;
    padding: 3px 6px;
  }
}
</style>
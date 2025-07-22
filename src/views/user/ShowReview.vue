<template>
  <div class="review-container">
    <div class="title-section">
      <h2 class="show-title">{{ showName }}</h2>
      <div class="subtitle-row">
        <div class="subtitle">
          用户评价（共{{ reviewStatistics.totalCount }}条）
        </div>
        <div class="avg-rating">
          平均评分：
          <star-rating :model-value="Number(reviewStatistics.averageRating)" />
          <span class="avg-num">{{ reviewStatistics.averageRating }}</span>
        </div>
      </div>
    </div>

    <!-- 评分分布图 -->
    <div class="rating-distribution" v-if="reviewStatistics.totalCount > 0">
      <div class="rating-bar" v-for="rating in 5" :key="rating">
        <span class="rating-label">{{ rating }}星</span>
        <div class="bar-container">
          <div class="bar"
               :style="{ width: getRatingPercentage(rating) + '%' }"
               :class="{ 'active': selectedRating === rating }">
          </div>
        </div>
        <span class="rating-count">{{ reviewStatistics[`rating${rating}Count`] || 0 }}</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- 筛选器 -->
    <div class="filter-section">
      <button
        v-for="rating in [null, 1, 2, 3, 4, 5]"
        :key="rating"
        :class="['filter-btn', { active: selectedRating === rating }]"
        @click="filterByRating(rating)">
        {{ rating ? `${rating}星` : '全部' }}
      </button>
    </div>

    <div class="divider"></div>

    <!-- 评价列表 -->
    <div class="reviews-scroll">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-item"
      >
        <img
          :src="review.userImage || '/avatar-placeholder.png'"
          alt="用户头像"
          class="user-image"
        />
        <div class="review-info">
          <div class="review-header">
            <span class="user-name">{{ review.username || '匿名用户' }}</span>
            <span class="review-date">{{ formatDate(review.createdAt) }}</span>
          </div>
          <div class="user-rating">
            <star-rating :model-value="review.rating" :readonly="true" />
            <span class="rating-num">{{ review.rating }}.0</span>
          </div>
          <div class="review-content">{{ review.content }}</div>

          <!-- 评价操作（暂时显示给所有人，因为没有登录） -->
          <div class="review-actions">
            <button @click="editReview(review)" class="action-btn edit">编辑</button>
            <button @click="deleteReviewInternal(review.id)" class="action-btn delete">删除</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 0"
        class="page-btn">上一页
      </button>

      <span v-for="page in visiblePages" :key="page">
        <button
          @click="changePage(page - 1)"
          :class="['page-btn', { active: page - 1 === currentPage }]"
          v-if="page !== -1"
        >{{ page }}
        </button>
        <span v-else class="ellipsis">...</span>
      </span>

      <button
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages - 1"
        class="page-btn">下一页
      </button>
    </div>

    <div class="divider"></div>

    <!-- 新增评价表单（始终显示，因为没有登录） -->
    <div class="new-review-section">
      <div class="new-title">我来写评价</div>

      <div class="form-item">
        <label>评分</label>
        <star-rating v-model="newReview.rating"></star-rating>
        <span class="rating-display">{{ newReview.rating }}</span>
      </div>

      <div class="form-item">
        <label>评价内容</label>
        <textarea
          v-model="newReview.content"
          placeholder="分享您的观剧体验..."
          :maxlength="1000"
        ></textarea>
        <span class="char-count">{{ newReview.content.length }}/1000</span>
      </div>

      <div class="action-btns">
        <button
          @click="submitReview"
          :disabled="!isValidReview"
          class="submit-btn"
        >发布评价
        </button>
        <button @click="clearReview" class="clear-btn">清空</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import StarRating from '@/components/common/StarRating.vue';
import {
  getReviewsByPerformance,
  getReviewStatistics,
  createReview,
  checkUserReviewed,
  deleteReview,
  updateReview
} from '@/api/review';

const route = useRoute();
const performanceId = Number(route.params.id) || 1; // 使用默认ID或提供空数据处理

const showName = ref('剧目名称'); // 将动态获取剧目名称
const reviews = ref([]);
interface ReviewStatistics {
  totalCount: number;
  averageRating: number;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
  [key: string]: number; // 支持动态属性访问
}

const reviewStatistics = ref<ReviewStatistics>({
  totalCount: 0,
  averageRating: 0,
  rating1Count: 0,
  rating2Count: 0,
  rating3Count: 0,
  rating4Count: 0,
  rating5Count: 0
});

const newReview = reactive({
  content: '',
  rating: 0,
});

// 分页相关
const currentPage = ref(0);
const pageSize = ref(10);
const totalPages = ref(0);
const totalCount = ref(0);

// 筛选
const selectedRating = ref(null);
const hasReviewed = ref(false);

// 计算属性
const isValidReview = computed(() => {
  return newReview.rating > 0 && newReview.content.trim().length >= 1;
});

const visiblePages = computed(() => {
  const pages = [];
  const maxPages = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxPages / 2));
  const end = Math.min(totalPages.value, start + maxPages - 1);

  if (end - start < maxPages - 1) {
    start = Math.max(1, end - maxPages + 1);
  }

  if (start > 1) pages.push(1);
  if (start > 2) pages.push(-1); // 省略号

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (end < totalPages.value - 1) pages.push(-1); // 省略号
  if (end < totalPages.value) pages.push(totalPages.value);

  return pages;
});

// 格式化函数
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 不再需要用户身份检查（因为不需要登录）
const isCurrentUser = (userId: number) => {
  return true; // 允许所有人操作
};

const getRatingPercentage = (rating: number) => {
  const count = reviewStatistics.value[`rating${rating}Count`] || 0;
  const total = reviewStatistics.value.totalCount || 1;
  return parseFloat(((count / total) * 100).toFixed(1));
};

// API调用函数
const loadReviews = async () => {
  try {
    const [reviewsData, statsData] = await Promise.all([
      getReviewsByPerformance(performanceId, currentPage.value, pageSize.value, selectedRating.value),
      getReviewStatistics(performanceId)
    ]);

    reviews.value = reviewsData.content || [];
    totalPages.value = reviewsData.totalPages || 0;
    totalCount.value = reviewsData.totalElements || 0;

    reviewStatistics.value = {
      totalCount: statsData.totalCount || 0,
      averageRating: parseFloat((statsData.averageRating || 0).toFixed(1)),
      rating1Count: statsData.rating1Count || 0,
      rating2Count: statsData.rating2Count || 0,
      rating3Count: statsData.rating3Count || 0,
      rating4Count: statsData.rating4Count || 0,
      rating5Count: statsData.rating5Count || 0
    };
  } catch (error) {
    console.error('加载评价失败:', error);
    reviews.value = [];
    totalPages.value = 0;
    totalCount.value = 0;
  }
};

const loadReviewStats = async () => {
  try {
    const statsData = await getReviewStatistics(performanceId);
    reviewStatistics.value = {
      ...statsData,
      averageRating: parseFloat(statsData.averageRating.toFixed(1))
    };
  } catch (error) {
    console.error('更新评价统计失败:', error);
  }
};

const loadIfReviewed = async () => {
  try {
    hasReviewed.value = await checkUserReviewed(performanceId);
  } catch (error) {
    console.error('检查评价状态失败:', error);
  }
};

// 事件处理函数
const filterByRating = (rating: number | null) => {
  selectedRating.value = rating;
  currentPage.value = 0;
  loadReviews();
};

const changePage = (page: number) => {
  if (page >= 0 && page < totalPages.value) {
    currentPage.value = page;
    loadReviews();
  }
};

const submitReview = async () => {
  if (!isValidReview.value) {
    console.log('验证不通过，评分:', newReview.rating, '内容:', newReview.content);
    return;
  }

  try {
    console.log('开始提交评价:', {
      performanceId: performanceId,
      content: newReview.content,
      rating: newReview.rating
    });

    const response = await createReview({
      performanceId,
      content: newReview.content,
      rating: newReview.rating
    });

    console.log('评价提交成功:', response);
    clearReview();

    // 立即添加到当前列表，避免等待重新加载
    const newReviewItem = {
      id: response.id,
      content: response.content,
      rating: response.rating,
      createdAt: response.createdAt,
      performanceId: response.performanceId,
      username: response.username || '匿名用户',
      userImage: response.userImage || null
    };

    reviews.value.unshift(newReviewItem);

    // 更新统计数据
    await loadReviewStats();

    // 可选：刷新全部列表（但主要使用上方手动添加）
    // await loadReviews();

  } catch (error) {
    console.error('提交评价失败:', error);
    alert('评价提交失败: ' + (error.response?.data?.message || error.message || '未知错误'));
  }
};

const editReview = async (review: any) => {
  console.log('编辑评价:', review);
  newReview.content = review.content;
  newReview.rating = review.rating;
};

const deleteReviewInternal = async (reviewId: number) => {
  try {
    console.log('删除评价:', reviewId);
    // @ts-ignore - 确保使用正确的导入
    const { deleteReview: deleteApi } = await import('@/api/review');
    await deleteApi(reviewId);
    await loadReviews();
    alert('评价删除成功');
  } catch (error) {
    console.error('删除评价失败:', error);
    alert('删除评价失败: ' + (error.response?.data?.message || error.message || '未知错误'));
  }
};

const clearReview = () => {
  newReview.content = '';
  newReview.rating = 0;
};

const editMyReview = async () => {
  // 获取用户自己对该剧目的评价并填充表单
  // 这需要额外的API来获取用户自己的具体评价
};

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadReviews()
    // loadIfReviewed() - 不再需要检查是否已评价，因为没有登录机制
  ]);
});
</script>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-width: 900px;
  padding-bottom: 80px;
}

.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.show-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 4px;
}

.subtitle-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 900px;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 18px;
  color: #333;
  font-weight: 500;
}

.avg-rating {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #333;
  background: #f8f9fa;
  padding: 8px 16px;
  border-radius: 20px;
}

.avg-num {
  margin-left: 4px;
  font-weight: bold;
  color: #bf5f08;
}

.divider {
  width: 100%;
  height: 1px;
  background: #eee;
  margin: 20px 0;
}

/* 评分分布图 */
.rating-distribution {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}

.rating-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rating-label {
  width: 40px;
  font-size: 12px;
  color: #666;
}

.bar-container {
  flex: 1;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ff9500);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.bar.active {
  background: linear-gradient(90deg, #bf5f08, #d07018);
}

.rating-count {
  width: 30px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

/* 筛选器 */
.filter-section {
  width: 100%;
  max-width: 900px;
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.filter-btn:hover {
  border-color: #bf5f08;
  color: #bf5f08;
}

.filter-btn.active {
  background: #bf5f08;
  color: white;
  border-color: #bf5f08;
}

/* 评价列表 */
.reviews-scroll {
  width: 100%;
  max-width: 900px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.review-item {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.review-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.user-name {
  font-weight: bold;
  color: #333;
}

.review-date {
  font-size: 12px;
  color: #999;
}

.user-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.review-info {
  flex: 1;
}

.review-content {
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  margin-bottom: 12px;
}

.review-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.edit:hover {
  border-color: #007bff;
  color: #007bff;
}

.action-btn.delete:hover {
  border-color: #dc3545;
  color: #dc3545;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
}

.page-btn:hover:not(:disabled) {
  border-color: #bf5f08;
  color: #bf5f08;
}

.page-btn.active {
  background: #bf5f08;
  color: white;
  border-color: #bf5f08;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ellipsis {
  padding: 4px;
  color: #666;
}

/* 表单 */
.new-review-section {
  width: 600px;
  max-width: 90%;
  background: #f8f9fa;
  border-radius: 12px;
  padding: 30px;
  margin-top: 20px;
}

.new-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
}

.char-count {
  float: right;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.rating-display {
  margin-left: 8px;
  font-weight: bold;
  color: #bf5f08;
}

.submit-btn,
.clear-btn {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn {
  background: #bf5f08;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #9c4e07;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background: white;
  color: #666;
  border: 1px solid #ccc;
}

.clear-btn:hover {
  border-color: #999;
  color: #333;
}

.action-btns {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

/* 已评价提示 */
.reviewed-message {
  text-align: center;
  padding: 30px;
  color: #28a745;
}

.edit-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: white;
  color: #28a745;
  border: 1px solid #28a745;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #28a745;
  color: white;
}
</style>

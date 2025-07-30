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
          <div class="review-actions" v-if="isCurrentUser(review.username)">
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

    <!-- 编辑评价弹框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑评价"
      width="500px"
      :before-close="handleCloseEditDialog"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="评分" prop="rating">
          <star-rating v-model="editForm.rating"></star-rating>
          <span class="rating-display">{{ editForm.rating }}</span>
        </el-form-item>
        <el-form-item label="评价内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="4"
            maxlength="1000"
            show-word-limit
            placeholder="请分享您对这部剧目的看法..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="editLoading">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { eventBus } from '@/utils/eventBus';
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
  id: 0,
  content: '',
  rating: 0,
});

// 编辑弹框相关状态
const editDialogVisible = ref(false);
const editLoading = ref(false);
const editForm = reactive({
  id: 0,
  musicalId: 0,
  status: 0,
  content: '',
  rating: 0,
});
const editFormRef = ref();

// 编辑表单验证规则
const editRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '评分必须在1-5之间', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 1, max: 1000, message: '评价内容长度必须在1-1000字符之间', trigger: 'blur' }
  ]
};

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

const isCurrentUser = (username: string) => {
  return localStorage.getItem('username') === username; // 只允许创建人操作
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

    const response = await createReview({
      musicalId: performanceId,
      content: newReview.content,
      rating: newReview.rating
    });

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
    ElMessage.success('评价发布成功');


    // 更新统计数据
    await loadReviewStats();

    // 可选：刷新全部列表（但主要使用上方手动添加）
    await loadReviews();

};

const editReview = async (review: any) => {
  console.log('编辑评价:', review);
  // 填充编辑表单数据
  editForm.id = review.id;
  editForm.musicalId = review.musicalId;
  editForm.content = review.content;
  editForm.rating = review.rating;
  // 打开编辑弹框
  editDialogVisible.value = true;
};

const submitEdit = async () => {
  if (!editFormRef.value) return;

  try {
    await editFormRef.value.validate();
    editLoading.value = true;

    await updateReview(editForm.id, {
      musicalId: editForm.musicalId,
      content: editForm.content,
      rating: editForm.rating
    });

    ElMessage.success('评价更新成功');
    editDialogVisible.value = false;

    // 刷新评价列表和统计数据
    await Promise.all([
      loadReviews(),
      loadReviewStats()
    ]);
  } catch (error: any) {
    console.error('更新评价失败:', error);
    const errorMessage = error.response?.data?.message || error.message || '未知错误';
    ElMessage.error('更新评价失败: ' + errorMessage);
  } finally {
    editLoading.value = false;
  }
};

const handleCloseEditDialog = () => {
  editFormRef.value?.resetFields();
  editDialogVisible.value = false;
  // 清空编辑表单数据
  editForm.id = 0;
  editForm.content = '';
  editForm.rating = 0;
};

const deleteReviewInternal = async (reviewId: number) => {
  try {
    console.log('删除评价:', reviewId);
    const { deleteReview: deleteApi } = await import('@/api/review');
    await deleteApi(reviewId);
    await loadReviews();
    ElMessage.success('评价删除成功');
  } catch (error: any) {
    console.error('删除评价失败:', error);
    const errorMessage = error.response?.data?.message || error.message || '未知错误';
    ElMessage.error('删除评价失败: ' + errorMessage);
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
  eventBus.on('violation-changed', (pid) => {
    if (pid === performanceId) {
      loadReviewStats();   // 重新拉统计
      loadReviews();       // 重新拉列表
    }
  });
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

/* 编辑弹框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.el-dialog .rating-display {
  margin-left: 8px;
  font-weight: bold;
  color: #bf5f08;
}
</style>

<template>
  <div class="my-reviews">
    <div class="page-header">
      <h2>我的评价</h2>
      <p>查看和管理您发表的所有评价</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="reviews.length === 0" class="empty-state">
      <el-empty description="暂无评价记录">
        <el-button type="primary" @click="$router.push('/shows')">
          去评价剧目
        </el-button>
      </el-empty>
    </div>

    <!-- 评价列表 -->
    <div v-else>
      <div class="reviews-list">
        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <div class="show-info">
              <h4>
                <router-link
                  :to="`/shows/${review.musicalId}`"
                  class="musical-link"
                >
                  {{ review.musicalName }}
                </router-link>
              </h4>
              <span class="review-date">{{ formatDate(review.createdAt) }}</span>
            </div>
            <div class="rating">
              <el-rate
                v-model="review.rating"
                disabled
                show-score
                text-color="#ff9900"
                :score-template="`{value}分`"
              />
            </div>
          </div>
          
          <div class="review-content">
            <p>{{ review.content }}</p>
          </div>

          <div class="review-actions">
            <el-button 
              type="primary" 
              text 
              size="small"
              @click="editReview(review)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              type="danger" 
              text 
              size="small"
              @click="deleteReview(review.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalElements"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 编辑评价对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑评价"
      width="500px"
      :before-close="handleCloseEditDialog"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="editForm.rating" :max="5" />
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
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="editLoading">
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Link } from '@element-plus/icons-vue'
import { getMyReviews, updateReview, deleteReview } from '@/api/review'

interface Review {
  id: number
  content: string
  rating: number
  musicalName: string
  createdAt: string
  musicalId: number
}

// 数据状态
const reviews = ref<Review[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalElements = ref(0)

// 编辑对话框状态
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({
  id: 0,
  content: '',
  rating: 5,
  performanceId: 0
})
const editFormRef = ref()

// 表单验证规则
const editRules = {
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 1, max: 1000, message: '评价内容长度需在1-1000字符之间', trigger: 'blur' }
  ],
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' },
    { type: 'number', min: 1, max: 5, message: '评分需在1-5分之间', trigger: 'change' }
  ]
}

// 获取我的评价列表
const fetchMyReviews = async () => {
  loading.value = true
  try {
    const response = await getMyReviews(currentPage.value - 1, pageSize.value)
    reviews.value = response.content || []
    totalElements.value = response.totalElements || 0
  } catch (error) {
    console.error('获取评价列表失败:', error)
    ElMessage.error('获取评价列表失败，请稍后重试')
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

// 编辑评价
const editReview = (review: Review) => {
  editForm.value = {
    id: review.id,
    content: review.content,
    rating: review.rating,
    musicalId: review.musicalId
  }
  editDialogVisible.value = true
}

// 删除评价
const deleteReview = async (reviewId: number) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条评价吗？删除后将无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteReview(reviewId)
    ElMessage.success('评价删除成功')
    await fetchMyReviews()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除评价失败:', error)
      ElMessage.error('删除评价失败，请稍后重试')
    }
  }
}

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
    editLoading.value = true

    await updateReview(editForm.value.id, {
      content: editForm.value.content,
      rating: editForm.value.rating
    })

    ElMessage.success('评价更新成功')
    editDialogVisible.value = false
    await fetchMyReviews()
  } catch (error) {
    console.error('更新评价失败:', error)
    ElMessage.error('更新评价失败，请稍后重试')
  } finally {
    editLoading.value = false
  }
}

// 关闭编辑对话框
const handleCloseEditDialog = () => {
  editFormRef.value?.resetFields()
  editDialogVisible.value = false
}

// 分页相关方法
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchMyReviews()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchMyReviews()
}

// 初始化加载
onMounted(() => {
  fetchMyReviews()
})
</script>

<style scoped>
.my-reviews {
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

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e4e7ed;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.show-info h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
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

.review-date {
  font-size: 14px;
  color: #909399;
}

.review-content {
  margin-bottom: 16px;
  line-height: 1.6;
}

.review-content p {
  margin: 0;
  color: #606266;
  font-size: 15px;
}

.review-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.pagination-container {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

@media screen and (max-width: 768px) {
  .my-reviews {
    padding: 10px;
  }
  
  .review-card {
    padding: 16px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .review-actions {
    justify-content: flex-start;
  }
}
</style>
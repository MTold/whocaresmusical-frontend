<template>
  <div class="review-manager">
    <!-- 标题 -->
    <h1 class="page-title">评价管理</h1>

    <!-- Tab 切换：已通过 | 待审核 | 违规信息 -->
    <div class="tabs-wrapper">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="已通过"  name="passed" />
        <el-tab-pane label="待审核"  name="pending" />
        <el-tab-pane label="违规信息" name="violation" />
      </el-tabs>
    </div>

    <!-- 工具栏：关键字 + 筛选按钮 -->
    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="请输入关键字（剧目 / 内容）"
        style="width: 240px"
        @keyup.enter="loadReviews"
      />
      <el-button type="primary" @click="loadReviews">搜索</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      stripe
      style="width: 100%; margin-top: 16px"
    >
      <el-table-column prop="id"        label="编号" width="80" />
      <el-table-column prop="showName"  label="剧目" width="180" />
      <el-table-column prop="username"  label="用户" width="120" />
      <el-table-column prop="rating"    label="评分" width="80" align="center">
        <template #default="{ row }">
          <star-rating :model-value="row.rating" :readonly="true" />
        </template>
      </el-table-column>
      <el-table-column prop="content"   label="评价内容" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="时间" width="160">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="openDetail(row)">详情</el-button>
          <el-button
            v-if="row.status === 0"
            size="small"
            type="success"
            @click="approve(row.id)"
          >通过</el-button>
          <el-button
            v-if="row.status === 0"
            size="small"
            type="danger"
            @click="violate(row.id)"
          >违规</el-button>
          <el-button
            size="small"
            type="danger"
            plain
            @click="remove(row.id)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="loadReviews"
      style="margin-top: 24px; justify-content: center"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getReviewsByPerformance } from '@/api/review' // 复用已有接口
import StarRating from '@/components/common/StarRating.vue'

type TabName = 'passed' | 'pending' | 'violation'
interface ReviewItem {
  id: number
  showName: string
  username: string
  rating: number
  content: string
  createdAt: string
  status: 0 | 1 | 2
}

const activeTab = ref<TabName>('passed')
const keyword   = ref('')
const currentPage = ref(1)
const pageSize    = ref(10)
const total       = ref(0)
const tableData   = ref<ReviewItem[]>([])

const handleTabChange = () => {
  currentPage.value = 1
  loadReviews()
}

/* 把 Tab 转成后端需要的 status 数字 */
const tab2Status = (tab: TabName): 0 | 1 | 2 => {
  switch (tab) {
    case 'passed':    return 1
    case 'pending':   return 0
    case 'violation': return 2
    default:          return 1
  }
}

/* 加载列表 */
const loadReviews = async () => {
  try {

    const res = await getReviewsByPerformance(
    0,           // 剧目 ID
    currentPage.value - 1,
    pageSize.value,
    keyword.value
  )
    tableData.value = res.content || []
    total.value     = res.totalElements || 0
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

/* 审核 / 违规 / 删除 */
const approve = async (id: number) => {
  await updateStatus(id, 1, '已通过')
}
const violate = async (id: number) => {
  await updateStatus(id, 2, '已标记违规')
}
const remove = async (id: number) => {
  try {
    await ElMessageBox.confirm('确认删除该评价？', '提示', { type: 'warning' })
    // 调用后台 deleteReview(id)
    ElMessage.success('删除成功')
    loadReviews()
  } catch {}
}

const updateStatus = async (id: number, status: 0 | 1 | 2, msg: string) => {
  // 后台接口示例： await updateReviewStatus(id, status)
  ElMessage.success(msg)
  loadReviews()
}

const openDetail = (row: ReviewItem) => {
  // 弹出详情抽屉或页面跳转
  console.log(row)
}

const formatDate = (d: string) =>
  new Date(d).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })

onMounted(loadReviews)
</script>

<style scoped>
.page-title {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #59310e;
  position: absolute;   /* 或 fixed，视需求而定 */
  top: 10px;
  left: 22%;
  transform: translateX(-50%);
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  position: absolute;   /* 或 fixed，视需求而定 */
  top: 100px;
  right: 25%;
  transform: translateX(-50%);
}
.tabs-wrapper {
  display: flex;
  justify-content: center;
  margin: 0 auto 24px;
  max-width: 600px;
  position: absolute;   /* 或 fixed，视需求而定 */
  top: 100px;
  left: 25%;
  transform: translateX(-50%);
}
</style>

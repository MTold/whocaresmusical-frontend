<template>
  <div class="review-manager">
    <!-- 标题 -->
    <h1 class="page-title">评价管理</h1>

    <!-- 顶部功能区 -->
    <div class="control-area">
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="已通过" name="passed" />
        <el-tab-pane label="待审核" name="pending" />
        <el-tab-pane label="违规信息" name="violation" />
      </el-tabs>

      <!-- 占位空白，宽度就是你想留的距离 -->
      <span class="divider"></span>

      <!-- 搜索框 -->
      <div class="search-wrapper">
        <el-input
          v-model="keyword"
          placeholder="请输入关键字（剧目/内容）"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
        :data="tableData"
        stripe
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="编号" width="80" align="center" />
        <el-table-column prop="showName" label="剧目" width="180" show-overflow-tooltip />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="rating" label="评分" width="100" align="center">
          <template #default="{ row }">
            <star-rating
              :model-value="row.rating"
              :readonly="true"
              :star-size="20"
            />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
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
              @click="reject(row.id)"
            >拒绝</el-button>
            <el-button
              size="small"
              type="danger"
              plain
              @click="handleDelete(row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StarRating from '@/components/common/StarRating.vue'
import {
  getReviewsByPerformance,
  updateReviewStatus,
  deleteReview,
  createReview
} from '@/api/review'  // 确保路径正确

export default {
  components: {
    StarRating
  },
  setup() {
    // 状态管理
    const activeTab = ref('pending') // 'passed'|'pending'|'violation'
    const keyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const tableData = ref([])
    const newReview = ref({
      performanceId: '',
      content: '',
      rating: 0})
    const statusMap = {
      0: '待审核',
      1: '已通过',
      2: '违规'
    }

    // 数据获取
    const fetchData = async () => {
      loading.value = true
      try {
        const res = await getReviewsByPerformance(
          0, // 明确传递数字 0 而不是对象
          currentPage.value - 1,
          pageSize.value,
          keyword.value,
          activeTab.value === 'passed' ? 1 :
          activeTab.value === 'violation' ? 2 : 0
        )

        tableData.value = res.content.map(item => ({
          id: item.id,
          showName: item.performanceName,
          username: item.username,
          rating: item.rating,
          content: item.content,
          createdAt: item.createdAt,
          status: item.status || 0
        }))
        total.value = res.totalElements
      } catch (error) {
        ElMessage.error('数据加载失败')
        console.error('API 请求错误:', error)
      } finally {
        loading.value = false
      }
    }

    // 创建评价
    const createReview = async () => {
      try {
        await createReview(newReview.value)
        ElMessage.success('评价创建成功')
        fetchData()
      } catch (error) {
        ElMessage.error('创建失败')
      }
    }

    // Tab状态转换
    const getStatusByTab = (tab) => {
      const map = {
        'passed': 1,
        'pending': 0,
        'violation': 2
      }
      return map[tab] || 0
    }

    // 事件处理
    const handleTabChange = () => {
      currentPage.value = 1
      fetchData()
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchData()
    }

    const handleSizeChange = (size) => {
      pageSize.value = size
      fetchData()
    }

    const handlePageChange = (page) => {
      currentPage.value = page
      fetchData()
    }

    // 操作处理
    const approve = async (id) => {
      try {
        await updateReviewStatus(id, 1)
        ElMessage.success('审核通过')
        fetchData()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    const reject = async (id) => {
      try {
        await updateReviewStatus(id, 2)
        ElMessage.success('已标记为违规')
        fetchData()
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm('确定删除该评价吗？', '警告', {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await deleteReview(id)
        ElMessage.success('删除成功')
        fetchData()
      } catch (error) {
        // 用户取消操作
      }
    }

    const openDetail = (row) => {
      // 实现详情查看逻辑
      console.log('查看评价详情:', row)
    }

    // 辅助函数
    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    // 生命周期
    onMounted(() => {
      fetchData()
    })

    return {
      activeTab,
      keyword,
      currentPage,
      pageSize,
      total,
      loading,
      tableData,
      newReview,
      statusMap,
      handleTabChange,
      handleSearch,
      handleSizeChange,
      handlePageChange,
      approve,
      reject,
      handleDelete,
      openDetail,
      formatDate,
      createReview
    }
  }
}
</script>

<style scoped>
/* ===== 整体容器
.review-manager {
  padding: 20px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  margin-top: 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;

} ===== */

/* ===== 标题 ===== */
.page-title {
  font-size: 32px;
  font-weight: bold;
  color: #59310e;
  text-align: center;
  margin: 0;
  position: absolute;
  top: 15px;
  left: 22%;
  transform: translateX(-50%);
}

/* ===== 顶部功能区 ===== */
.control-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  position: absolute;
  top: 10%;
  left: 40%;
  transform: translateX(-50%);
}

/* 占位空白，宽度随意调 */
.divider {
  width: 60px;
  flex-shrink: 0;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-wrapper .el-input {
  width: 300px;
}

/* ===== 表格 & 分页 ===== */
.table-wrapper {
  margin-top: 0;
  position: absolute;
  top: 20%;
  left: 53%;
  transform: translateX(-50%);
}
.table-wrapper .el-table {
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

/* ===== 响应式：窄屏时纵向排列 ===== */
@media (max-width: 768px) {
  .control-area {
    flex-direction: column;
    align-items: flex-start;
  }
  .search-wrapper {
    width: 100%;
    margin-top: 10px;
  }
  .search-wrapper .el-input {
    width: 100%;
  }
}

/* ===== 颜色调整 ===== */
.el-tabs__item {
  color: #bfa074; /* 标签颜色 */
}
.el-tabs__item.is-active {
  color: #a0522d; /* 激活标签颜色 */
}
.el-input__inner {
  border-color: #bfa074; /* 输入框边框颜色 */
}
.el-input__inner:focus {
  border-color: #a0522d; /* 输入框聚焦边框颜色 */
}
.el-button {
  color: #ffffff; /* 按钮文字颜色 */
  background-color: #e6c9b0; /* 按钮背景颜色 */
  border-color: #a0522d; /* 按钮边框颜色 */
}
.el-button.is-active,
.el-button:active {
  background-color: #a0522d; /* 按钮激活背景颜色 */
  border-color: #7a3a1d; /* 按钮激活边框颜色 */
}
.el-button--primary {
  background-color: #a0522d; /* 主要按钮背景颜色 */
  border-color: #7a3a1d; /* 主要按钮边框颜色 */
}
.el-button--primary.is-active,
.el-button--primary:active {
  background-color: #7a3a1d; /* 主要按钮激活背景颜色 */
  border-color: #59310e; /* 主要按钮激活边框颜色 */
}
.el-button--danger {
  background-color: #e74c3c; /* 危险按钮背景颜色 */
  border-color: #c0392b; /* 危险按钮边框颜色 */
}
.el-button--danger.is-active,
.el-button--danger:active {
  background-color: #c0392b; /* 危险按钮激活背景颜色 */
  border-color: #a93226; /* 危险按钮激活边框颜色 */
}
</style>

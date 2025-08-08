<template>
  <div class="admin-title-container">
    <h1 class="admin-page-title">评价管理</h1>
  </div>

  <div class="admin-page-container">

    <!-- 顶部功能区 -->
    <div class="admin-control-area">
      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="已通过" name="passed" />
        <el-tab-pane label="违规信息" name="violation" />
      </el-tabs>

      <!-- 占位空白 -->
      <span class="admin-divider"></span>

      <!-- 搜索框 -->
      <div class="admin-search-wrapper">
        <el-input
          v-model="keyword"
          placeholder="请输入关键字（剧目/内容）"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" @click="handleSearch" link>搜索</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="admin-table-wrapper">
      <el-table
        :data="tableData"
        border
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column
          fixed
          prop="id"
          label="编号"
          width="80"
        />
        <el-table-column
          prop="content"
          label="评价内容"
          width="400"
        />
        <el-table-column
          prop="rating"
          label="评分"
          width="170"
        >
          <template #default="{ row }">
            <star-rating :model-value="row.rating" :readonly="true" :star-size="20" />
          </template>
        </el-table-column>
        <el-table-column
          prop="performanceName"
          label="剧目"
          width="180"
          show-overflow-tooltip
        />
        <el-table-column
          prop="username"
          label="用户"
          width="120"
        />
        <el-table-column
          prop="createdAt"
          label="时间"
          width="160"
        >
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column
          fixed="right"
          label="操作"
          width="220"
          align="center"
        >
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openDetail(row)">
              查看
            </el-button>

            <el-button
              v-if="row.reviewStatus === 1"
              size="small"
              type="warning"
              link
              @click="reject(row.id)"
            >
              判为违规
            </el-button>

            <el-button
              v-if="row.reviewStatus === 2"
              size="small"
              type="success"
              link
              @click="approve(row.id)"
            >
              审核通过
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 评论详情对话框 -->
<el-dialog
  v-model="reviewDetailDialogVisible"
  title="评论详情"
  width="600px"
  destroy-on-close
  custom-class="review-dialog-bg"
>
  <div class="admin-detail-dialog">
    <div class="admin-detail-item">
      <span class="label">编号：</span>
      <span class="value">{{ currentReview.id }}</span>
    </div>
    <div class="admin-detail-item">
      <span class="label">用户：</span>
      <span class="value">{{ currentReview.username }}</span>
    </div>
    <div class="admin-detail-item">
      <span class="label">剧目：</span>
      <span class="value">{{ currentReview.performanceName }}</span>
    </div>
    <div class="admin-detail-item">
      <span class="label">评分：</span>
      <span class="value">{{ currentReview.rating }} 星</span>
    </div>
    <div class="admin-detail-item content">
      <span class="label">内容：</span>
      <div class="value">{{ currentReview.content }}</div>
    </div>
    <div class="admin-detail-item">
      <span class="label">时间：</span>
      <span class="value">{{ formatDate(currentReview.createdAt) }}</span>
    </div>
  </div>

  <template #footer>
    <span class="admin-dialog-footer">
      <el-button @click="reviewDetailDialogVisible = false">关闭</el-button>
    </span>
  </template>
</el-dialog>
      <!-- 分页 -->
      <div class="admin-pagination-wrapper">
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import StarRating from '@/components/common/StarRating.vue'
import {
  getReviewsByStatus,
  updateReviewStatus
} from '@/api/review'


const reviewDetailDialogVisible = ref(false)
const currentReview = ref({})

export default {
  components: {
    StarRating
  },
  setup() {
    // 状态管理
    const activeTab = ref('')// 'passed'|'pending'|'violation'
    //关键词const keyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(5)
    const total = ref(0)
    const loading = ref(false)
    const tableData = ref([])
    //给定数据
    // const tableData = ref([{"content":[{"id":19,"content":"test","rating":4,"userId":11,"performanceId":2,"createdAt":"2025-07-22T13:42:30.30847","updatedAt":"2025-07-22T13:42:30.308502","reviewStatus":1},{"id":18,"content":"test","rating":5,"userId":null,"performanceId":2,"createdAt":"2025-07-22T13:41:00.116832","updatedAt":"2025-07-22T13:41:00.116928","reviewStatus":1},{"id":17,"content":"5","rating":4,"userId":null,"performanceId":1,"createdAt":"2025-07-22T13:37:16.847169","updatedAt":"2025-07-22T13:37:16.847211","reviewStatus":1},{"id":16,"content":"5","rating":5,"userId":11,"performanceId":1,"createdAt":"2025-07-22T13:30:15.557556","updatedAt":"2025-07-22T13:30:15.557605","reviewStatus":1},{"id":10,"content":"excellent","rating":5,"userId":null,"performanceId":1,"createdAt":"2025-07-19T16:24:26.572034","updatedAt":"2025-07-19T16:24:26.572034","reviewStatus":1},{"id":9,"content":"great","rating":5,"userId":null,"performanceId":2,"createdAt":"2025-07-19T16:15:59.956511","updatedAt":"2025-07-19T16:15:59.956511","reviewStatus":1},{"id":4,"content":"1","rating":4,"userId":null,"performanceId":1,"createdAt":"2025-07-19T13:33:37.253239","updatedAt":"2025-07-19T13:33:37.253239","reviewStatus":1},{"id":3,"content":"1","rating":5,"userId":null,"performanceId":1,"createdAt":"2025-07-19T13:32:44.804494","updatedAt":"2025-07-19T13:32:44.804494","reviewStatus":1}],"pageable":{"pageNumber":0,"pageSize":10,"sort":{"empty":false,"sorted":true,"unsorted":false},"offset":0,"paged":true,"unpaged":false},"last":true,"totalElements":8,"totalPages":1,"size":10,"number":0,"sort":{"empty":false,"sorted":true,"unsorted":false},"first":true,"numberOfElements":8,"empty":false}])

  // 动态列
const columns = computed(() => {
  const base = [
    { prop: 'id', label: '编号', width: 80, fixed: true },
    { prop: 'content', label: '评价内容', width: 400 },
    { prop: 'rating', label: '评分', width: 170, slot: 'rating' },
    { prop: 'performanceName', label: '剧目', width: 180 },
    { prop: 'username', label: '用户', width: 120 },
    { prop: 'createdAt', label: '时间', width: 160, slot: 'time' }
  ]
  if (activeTab.value === 'pending') {
    base.push({
      label: '操作',
      width: 220,
      fixed: 'right',
      align: 'center',
      slot: 'action'
    })
  }
  return base
})


    // 获取评价数据
    const fetchData = async () => {
    loading.value = true;
    try {
      // 获取当前Tab对应的状态值
        const targetStatus = getStatusByTab(activeTab.value);

    // 调用API获取数据
    const response = await getReviewsByStatus(targetStatus, currentPage.value - 1, pageSize.value);
        tableData.value = response.content.map(item => ({
          id: item.id,
          content: item.content,
          rating: item.rating,
          performanceName: item.musicalName || '未知剧目',
          username: item.username || '匿名用户',
          createdAt: item.createdAt,
          reviewStatus: item.reviewStatus

    }));


    total.value = response.totalElements || 0;
    } catch (error) {
      console.error('数据加载错误:', error);
      ElMessage.error('数据加载失败: ' + error.message);
      tableData.value = [];
      total.value = 0;
   } finally {
      loading.value = false;
    }
  };


    // Tab状态转换
    const getStatusByTab = (tab) => {
      const map = {
        'passed': 1,
        'violation': 2
      }
      return map[tab] || 1
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
      currentPage.value = 1
      fetchData()
    }

    const handlePageChange = (page) => {
      currentPage.value = page
      fetchData()
    }

    // 操作处理
const approve = async (id) => {
  try {
    await ElMessageBox.confirm('确定通过该评价吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    });
    // 调用API将评价状态更新为1(通过)
    await updateReviewStatus(id, 1);
    ElMessage.success('审核通过');
    // 刷新数据
    await fetchData();

  } catch (error) {
    // 只有当错误不是用户取消操作时才显示错误消息
    if (error !== 'cancel') {
      ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message));
    }
  }
};

const reject = async (id) => {
  try {
    await ElMessageBox.confirm('确定拒绝该评价吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    });
    // 调用API将评价状态更新为2(拒绝/违规)
    await updateReviewStatus(id, 2);
    ElMessage.success('已标记为违规');
    // 刷新数据
    await fetchData();
    // 通知用户端刷新统计
    //eventBus.emit('violation-changed', performanceId);
  } catch (error) {
    // 只有当错误不是用户取消操作时才显示错误消息
    if (error !== 'cancel') {
      ElMessage.error('操作失败: ' + (error.response?.data?.message || error.message));
    }
  }
};

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
        if (error !== 'cancel') {
          ElMessage.error('删除失败: ' + (error.response?.data?.message || error.message))
        }
      }
    }

    const openDetail = (row) => {
      //ElMessage.info(`查看评价详情: ${row.content}`)
      currentReview.value = row
      reviewDetailDialogVisible.value = true
    }

    // 辅助函数
    const formatDate = (dateStr) => {
      try {
        return new Date(dateStr).toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (e) {
        return dateStr
      }
    }

    // 生命周期
    onMounted(() => {
      fetchData()
    })

    return {
      activeTab,
      //keyword,
      currentPage,
      pageSize,
      total,
      loading,
      tableData,
      reviewDetailDialogVisible,
      currentReview,
      handleTabChange,
      handleSearch,
      handleSizeChange,
      handlePageChange,
      approve,
      reject,
      handleDelete,
      openDetail,
      formatDate,
    }
  }
}
</script>

<style scoped>
/* 使用全局admin-common.css样式 */
</style>

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
        <el-button type="primary" @click="handleSearch" link>搜索</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
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
          width="300"
        />
        <el-table-column
          prop="rating"
          label="评分"
          width="100"
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
        <el-table-column
          v-if="activeTab === 'pending'"
          fixed="right"
          label="操作"
          width="220"
          align="center"

        >
          <template #default="{ row }">
  <el-button
    size="small"
    type="success"
    link
    @click="approve(row.id)"
    v-if="row.reviewStatus === 0">通过</el-button>

  <el-button
    size="small"
    type="danger"
    link
    @click="reject(row.id)"
    v-if="row.reviewStatus === 0" >拒绝</el-button>
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
import review, {
  getReviewsByStatus,
  updateReviewStatus,
  deleteReview
} from '@/api/review'

export default {
  components: {
    StarRating
  },
  setup() {
    // 状态管理
    const activeTab = ref('')// 'passed'|'pending'|'violation'
    //关键词const keyword = ref('')
    const currentPage = ref(1)
    const pageSize = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const tableData = ref([])
    //给定数据
    // const tableData = ref([{"content":[{"id":19,"content":"test","rating":4,"userId":11,"performanceId":2,"createdAt":"2025-07-22T13:42:30.30847","updatedAt":"2025-07-22T13:42:30.308502","reviewStatus":1},{"id":18,"content":"test","rating":5,"userId":null,"performanceId":2,"createdAt":"2025-07-22T13:41:00.116832","updatedAt":"2025-07-22T13:41:00.116928","reviewStatus":1},{"id":17,"content":"5","rating":4,"userId":null,"performanceId":1,"createdAt":"2025-07-22T13:37:16.847169","updatedAt":"2025-07-22T13:37:16.847211","reviewStatus":1},{"id":16,"content":"5","rating":5,"userId":11,"performanceId":1,"createdAt":"2025-07-22T13:30:15.557556","updatedAt":"2025-07-22T13:30:15.557605","reviewStatus":1},{"id":10,"content":"excellent","rating":5,"userId":null,"performanceId":1,"createdAt":"2025-07-19T16:24:26.572034","updatedAt":"2025-07-19T16:24:26.572034","reviewStatus":1},{"id":9,"content":"great","rating":5,"userId":null,"performanceId":2,"createdAt":"2025-07-19T16:15:59.956511","updatedAt":"2025-07-19T16:15:59.956511","reviewStatus":1},{"id":4,"content":"1","rating":4,"userId":null,"performanceId":1,"createdAt":"2025-07-19T13:33:37.253239","updatedAt":"2025-07-19T13:33:37.253239","reviewStatus":1},{"id":3,"content":"1","rating":5,"userId":null,"performanceId":1,"createdAt":"2025-07-19T13:32:44.804494","updatedAt":"2025-07-19T13:32:44.804494","reviewStatus":1}],"pageable":{"pageNumber":0,"pageSize":10,"sort":{"empty":false,"sorted":true,"unsorted":false},"offset":0,"paged":true,"unpaged":false},"last":true,"totalElements":8,"totalPages":1,"size":10,"number":0,"sort":{"empty":false,"sorted":true,"unsorted":false},"first":true,"numberOfElements":8,"empty":false}])


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
          performanceName: item.performanceName || '未知剧目',
          username: item.username || '匿名用户',
          createdAt: item.createdAt,
          reviewStatus: item.reviewStatus
    // 使用静态测试数据代替API调用
    /*const testData = {
      content: [
        {
          id: 19,
          content: "test",
          rating: 4,
          userId: 11,
          performanceId: 2,
          createdAt: "2025-07-22T13:42:30.30847",
          updatedAt: "2025-07-22T13:42:30.308502",
          reviewStatus: 1
        },
        {
      "id": 18,
      "content": "test",
      "rating": 5,
      "userId": null,
      "performanceId": 2,
      "createdAt": "2025-07-22T13:41:00.116832",
      "updatedAt": "2025-07-22T13:41:00.116928",
      "reviewStatus": 1
    },
    {
      "id": 17,
      "content": "5",
      "rating": 4,
      "userId": null,
      "performanceId": 1,
      "createdAt": "2025-07-22T13:37:16.847169",
      "updatedAt": "2025-07-22T13:37:16.847211",
      "reviewStatus": 1
    },
    {
      "id": 16,
      "content": "5",
      "rating": 5,
      "userId": 11,
      "performanceId": 1,
      "createdAt": "2025-07-22T13:30:15.557556",
      "updatedAt": "2025-07-22T13:30:15.557605",
      "reviewStatus": 1
    },
    {
      "id": 10,
      "content": "excellent",
      "rating": 5,
      "userId": null,
      "performanceId": 1,
      "createdAt": "2025-07-19T16:24:26.572034",
      "updatedAt": "2025-07-19T16:24:26.572034",
      "reviewStatus": 1
    },
    {
      "id": 9,
      "content": "great",
      "rating": 5,
      "userId": null,
      "performanceId": 2,
      "createdAt": "2025-07-19T16:15:59.956511",
      "updatedAt": "2025-07-19T16:15:59.956511",
      "reviewStatus": 1
    },
    {
      "id": 4,
      "content": "1",
      "rating": 4,
      "userId": null,
      "performanceId": 1,
      "createdAt": "2025-07-19T13:33:37.253239",
      "updatedAt": "2025-07-19T13:33:37.253239",
      "reviewStatus": 1
    },
    {
      "id": 3,
      "content": "1",
      "rating": 5,
      "userId": null,
      "performanceId": 1,
      "createdAt": "2025-07-19T13:32:44.804494",
      "updatedAt": "2025-07-19T13:32:44.804494",
      "reviewStatus": 1
    },
    // 待审核的评价 (status=0)
        { id: 20, content: "新评价", rating: 3, userId: 12, performanceId: 3, createdAt: "2025-07-23T10:00:00.000000", updatedAt: "2025-07-23T10:00:00.000000", reviewStatus: 0 },

        // 违规的评价 (status=2)
        { id: 21, content: "垃圾广告", rating: 1, userId: null, performanceId: 1, createdAt: "2025-07-22T14:00:00.000000", updatedAt: "2025-07-22T14:00:00.000000", reviewStatus: 2 }

        // 其他测试数据项...
      ],

    };

    // 获取当前Tab对应的状态值
    const targetStatus = getStatusByTab(activeTab.value);

    // 筛选出符合当前状态的数据
    const filteredContent = testData.content.filter(
      item => item.reviewStatus === targetStatus
    );

    // 转换数据结构
    tableData.value = filteredContent.map(item => ({
      id: item.id,
      content: item.content,
      rating: item.rating,
      performanceName: `剧目ID: ${item.performanceId}`,
      username: item.userId ? `用户${item.userId}` : '匿名用户',
      createdAt: item.createdAt,
      reviewStatus: item.reviewStatus*/
    }));


    total.value = review.totalElements;
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
      ElMessage.info(`查看评价详情: ${row.content}`)
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
.review-manager {
  padding: 20px;
  background: #ffffff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #59310e;
  margin-bottom: 20px;
  text-align: center;
}

.control-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  /* 占位空白，宽度随意调 */
.divider {
  width: 60px;
  flex-shrink: 0;
}
  flex-wrap: wrap;
  gap: 10px;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-wrapper .el-input {
  width: 300px;
}

.table-wrapper {
  margin-top: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .control-area {
    flex-direction: column;
    align-items: stretch;
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

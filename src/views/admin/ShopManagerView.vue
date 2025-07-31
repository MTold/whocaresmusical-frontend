<template>
  <div class="shop-manager">
    <!-- 标题 -->
    <h1 class="page-title">店铺管理</h1>

    <!-- 顶部功能区 -->
    <div class="control-area">
      <!-- 添加店铺按钮 -->
      <el-button type="primary" @click="openAddModal">
        <i class="fa fa-plus"></i> 添加店铺
      </el-button>

      <!-- 占位空白 -->
      <span class="divider"></span>

      <!-- 搜索框 -->
      <div class="search-wrapper">
        <el-input
          v-model="searchParams.shopName"
          placeholder="请输入店铺名称关键词"
          clearable
          @keyup.enter="ClickSearchShops"
          @clear="ClickSearchShops"
          class="search-input"
        />
        <el-input
          v-model="searchParams.theaterKeyword"
          placeholder="请输入剧院名称/位置关键词"
          clearable
          @keyup.enter="ClickSearchShops"
          @clear="ClickSearchShops"
          class="search-input"
        />
        <el-button type="primary" @click="ClickSearchShops">搜索</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
        :data="shopList"
        border
        style="width: 100%"
        v-loading="loading"
        empty-text="暂无店铺数据"
      >
        <el-table-column prop="shop.id" label="ID" width="80" fixed />
        <el-table-column prop="shop.name" label="店铺名称" width="200" show-overflow-tooltip />
        <el-table-column prop="shop.address" label="地址" width="300" show-overflow-tooltip />
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            {{ getCategoryLabel(row.shop.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="shop.gaodeId" label="高德ID" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.shop.gaodeId || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="关联剧院" width="300">
          <template #default="{ row }">
            <span v-for="theater in row.theaters" :key="theater.id" class="badge">
              {{ theater.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="openEditModal(row)">
              编辑
            </el-button>
            <el-button size="small" type="danger" link @click="confirmDelete(row.shop.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="totalShops"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 添加/编辑店铺对话框 -->
    <el-dialog
      v-model="isModalVisible"
      :title="isEditing ? '编辑店铺' : '添加店铺'"
      width="600px"
      destroy-on-close
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="店铺名称" prop="shop.name">
          <el-input v-model="formData.shop.name" placeholder="请输入店铺名称" />
        </el-form-item>
        <el-form-item label="店铺地址" prop="shop.address">
          <el-input v-model="formData.shop.address" placeholder="请输入店铺地址" />
        </el-form-item>
        <el-form-item label="图片URL" prop="shop.image">
          <el-input v-model="formData.shop.image" placeholder="可选，输入图片URL" />
        </el-form-item>
        <el-form-item label="高德ID" prop="shop.gaodeId">
          <el-input v-model="formData.shop.gaodeId" placeholder="可选，输入高德ID" />
        </el-form-item>
        <el-form-item label="店铺类型" prop="shop.category">
          <el-select v-model="formData.shop.category" placeholder="请选择店铺类型">
            <el-option label="餐饮" value="1" />
            <el-option label="住宿" value="2" />
            <el-option label="景点" value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="关联剧院" prop="theaterIds">
          <div v-for="(id, index) in formData.theaterIds" :key="index" class="theater-select-item">
            <el-select
              v-model="formData.theaterIds[index]"
              placeholder="请选择剧院"
              style="width: 80%"
            >
              <el-option
                v-for="theater in theaters"
                :key="theater.id"
                :label="`${theater.name}(${theater.locationName})`"
                :value="theater.id"
              />
            </el-select>
            <el-button
              v-if="index > 0"
              size="mini"
              type="danger"
              icon="Delete"
              @click="removeTheaterSelect(index)"
              style="margin-left: 10px"
            />
            <el-button
              v-if="index === formData.theaterIds.length - 1"
              size="mini"
              type="success"
              icon="Plus"
              @click="addTheaterSelect"
              style="margin-left: 10px"
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeModal">取消</el-button>
          <el-button type="primary" @click="handleFormSubmit">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive, nextTick } from 'vue'
import { ElMessage, ElMessageBox, ElForm, ElFormItem } from 'element-plus'
import { searchShops, getAllTheaters, addShop, updateShop, deleteShop } from '@/api/shop'
import type { Shop, ShopWithTheatersDTO, Theater, Page } from '@/api/shop'

// 类型定义
type ShopCategory = {
  value: 1 | 2 | 3
  label: string
}

// 状态管理
//const shopList = ref<ShopWithTheatersDTO[]>([])
const theaters = ref<Theater[]>([])
const loading = ref(false)
const error = ref('')

// 计算属性：店铺类型映射
const shopCategories = computed<ShopCategory[]>(() => [
  { value: 1, label: '餐饮' },
  { value: 2, label: '住宿' },
  { value: 3, label: '景点' },
])

// 获取分类标签
const getCategoryLabel = (category: number) => {
  return shopCategories.value.find((c) => c.value === category)?.label || '-'
}

// 页面状态
const searchParams = reactive({
  shopName: '',
  theaterKeyword: '',
})

const currentPage = ref(1)
const pageSize = ref(10)
const isModalVisible = ref(false)
const isEditing = ref(false)
const deleteShopId = ref(0)

// 计算属性：分页后的店铺列表
//const totalShops = computed(() => shopList.value.length)
const paginatedShops = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return shopList.value.slice(start, end)
})

// 表单数据与验证规则
const formData = reactive<ShopWithTheatersDTO>({
  shop: {
    id: 0,
    name: '',
    address: '',
    category: 1,
    image: '',
    gaodeId: '',
  },
  theaterIds: [],
  theaters: [],
})

const formRef = ref<InstanceType<typeof ElForm>>()
const formRules = {
  'shop.name': [{ required: true, message: '请输入店铺名称', trigger: 'blur' }],
  'shop.address': [{ required: true, message: '请输入店铺地址', trigger: 'blur' }],
  'shop.category': [{ required: true, message: '请选择店铺类型', trigger: 'change' }],
  theaterIds: [
    {
      validator: (rule: any, value: number[], callback: any) => {
        if (value.filter((id) => id).length === 0) {
          callback(new Error('至少需要关联一个剧院'))
        } else {
          callback()
        }
      },
      trigger: 'change',
    },
  ],
}

// 获取所有店铺
const fetchShops = async (shopName?: string, theaterKeyword?: string) => {
  loading.value = true
  try {
    // 前端currentPage从1开始，转换为后端的0开始页码
    const page = currentPage.value - 1
    const result = await searchShops(shopName, theaterKeyword, page, pageSize.value)
    shopPage.value = result // 后端返回的分页对象
  } catch (err: any) {
    ElMessage.error(err.message || '获取店铺列表失败')
    shopPage.value = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 }
  } finally {
    loading.value = false
  }
}
/* const fetchShops = async (shopName?: string, theaterKeyword?: string) => {
  loading.value = true
  try {
    const result = await searchShops(shopName, theaterKeyword)
    shopList.value = result
  } catch (err: any) {
    ElMessage.error(err.message || '获取店铺列表失败')
    shopList.value = []
  } finally {
    loading.value = false
  }
} */

// 获取所有剧院
const fetchTheaters = async () => {
  try {
    const result = await getAllTheaters()
    theaters.value = result
  } catch (err: any) {
    ElMessage.error(err.message || '获取剧院列表失败')
  }
}

// 添加店铺
const handleAddShop = async (data: ShopWithTheatersDTO) => {
  try {
    await addShop(data)
    await fetchShops()
    return true
  } catch (err: any) {
    ElMessage.error(err.message || '添加店铺失败')
    return false
  }
}

// 更新店铺
const handleUpdateShop = async (id: number, data: ShopWithTheatersDTO) => {
  try {
    await updateShop(id, data)
    await fetchShops()
    return true
  } catch (err: any) {
    ElMessage.error(err.message || '更新店铺失败')
    return false
  }
}

// 删除店铺
const handleDeleteShop = async (id: number) => {
  try {
    await deleteShop(id)

    // 重新请求当前页数据（自动分页数据与后端同步）
    await fetchShops(searchParams.shopName, searchParams.theaterKeyword)

    ElMessage.success('店铺删除成功')
  } catch (err: any) {
    ElMessage.error(err.message || '删除店铺失败')
  }
}

// 打开添加模态框
const openAddModal = () => {
  isEditing.value = false
  // 重置表单
  formData.shop = {
    id: 0,
    name: '',
    address: '',
    category: 1,
    image: '',
    gaodeId: '',
  }
  formData.theaterIds = [null as unknown as number] // 初始一个空选择
  formData.theaters = []

  isModalVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 打开编辑模态框
const openEditModal = (shop: ShopWithTheatersDTO) => {
  isEditing.value = true
  // 赋值表单数据（处理可能为undefined的属性）
  formData.shop = { ...shop.shop }
  formData.theaterIds = [...(shop.theaterIds || [])] as number[] // 兜底空数组
  formData.theaters = [...(shop.theaters || [])] // 关键修复：添加兜底空数组

  isModalVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

// 关闭模态框
const closeModal = () => {
  isModalVisible.value = false
}

// 添加剧院选择框
const addTheaterSelect = () => {
  formData.theaterIds.push(null as unknown as number)
}

// 移除剧院选择框
const removeTheaterSelect = (index: number) => {
  formData.theaterIds.splice(index, 1)
}

// 处理表单提交
const handleFormSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    // 过滤空的剧院ID
    const submitData = {
      ...formData,
      theaterIds: formData.theaterIds.filter((id) => id) as number[],
    }

    try {
      let result: boolean
      if (isEditing.value) {
        result = await handleUpdateShop(submitData.shop.id, submitData)
      } else {
        result = await handleAddShop(submitData)
      }

      if (result) {
        ElMessage.success(isEditing.value ? '店铺更新成功' : '店铺添加成功')
        closeModal()
      }
    } catch (error) {
      // 错误已在子函数处理
    }
  })
}

// 确认删除
const confirmDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该店铺吗？此操作不可撤销', '警告', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })
    await handleDeleteShop(id)
  } catch (error) {
    // 取消删除时不处理
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 搜索店铺
const ClickSearchShops = () => {
  currentPage.value = 1 // 重置到第一页
  fetchShops(searchParams.shopName, searchParams.theaterKeyword)
}

// 初始化数据
onMounted(async () => {
  await Promise.all([fetchShops(), fetchTheaters()])
})

// 监听搜索参数变化，自动搜索（延迟触发避免频繁请求）
watch(searchParams, () => {
  const timer = setTimeout(() => {
    ClickSearchShops()
  }, 500)
  return () => clearTimeout(timer)
})

const shopPage = ref<Page<ShopWithTheatersDTO>>({
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
})
// 表格数据直接使用分页结果的content
const shopList = computed(() => shopPage.value.content)
// 总条数从分页结果中获取（不再基于shopList.length计算）
const totalShops = computed(() => shopPage.value.totalElements)
// 页码变化时重新请求
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchShops(searchParams.shopName, searchParams.theaterKeyword) // 重新请求
}

// 每页条数变化时重新请求
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1 // 重置到第一页
  fetchShops(searchParams.shopName, searchParams.theaterKeyword) // 重新请求
}
// 原分页事件
/* const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
} */
</script>

<style scoped>
.shop-manager {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 60px;
  left: 15%;
  right: 20px;
}

.page-title {
  font-size: 35px;
  font-weight: bold;
  font-family: '宋体', serif;
  color: #59310e;
  margin-bottom: 20px;
  text-align: center;
}

.control-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.divider {
  width: 60px;
  flex-shrink: 0;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.table-wrapper {
  margin-top: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.badge {
  display: inline-block;
  background: #f5f5f5;
  color: #59310e;
  border-radius: 4px;
  padding: 2px 8px;
  margin-right: 5px;
  margin-bottom: 5px;
  font-size: 12px;
}

.theater-select-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.dialog-footer {
  text-align: right;
}

/* 颜色调整（与资讯管理页面统一） */
.el-input__inner {
  border-color: #bfa074;
}

.el-input__inner:focus {
  border-color: #a0522d;
}

.el-button {
  color: #ffffff;
  background-color: #e6c9b0;
  border-color: #a0522d;
}

.el-button.is-active,
.el-button:active {
  background-color: #a0522d;
  border-color: #7a3a1d;
}

.el-button--primary {
  background-color: #a0522d;
  border-color: #7a3a1d;
}

.el-button--primary.is-active,
.el-button--primary:active {
  background-color: #7a3a1d;
  border-color: #59310e;
}

.el-button--danger {
  background-color: #d75725;
  border-color: #c0392b;
}

.el-select__input:focus {
  border-color: #a0522d;
}

.el-table th {
  background-color: #f9f2ea;
}

.el-table tr:hover > td {
  background-color: #fef8f2;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .shop-manager {
    left: 20px;
  }
}

@media (max-width: 768px) {
  .control-area {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    width: 100%;
    flex-wrap: wrap;
  }

  .search-input {
    width: 100%;
    margin-bottom: 10px;
  }
}
</style>

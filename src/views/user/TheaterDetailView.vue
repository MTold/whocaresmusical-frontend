<template>
  <div class="theater-detail-layout">
    <!-- 左侧：剧院图片和名称 -->
    <div class="left-panel">
      <div class="theater-img-wrapper">
        <img :src="theater.imageUrl" alt="剧院图片" class="theater-img" v-if="theater.imageUrl" />
      </div>
      <div class="theater-name">{{ theater.name }}</div>
      <div
        v-if="theater.locationName && theater.locationName !== theater.name"
        class="theater-location"
      >
        <el-icon :size="20" style="vertical-align: middle; margin-right: 4px">
          <LocationInformation />
        </el-icon>
        {{ theater.locationName }}
      </div>
      <MapContainer
        :mapStyle="{ width: '70%', height: '300px', marginTop: '20px' }"
        :locationName="'上海' + theater.locationName"
      />
      <!-- 获取当前位置按钮 -->
      <div class="location-info">
        <button @click="startNavigation">一键导航</button>
        <div v-if="loading.value" class="loading-message">
          正在获取位置...
        </div>
        <div v-if="userLocation.lat && userLocation.lng">
        </div>
      </div>
      <!-- 导航方式选择弹窗 -->
      <el-dialog
        v-model="showNavOptions"
        title="选择导航方式"
        width="400px"
      >
        <div class="nav-options-modal">
          <el-radio-group v-model="navOption" class="nav-radio-group">
            <el-radio label="car">开车</el-radio>
            <el-radio label="bus">公交</el-radio>
            <el-radio label="walk">步行</el-radio>
          </el-radio-group>
          <div class="dialog-footer">
            <el-button @click="showNavOptions = false">取消</el-button>
            <el-button type="primary" @click="confirmNavigation">确认导航</el-button>
          </div>
        </div>
      </el-dialog>
    </div>

    <!-- 中间：类型选择栏 + 店铺列表 -->
    <div class="center-panel">
      <!-- 棕色竖线分割 -->
      <div class="divider"></div>
      <div class="sidebar">
        <div
          v-for="(type, idx) in shopCategorys"
          :key="type.value"
          :class="[ 'sidebar-item', { active: selectedCategory === type.value }, idx === 0 ? 'first' : '', idx === shopCategorys.length - 1 ? 'last' : '' ]"
          @click="selectedCategory = type.value"
        >
          <span class="vertical-text">{{ type.label }}</span>
        </div>
      </div>
      <div class="shop-list">
        <div
          v-for="shop in filteredShops"
          :key="shop.shopId"
          class="shop-card"
          @click="selectShop(shop)"
        >
          <img :src="shop.image" alt="店铺图片" class="shop-img" />
          <div class="shop-name">{{ shop.name }}</div>
        </div>
        <div v-if="filteredShops.length === 0" class="no-shop">暂无相关店铺</div>
      </div>
    </div>

    <!-- 右侧：店铺评价 -->
    <div class="right-panel">
      <div v-if="selectedShop">
        <div class="shop-title">{{ selectedShop.name }}</div>
        <div class="review-list">
          <div v-if="shopReviews?.length" style="height: 600px; overflow-y: auto">
            <div v-for="review in shopReviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="review-user">{{ review.username || '匿名用户' }}</span>
                <span class="review-date">{{ formatDate(review.createdAt) }}</span>
              </div>
              <div class="review-content">{{ review.content }}</div>
            </div>
          </div>
          <div v-else class="no-review">暂无评价</div>
        </div>
        <div class="review-input">
          <input
            v-model="newReview.content"
            type="text"
            placeholder="输入你的评价"
            @keyup.enter="submitReview"
          />
          <button @click="submitReview" :disabled="!newReview.content.trim()">发送</button>
        </div>
      </div>
      <div v-else class="no-shop-selected">请选择一个店铺查看评价</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getTheaterById } from '@/api/theater'
import { getShopsByTheaterId } from '@/api/shop'
import { createShopReview, getShopReviewsByShop } from '@/api/shopReview'
import { ElMessage } from 'element-plus'
import { LocationInformation } from '@element-plus/icons-vue'
import MapContainer from '@/components/common/MapContainer.vue'

const route = useRoute()
const theaterId = Number(route.params.id)
const errorMessage = ref('')
const loading = ref(true)

const theater = ref({
  id: theaterId,
  name: '',
  locationName: '',
  latitude: 0,
  longitude: 0,
  imageUrl: '',
})

// 获取剧院信息
const theaterInformation = async () => {
  try {
    const data = await getTheaterById(theaterId)
    theater.value = {
      id: data.id,
      name: data.name,
      locationName: data.locationName,
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrl: data.imageUrl || '',
    }
  } catch (e) {
    console.error('获取剧院信息失败:', e)
    errorMessage.value = '剧院信息加载失败，请稍后再试。'
  } finally {
    loading.value = false
  }
}

// 店铺数据获取
const fetchShops = async () => {
  try {
    shops.value = await getShopsByTheaterId(theaterId)
  } catch (e) {
    console.error('获取店铺失败:', e)
    errorMessage.value = '无法加载店铺数据，请稍后再试。'
  } finally {
    loading.value = false
  }
}

// 页面加载时获取剧院和店铺信息
onMounted(() => {
  theaterInformation()
  fetchShops()
})

const shopCategorys = [
  { label: '周边美食', value: 1 },
  { label: '周边住宿', value: 2 },
  { label: '周边游玩', value: 3 },
]
const selectedCategory = ref(1)

const shops = ref([
  {
    shopId: 0,
    name: '',
    address: '',
    category: 1,
    image: '',
  },
])

const filteredShops = computed(() =>
  shops.value.filter((s) => s.category === selectedCategory.value),
)

const shopReviews = ref([])

const newReview = reactive({
  id: null,
  content: '',
})

const selectedShop = ref(null)

async function selectShop(shop) {
  selectedShop.value = shop
  newReview.content = ''
  await fetchReviews(shop.id)
}

const fetchReviews = async (shopId) => {
  try {
    const res = await getShopReviewsByShop(shopId)
    if (res.code === 200 && Array.isArray(res.data)) {
      shopReviews.value = res.data
    } else {
      shopReviews.value = []
    }
  } catch (error) {
    console.error('加载评价失败:', error)
    shopReviews.value = []
  }
}

const submitReview = async () => {
  if (!selectedShop.value || !newReview.content.trim()) {
    ElMessage.error('请选择店铺并输入评价内容')
    return
  }
  try {
    const response = await createShopReview({
      shopId: selectedShop.value.id,
      content: newReview.content,
    })

    const newReviewItem = {
      id: response.id,
      content: response.content,
      createdAt: response.createdAt,
      shopId: response.shopId,
      username: response.username || '匿名用户',
      userImage: response.userImage || null,
    }

    shopReviews.value.push(newReviewItem)
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || '未知错误'
    ElMessage.error('评价提交失败: ' + errorMessage)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 导航相关
const userLocation = ref({ lat: 0, lng: 0 })
const showNavOptions = ref(false)
const navOption = ref('car')

const getUserLocation = async () => {
  try {
    const position = await getCurrentLocation()
    userLocation.value = position
  } catch (e) {
    console.error('无法获取当前位置:', e)
  }
}

const getCurrentLocation = () => {
  return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
    )
  })
}

const startNavigation = async () => {
  loading.value = true;  // 开始加载
  await getUserLocation();

  if (!userLocation.value.lat || !userLocation.value.lng) {
    ElMessage.error('无法获取当前位置，请稍后再试');
    loading.value = false;  // 结束加载
    return;
  }
  showNavOptions.value = true;
  loading.value = false;  // 结束加载
}

const confirmNavigation = async () => {
  const navUrl = `https://ditu.amap.com/dir?from[lnglat]=${userLocation.value.lng},${userLocation.value.lat}&to[lnglat]=${theater.value.longitude},${theater.value.latitude}&to[name]=${theater.value.name}&type=${navOption.value}&policy=1`
  window.open(navUrl, '_blank', 'noopener,noreferrer')
  showNavOptions.value = false
}
</script>

<style scoped>
.theater-detail-layout {
  display: flex;
  width: 100vw;
  min-height: 100vh;
  background: #fafaf8;
  box-sizing: border-box;
  padding: 40px 0;
}

.theater-detail-layout {
  display: flex;
  width: 100vw;
  min-height: 100vh;
  background: #fafaf8;
  box-sizing: border-box;
  padding: 40px 0;
}

/* 左侧剧院信息 */
.left-panel {
  width: 32%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 30px;
}
.theater-img-wrapper {
  width: 320px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5e9dd;
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}
.theater-img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片不变形且铺满区域 */
  display: block;
}
.theater-name {
  font-size: 24px;
  font-weight: bold;
  color: #000; /* 修改为黑色 */
  text-align: center;
}
.theater-location {
  font-size: 16px;
  color: #888;
  text-align: center;
  margin-top: 15px; /* 原来是4px，现在是两倍 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 中间区域 */
.center-panel {
  width: 33%;
  display: flex;
  flex-direction: row;
  border-left: none;
  border-right: 1px solid #eee;
  min-height: 600px;
  position: relative;
}

/* 棕色竖线分割 11111111111111111111111111111111*/
.divider {
  width: 2px;
  background: #c9c8c8;
  height: 430px;
  margin-right: 0;
  border-radius: 2px;
}

/* 侧边栏 */
.sidebar {
  width: 60px;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
  gap: 0; /* 按钮无间隙 */
  margin-left: -2px; /* 让按钮更贴近分割线 */
}
.sidebar-item {
  width: 48px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  border-radius: 3px; /*让按钮更圆润*/
  margin-bottom: 5px; /* 按钮间距 */
  transition: background 0.2s;
}
.sidebar-item .vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 18px;
  color: #080808;
  letter-spacing: 2px;
  user-select: none;
  font-weight: normal;
}
.sidebar-item.active {
  background: #663b13;
}
.sidebar-item.active .vertical-text {
  font-weight: bold;
  color: #f8f7f6;
}
.sidebar-item:not(.active):hover {
  background: #f5e9dd;
}

/* 店铺列表 */
.shop-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 30px;
  gap: 18px;
  overflow-y: auto; /* 启用竖直滚动 */
  max-height: 750px; /* 限制最大高度，调整为适合的值 */
}

.shop-card {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  padding: 12px 18px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  position: relative;
}
.shop-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.13);
}
.shop-img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  margin-right: 18px;
}
.shop-name {
  font-size: 18px;
  color: #333;
  /* 让店铺名居于图片右侧和卡片右侧的中间 */
  position: absolute; /* 相对于卡片定位 */
  left: 120px; /* 图片宽度 */
  right: 0; /* 卡片右侧 */
  margin-left: 18px; /* 图片和文字间距 */
  width: calc(50% + 30px); /* 让文字居中于图片右侧和卡片右侧之间 */
  top: 50%;
  transform: translateY(-50%);
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧评价区 */
.right-panel {
  width: 32%;
  display: flex;
  flex-direction: column;
  padding: 0 30px;
  min-height: 600px;
}
.shop-title {
  font-size: 22px;
  font-weight: bold;
  color: #000; /* 修改为黑色 */
  margin-bottom: 18px;
  margin-top: 20px;
}
.review-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 18px;
}
.review-item {
  display: flex;
  flex-direction: column; /* 纵向排列 */
  align-items: flex-start;
  background: #f5e9dd;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  color: #5c4326;
  box-sizing: border-box;
}
.review-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 4px;
}
.review-user {
  color: #333;
}
.review-date {
  color: #888;
  font-size: 0.95em;
}
.review-content {
  width: 100%;
  margin-top: 2px;
  word-break: break-all;
  white-space: pre-line;
  font-weight: normal;
}
.no-review {
  color: #aaa;
  text-align: center;
  margin-top: 40px;
}
.no-shop-selected {
  color: #aaa;
  text-align: center;
  margin-top: 80px;
  font-size: 18px;
}
.review-input {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.review-input input {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 8px 12px;
  font-size: 16px;
}
.review-input button {
  padding: 8px 18px;
  border-radius: 5px;
  border: none;
  background-color: #bf5f08; /* 棕色背景 */
  color: #fff; /* 白色文字 */
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
}

/* 按钮禁用时为灰色 */
.review-input button:disabled {
  background-color: #d2d3d9;
  color: #fff;
  cursor: not-allowed;
}

.review-input button:hover {
  background-color: #9c4e07;
}

/* 保证三大区域不会被压缩到太小 */
.left-panel,
.center-panel,
.right-panel {
  min-width: 260px;
  box-sizing: border-box;
}

/* 当屏幕宽度较小时，改为纵向堆叠布局 */
@media (max-width: 900px) {
  .theater-detail-layout {
    flex-direction: column;
    padding: 20px 0;
  }
  .left-panel,
  .center-panel,
  .right-panel {
    width: 100% !important;
    min-width: 0;
    padding: 0 10px;
  }
  .center-panel {
    border-right: none;
    border-left: none;
    min-height: 0;
  }
  .divider {
    display: none;
  }
  .sidebar {
    flex-direction: row;
    width: 100%;
    height: 48px;
    padding: 0;
    margin-left: 0;
    margin-bottom: 10px;
    align-items: flex-start;
    justify-content: flex-start;
  }
  .sidebar-item,
  .sidebar-item.first,
  .sidebar-item.last {
    width: 80px;
    height: 48px;
    border-radius: 0 0 18px 18px;
    margin-bottom: 0;
    margin-right: 8px;
    position: relative;
  }
  .sidebar-item .vertical-text {
    writing-mode: horizontal-tb;
    font-size: 16px;
    letter-spacing: 1px;
  }
  .shop-list {
    padding: 10px 0;
  }
  .shop-card {
    min-width: 0;
    padding: 8px 10px;
  }
  .shop-img {
    width: 60px;
    height: 60px;
  }
  .shop-name {
    position: static;
    width: auto;
    margin-left: 12px;
    top: auto;
    transform: none;
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }
}

/* 防止图片过小或过大 */
.theater-img-wrapper {
  min-width: 180px;
  min-height: 120px;
  max-width: 100vw;
  max-height: 40vw;
}
.theater-img {
  min-width: 120px;
  min-height: 80px;
  max-width: 100%;
  max-height: 100%;
}
.location-info {
  margin-top: 20px;
  text-align: center;
}

.location-info button {
  background-color: #e4c9b0;
  border: none;
  padding: 12px 20px;
  font-size: 16px;
  color: #5c4326;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.2s;
}

.location-info button:hover {
  background-color: #d1b295;
}

.location-info p {
  margin-top: 10px;
  font-size: 18px;
  color: #5c4326;
}

.review-item {
  background: #f7f1e8;
  border-radius: 2px;
  padding: 10px 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.review-user {
  flex: 2;
  font-weight: bold;
  color: #333;
}

.review-content {
  flex: 4;
  padding: 0 10px;
}

.review-date {
  flex: 4;
  text-align: right;
  color: #888;
  font-size: 0.9em;
}

.nav-options-modal {
  padding: 20px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-radio-group {
  margin: 20px 0;
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.nav-radio-group .el-radio {
  display: flex; /* 使用 flexbox 布局 */
  justify-content: center; /* 水平居中 */
  gap: 15px; /* 按钮间的间距 */
}

.nav-radio-group .el-radio:hover {
  background-color: #f5f7fa;
}

.nav-radio-group .el-radio.is-checked {
  background-color: #ecf5ff;
  color: #d7c2ae;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.loading-message {
  color: #888;
  font-size: 14px;
  margin-top: 10px;
}
</style>

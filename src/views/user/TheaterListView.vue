<template>
  <div class="all-theaters-view">
    <!-- 搜索栏区域 -->
    <div class="header">
      <input
        type="text"
        v-model="inputQuery"
        placeholder="搜索剧院"
        class="search-input"
        @keyup.enter="onSearch"
      />
      <button class="search-btn" @click="onSearch">搜索</button>
    </div>

    <!-- 距离排序按钮 -->
    <div class="distance-sort">
      <button @click="sortByDistance">距离优先</button>
    </div>

    <div class="theaters-gallery">
      <div v-if="filteredTheaters.length > 0" class="theaters-grid">
        <div
          v-for="theater in filteredTheaters"
          :key="theater.id"
          class="theater-item"
          @click="goToDetail(theater.id)"
        >
          <img :src="theater.imageUrl" alt="Theater image" class="theater-image" />
          <p class="theater-name">{{ theater.name }}</p>
        </div>
      </div>
      <!-- 无数据时提示 -->
      <div v-else>
        <p>没有查找到该剧院。</p>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import theaterApi from '@/api/theater'

interface Theater {
  id: number
  name: string
  locationName: string
  latitude: number
  longitude: number
  imageUrl: string
}


export default defineComponent({
  setup() {
    const router = useRouter() // 路由实例，用于跳转页面
    const inputQuery = ref('') // 输入框内容
    const searchQuery = ref('') // 实际用于搜索的内容
    const theaters = ref<Theater[]>([])
    const errorMessage = ref('')
    const loading = ref(true)
    const userLocation = ref<{ lat: number; lng: number }>({ lat: 0, lng: 0 })

    // 获取用户位置
    const getUserLocation = async () => {
      try {
        const position = await getCurrentLocation()
        userLocation.value = position
      } catch (e) {
        console.error('无法获取当前位置:', e)
      }
    }

    // 获取当前位置的函数
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
          }
        )
      })
    }

    // Haversine 公式计算两点之间的距离（单位：公里）
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371 // 地球半径（公里）
      const r1 = lat1 * Math.PI / 180
      const r2 = lat2 * Math.PI / 180
      const dr = (lat2 - lat1) * Math.PI / 180
      const df= (lon2 - lon1) * Math.PI / 180

      const a = Math.sin(dr / 2) * Math.sin(dr / 2) +
        Math.cos(r1) * Math.cos(r2) *
        Math.sin(df / 2) * Math.sin(df / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

      return R * c
    }


    // 按距离排序
    const sortByDistance = async () => {
      await getUserLocation() // 获取用户位置

      theaters.value.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.value.lat, userLocation.value.lng, a.latitude, a.longitude
        )
        const distanceB = calculateDistance(
          userLocation.value.lat, userLocation.value.lng, b.latitude, b.longitude
        )
        return distanceA - distanceB
      })
    }

    // 剧院数据，从后端接口获取
    const fetchTheaters = async () => {
      try {
        theaters.value = await theaterApi.getAllTheaters()
      } catch (e) {
        console.error('获取剧院失败:', e)
        errorMessage.value = '无法加载剧院数据，请稍后再试。'
      } finally {
        loading.value = false
      }
    }

    // 过滤剧院，返回名称包含搜索内容的剧院
    const filteredTheaters = computed(() => {
      return theaters.value.filter((theater) =>
        theater.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      )
    })

    // 搜索方法，将输入框内容赋值给实际搜索内容
    const onSearch = () => {
      searchQuery.value = inputQuery.value
    }

    // 跳转到剧院详情页
    const goToDetail = (id: number) => {
      router.push(`/theaters/${id}`)
      //或router.push({ name: 'TheaterDetail', params: { id } })
    }
    //点击卡片后路由跳转到 /theaters/1 或 /theaters/2 等
    //目标页面需提前在 router/index.ts 中配置好动态路由 path: '/theaters/:id'
    onMounted(fetchTheaters)
    return {
      inputQuery, // 输入框内容
      searchQuery, // 搜索内容
      filteredTheaters, // 过滤后的剧院列表
      onSearch, // 搜索方法
      goToDetail, // 跳转详情方法
      fetchTheaters,
      sortByDistance,
    }
  },
})
</script>

<style scoped>
.all-theaters-view {
  padding: 30px;
  background-color: #fafaf8;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}

/* 搜索栏样式 */
.header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 1200px;
  justify-content: center;
}

/* 搜索输入框样式 */
.search-input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 1000px;
  font-size: 20px;
}

/* 搜索按钮样式（浅咖啡色） */
.search-btn {
  padding: 10px 24px;
  border-radius: 5px;
  border: none;
  background-color: #e4c9b0; /* 浅咖啡色 */
  color: #5c4326;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}
.search-btn:hover {
  background-color: #d1b295;
}

/* 剧院展示区样式 */
.theaters-gallery {
  width: 100%;
  max-width: 1800px;
}

/* 剧院网格布局 */
.theaters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 250px));
  justify-content: center;
  gap: 20px;
  margin-bottom:80px;
}

/* 单个剧院卡片样式 */
.theater-item {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 250px;
  height: 220px;
  display: flex;
  flex-direction: column;
}
.theater-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 剧院图片样式 */
.theater-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

/* 剧院名称样式 */
.theater-name {
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: 0;
}
/* 距离排序按钮样式 */
.distance-sort {
  margin-bottom:50px;
  text-align: center;
}

.distance-sort button {
  background-color: #f0e1d6;
  border: none;
  padding: 8px 300px;
  font-size: 16px;
  color: #5c4326; /* 深棕色文字 */
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

.distance-sort button:hover {
  background-color: #e4c9b0; /* 悬停时背景色稍微深一些 */
  transform: translateY(-2px); /* 添加按钮悬浮效果 */
}

.distance-sort button:active {
  transform: translateY(2px); /* 按钮按下时稍微下沉 */
}

.distance-sort button:focus {
  outline: none; /* 去掉聚焦时的默认边框 */
  box-shadow: 0 0 0 4px rgba(238, 143, 45, 0.5); /* 聚焦时添加光晕效果 */
}
/* 响应式布局 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }
  .theaters-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 200px));
  }
  .theater-item {
    width: 200px;
    height: 250px;
  }
  .theater-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .theaters-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 150px));
    gap: 15px;
  }
  .theater-item {
    width: 150px;
    height: 200px;
  }
  .theater-image {
    height: 120px;
  }
  .theater-name {
    padding: 10px;
    font-size: 14px;
  }
}
</style>

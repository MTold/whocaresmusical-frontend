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
      <button @click="sortByDistance">按距离排序</button>
      <button @click="sortByName">按字母排序</button>
    </div>

    <!-- 提示信息 -->
    <div v-if="isSorting" class="loading-message">
      <p>正在按距离排序...</p>
    </div>

    <!-- 错误提示信息 -->
    <div v-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>

    <div class="theaters-gallery">

      <!--加载提示 -->
      <div v-if="loading" class="loading">
        <p>内容加载中...</p>
        <!-- 加载的GIF图 -->
        <img src="@/assets/loading.gif" alt="加载中..." class="loading-gif"/>
      </div>

      <!-- 只有在没有数据且加载完成时才显示"没有查找到该剧院" -->
      <div v-else-if="filteredTheaters.length === 0">
        <p>没有查找到该剧院。</p>
      </div>

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
    const isSorting = ref(false)

    // 获取用户位置
    const getUserLocation = async () => {
      try {
        console.log("尝试获取用户位置..."); // 输出调试信息
        const position = await getCurrentLocation()
        console.log("获取到的用户位置:", position) // 输出获取的用户位置信息
        userLocation.value = position
        errorMessage.value = ''
      } catch (e) {
        console.error('无法获取当前位置:', e) // 输出错误信息
        errorMessage.value = '获取用户位置失败，请检查浏览器权限设置。'
      }
    }

    // 获取当前位置的函数
    const getCurrentLocation = () => {
      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        console.log("执行获取位置信息...") // 输出调试信息，确保代码到达此处
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("成功获取位置:", position.coords) // 成功后输出位置信息
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
          },
          (error) => {
            console.error("定位失败:", error) // 定位失败时输出错误信息
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
      isSorting.value = true // 开始排序时，显示加载提示
      await getUserLocation() // 获取用户位置
      console.log('获取的用户位置:', userLocation.value)

      // 如果获取到的用户位置无效，则显示错误信息并停止排序
      if (userLocation.value.lat === 0 && userLocation.value.lng === 0) {
        console.error("未能获取到有效的用户位置")
        errorMessage.value = '获取用户位置失败，请检查浏览器权限设置。'
        isSorting.value = false // 排序失败时，停止显示加载提示
        return
      }

      // 如果获取到有效位置，执行排序
      theaters.value = theaters.value.sort((a, b) => {
        const distanceA = calculateDistance(
          userLocation.value.lat, userLocation.value.lng, a.latitude, a.longitude
        )
        const distanceB = calculateDistance(
          userLocation.value.lat, userLocation.value.lng, b.latitude, b.longitude
        )
        return distanceA - distanceB
      })

      console.log('排序后的剧院列表:', theaters.value)
      isSorting.value = false // 排序完成后，停止显示加载提示
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

    // 按字母顺序排序
    const sortByName = () => {
      theaters.value = theaters.value.sort((a, b) => a.name.localeCompare(b.name))
    }

    // 搜索方法，将输入框内容赋值给实际搜索内容
    const onSearch = () => {
      searchQuery.value = inputQuery.value
      // 如果和后端联动，这里可以调用API获取剧院列表
      // 例如：await fetchTheatersFromAPI(searchQuery.value)
    }

    // 跳转到剧院详情页
    const goToDetail = (id: number) => {
      console.log('剧院ID:', id);
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
      isSorting,
      loading,
      errorMessage,
      sortByName,
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

/*加载信息*/
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #666;
  font-size: 18px;
}

.loading-message {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.loading-gif {
  display: block;
  margin: 20px auto;
  width: 50px;
  height: 50px;
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
  font-size: 15px;
  color: #666;
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
  margin-bottom: 50px;
}

/* 单个剧院卡片样式 */
.theater-item {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 250px;
  height: 160px;
  display: flex;
  flex-direction: column;
}
.theater-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* 剧院图片样式 */
.theater-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  object-position: center;
}

/* 剧院名称样式 */
.theater-name {
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: auto;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 距离排序按钮样式 */
.distance-sort {
  margin-bottom:50px;
  text-align: center;
}

.distance-sort button {
  background-color: #f0e1d6;
  border: none;
  padding: 6px 18px;
  font-size: 18px;
  color: #5c4326;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease-in-out;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-right: 10px;
}

.distance-sort button:hover {
  background-color: #e4c9b0;
  transform: translateY(-2px);
}

.distance-sort button:active {
  transform: translateY(2px);
}

.distance-sort button:focus {
  background-color: #e4c9b0;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
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

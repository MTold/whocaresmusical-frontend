<template>
  <keep-alive>
    <div class="all-shows-view">
      <!-- 搜索区域 -->
      <div class="header">
        <input
          type="text"
          v-model="inputQuery"
          placeholder="搜索剧目"
          class="search-input"
          @keyup.enter="onSearch"
        />
        <button class="search-btn" @click="onSearch">搜索</button>

        <!-- 筛选勾选框：只看有未来演出计划的 -->
        <div class="filter">
          <input
            type="checkbox"
            v-model="showFutureOnly"
            id="futureScheduleFilter"
          />
          <label for="futureScheduleFilter">只看有未来演出计划的</label>
        </div>
      </div>

      <!-- 排序按钮 -->
      <div class="distance-sort">
        <button @click="sortByName">按字母排序</button>
        <button @click="sortByRating">按高分优先</button> <!-- 新增按钮 -->
      </div>

      <!-- 显示剧目列表 -->
      <div class="shows-gallery">
        <!-- 加载中的提示 -->
        <div v-if="loading" class="loading">
          <p>内容加载中...</p>
          <img src="@/assets/loading.gif" alt="加载中..." class="loading-gif"/>
        </div>

        <!-- 显示剧目 -->
        <div v-if="filteredMusicals.length > 0 && !loading" class="shows-grid">
          <div
            v-for="show in filteredMusicals"
            :key="show.id"
            class="show-item"
            @click="goToDetail(show.id)"
          >
            <img :src="show.imageUrl" alt="Show image" class="show-image" />
            <p class="show-name">{{ show.name }}</p>
          </div>
        </div>

        <!-- 显示没有找到剧目的提示 -->
        <div v-else-if="!loading" class="no-shows">
          <p>没有符合条件的剧目。</p>
        </div>
      </div>
    </div>
  </keep-alive>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import musicalApi from '@/api/musical';  // 引入API方法

export default defineComponent({
  setup() {
    const router = useRouter()

    // 数据与状态
    const musicals = ref<any[]>([]);  // 存储音乐剧列表
    const loading = ref(true); // 加载状态
    const inputQuery = ref(''); // 输入框内容
    const searchQuery = ref(''); // 搜索内容
    const errorMessage = ref(''); // 错误信息
    const showFutureOnly = ref(false); // 控制筛选：只看有未来演出计划的
    const fetchMusicals = async () => {
      try {
        const cachedMusicals = localStorage.getItem('musicals');
        const cachedTimestamp = localStorage.getItem('musicalsTimestamp');
        const cacheExpirationTime = 60 * 1000; // 10分钟缓存

        if (cachedMusicals && cachedTimestamp) {
          const currentTime = new Date().getTime();
          const timeDifference = currentTime - parseInt(cachedTimestamp);

          if (timeDifference < cacheExpirationTime) {
            const parsedMusicals = JSON.parse(cachedMusicals);
            musicals.value = Array.isArray(parsedMusicals) ? parsedMusicals : [];
            const savedSort = localStorage.getItem('musicalSort');
            if (savedSort === 'rating') sortByRating();
            else sortByName(); // 默认按字母排序

            loading.value = false;
            return;
          }
        }
        const response = await musicalApi.getAllMusicals();
        musicals.value = Array.isArray(response) ? response : [];
        const savedSort = localStorage.getItem('musicalSort');
        if (savedSort === 'rating') sortByRating();
        else sortByName(); // 默认按字母排序

        localStorage.setItem('musicals', JSON.stringify(response));
        localStorage.setItem('musicalsTimestamp', new Date().getTime().toString());
        loading.value = false;
      } catch (error) {
        console.error('获取音乐剧失败:', error);
        errorMessage.value = '无法加载音乐剧数据，请稍后再试。';
        musicals.value = []; // 出错时设为空数组
        loading.value = false;
      }
    };
    const sortByName = () => {
      if (!musicals.value || !Array.isArray(musicals.value)) {
        return; // 如果数据无效，直接返回
      }
      musicals.value.sort((a, b) => a.name.localeCompare(b.name));
      localStorage.setItem('musicalSort', 'name');
    };

    const sortByRating = () => {
      if (!musicals.value || !Array.isArray(musicals.value)) {
        return; // 如果数据无效，直接返回
      }
      musicals.value.sort((a, b) => b.averageRating - a.averageRating);
      localStorage.setItem('musicalSort', 'rating');
    };

// 过滤剧目，返回名称包含搜索内容的剧目，并根据筛选条件筛选
    const filteredMusicals = computed(() => {
      return musicals.value.filter((musical) => {
        const matchesSearch = musical.name.toLowerCase().includes(searchQuery.value.toLowerCase());

        // 检查 hasFutureSchedule 字段，如果没有，则默认为 '0'（false）
        const hasFutureScheduleBool = musical.hasFutureSchedule === '1'; // 如果是 '1'，则为 true，否则为 false
        const matchesFutureSchedule = showFutureOnly.value ? hasFutureScheduleBool : true;

        return matchesSearch && matchesFutureSchedule;
      });
    });

// 页面加载时恢复排序状态
    onMounted(() => {
      fetchMusicals();
    });


    // 搜索方法
    const onSearch = () => {
      searchQuery.value = inputQuery.value; // 更新搜索内容
    };

    // 跳转到剧目详情页
    const goToDetail = (id: number) => {
      router.push(`/shows/${id}`);
    };



    return {
      inputQuery,
      searchQuery,
      filteredMusicals,
      goToDetail,
      errorMessage,
      loading,
      showFutureOnly,
      onSearch,
      sortByName,
      sortByRating
    };
  }
});
</script>


<style scoped>
.all-shows-view {
  padding: 30px;
  background-color: #fafaf8;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  margin-bottom: 50px;
}

.header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 1200px;
  justify-content: center;
}

.search-input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 700px;
  font-size: 15px
}

.search-btn {
  padding: 10px 24px;
  border-radius: 5px;
  border: none;
  background-color: #e4c9b0;
  color: #5c4326;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-btn:hover {
  background-color: #d1b295;
}

/* 筛选框样式 */
.filter {
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.shows-gallery {
  width: 100%;
  max-width: 1800px;
}

.shows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 250px));
  justify-content: center;
  gap: 20px;
}

.show-item {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 250px;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.show-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.show-name {
  padding: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-top: auto;
  margin-bottom: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-shows {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }

  .shows-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 200px));
  }

  .show-item {
    width: 200px;
    height: 250px;
  }

  .show-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .shows-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 150px));
    gap: 15px;
  }

  .show-item {
    width: 150px;
    height: 200px;
  }

  .show-image {
    height: 120px;
  }

  .show-name {
    padding: 10px;
    font-size: 14px;
  }
}
</style>

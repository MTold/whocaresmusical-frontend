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

    // 获取所有音乐剧数据
    const fetchMusicals = async () => {
      try {
        const cachedMusicals = localStorage.getItem('musicals');
        if (cachedMusicals) {
          musicals.value = JSON.parse(cachedMusicals); // 使用缓存数据
          loading.value = false;
        } else {
          // 如果缓存没有，获取数据并缓存
          const response = await musicalApi.getAllMusicals();
          musicals.value = response;
          localStorage.setItem('musicals', JSON.stringify(response));
          loading.value = false;
        }
      } catch (error) {
        console.error('获取音乐剧失败:', error);
        errorMessage.value = '无法加载音乐剧数据，请稍后再试。'; // 错误提示
      }
    };

    // 过滤音乐剧
    const filteredMusicals = computed(() => {
      return musicals.value.filter((musical) =>
        musical.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    // 搜索方法
    const onSearch = () => {
      searchQuery.value = inputQuery.value; // 更新搜索内容
    };

    // 跳转到剧目详情页
    const goToDetail = (id: number) => {
      router.push(`/shows/${id}`);
    };

    // 页面加载时获取数据
    onMounted(() => {
      fetchMusicals();
    });

    return {
      inputQuery,
      searchQuery,
      filteredMusicals,
      goToDetail,
      errorMessage,
      loading,
      onSearch
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
  width: 1000px;
  font-size: 20px;
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
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
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

<template>
  <div class="all-shows-view">
    <div class="header">
      <input
        type="text"
        v-model="inputQuery"
        placeholder="搜索剧目"
        class="search-input"
        @keyup.enter="onSearch"
      />
      <button class="search-btn" @click="onSearch">搜索</button>
      <!--
      <select v-model="selectedCategory" class="category-select">
        <option value="">所有类别</option>
        <option value="original">原创</option>
        <option value="non-original">非原创</option>
      </select>
      -->
    </div>
    <div class="shows-gallery">
      <!-- 如果正在加载，则显示"内容加载中" -->
      <div v-if="loading" class="loading">
        <p>内容加载中...</p>
      </div>

      <!-- 显示音乐剧列表 -->
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

      <!-- 显示提示信息 -->
      <div v-else-if="!loading">
        <p>没有符合条件的剧目。</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router';
import musicalApi from '@/api/musical';  // 引入API方法

export default defineComponent({
  setup() {
    const router = useRouter();
    const musicals = ref<any[]>([]);  // 存储音乐剧列表
    const errorMessage = ref(''); // 存储错误信息
    const loading = ref(true); // 控制加载状态
    const inputQuery = ref('') // 输入框内容
    const searchQuery = ref('') // 实际用于搜索的内容

    // 获取所有音乐剧数据
    const fetchMusicals = async () => {
      try {
        musicals.value = await musicalApi.getAllMusicals();
      } catch (error) {
        console.error('获取音乐剧失败:', error);
        errorMessage.value = '无法加载音乐剧数据，请稍后再试。'; // 错误提示
      } finally {
        loading.value = false; // 加载完成后，设置加载状态为 false
      }
    };

    // 过滤剧院，返回名称包含搜索内容的剧院
    const filteredMusicals = computed(() => {
      return musicals.value.filter((musical) =>
        musical.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      )
    })

    // 搜索方法，将输入框内容赋值给实际搜索内容
    const onSearch = () => {
      searchQuery.value = inputQuery.value
    }

    // 跳转到剧目详情页
    const goToDetail = (id: number) => {
      router.push(`/shows/${id}`);
    };

    // 页面加载时调用API获取剧目数据
    onMounted(() => {
      fetchMusicals();
    });

    return {
      inputQuery,
      searchQuery,
      filteredMusicals,
      musicals,
      goToDetail,
      errorMessage,
      loading, // 返回loading状态
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
}

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

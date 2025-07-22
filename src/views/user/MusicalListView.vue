<template>
  <div class="all-shows-view">
    <div class="header">
      <!-- 注释掉搜索和筛选部分 -->
      <!--
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索剧目"
        class="search-input"
      />
      <select v-model="selectedCategory" class="category-select">
        <option value="">所有类别</option>
        <option value="original">原创</option>
        <option value="non-original">非原创</option>
      </select>
      -->
    </div>
    <div class="shows-gallery">
      <div v-if="musicals.length > 0" class="shows-grid">
        <div
          v-for="show in musicals"
          :key="show.id"
          class="show-item"
          @click="goToDetail(show.id)"
        >
          <img :src="show.imageUrl" alt="Show image" class="show-image" />
          <p class="show-name">{{ show.name }}</p>
        </div>
      </div>
      <div v-else>
        <p>没有符合条件的剧目。</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import musicalApi from '@/api/musical';  // 引入API方法

export default defineComponent({
  setup() {
    const router = useRouter();
    const musicals = ref<any[]>([]);  // 存储音乐剧列表
    const errorMessage = ref(''); // 存储错误信息

    // 获取所有音乐剧数据
    const fetchMusicals = async () => {
      try {
        musicals.value = await musicalApi.getAllMusicals();
      } catch (error) {
        console.error('获取音乐剧失败:', error);
        errorMessage.value = '无法加载音乐剧数据，请稍后再试。'; // 错误提示
      }
    };

    // 跳转到剧目详情页
    const goToDetail = (id: number) => {
      router.push(`/shows/${id}`);
    };

    // 页面加载时调用API获取剧目数据
    onMounted(() => {
      fetchMusicals();
    });

    return {
      musicals,
      goToDetail,
      errorMessage,
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

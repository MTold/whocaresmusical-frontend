<template>
  <div class="all-shows-view">
    <div class="header">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索剧目"
        class="search-input"
      />
      <select v-model="selectedCategory" class="category-select">
        <option value="">所有类别</option>
        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
      </select>
    </div>
    <div class="shows-gallery">
      <div v-if="filteredShows.length > 0" class="shows-grid">
        <div
          v-for="show in filteredShows"
          :key="show.id"
          class="show-item"
          @click="goToDetail(show.id)">
          <img :src="show.image" alt="Show image" class="show-image" />
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
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const router = useRouter(); // 使用 Vue Router
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const categories = ref(['Ca1', 'Ca2', 'Ca3', 'ca4']); // 示例分类
    const shows = ref([
      { id: 1, name: '哈姆雷特', category: 'Ca1', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/c18ea468e1fbf29.jpg' },
      { id: 2, name: '剧院魅影', category: 'Ca2', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/65f4e84e65cfdf0.jpg' },
      { id: 3, name: 'Show 3', category: 'Ca3', image: 'show3.jpg' },
      { id: 4, name: 'Show 4', category: 'ca4', image: 'show4.jpg' },
      { id: 5, name: 'Show 5', category: 'Ca2', image: 'show5.jpg' },
      { id: 6, name: 'Show 6', category: 'Ca3', image: 'show6.jpg' },
    ]);

    // 计算属性用于根据搜索和筛选条件过滤剧目
    const filteredShows = computed(() => {
      return shows.value.filter(show => {
        const matchesSearch = show.name.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesCategory = selectedCategory.value ? show.category === selectedCategory.value : true;
        return matchesSearch && matchesCategory;
      });
    });

    // 跳转到详细介绍页面的函数
   const goToDetail = (id: number) => {
    router.push(`/shows/${id}`);
  };

    return {
      searchQuery,
      selectedCategory,
      categories,
      filteredShows,
      goToDetail,
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

.search-input {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  width: 1000px;
  font-size: 20px;
}

.category-select {
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 20px;
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

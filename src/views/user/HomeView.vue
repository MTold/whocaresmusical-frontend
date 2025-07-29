<template>
  <div class="home-view">
    <!-- 大图片轮播区域 -->
    <div class="carousel-container">
      <el-carousel :interval="4000" arrow="always">
        <el-carousel-item v-for="show in carouselShows" :key="show.id">
          <img :src="show.imageUrl" class="carousel-image" />
          <div class="carousel-caption">
            <h3>{{ show.name }}</h3>
            <p>{{ show.info }}</p>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>
    <div class="section news-section">
      <h2>最新资讯</h2>
      <ul class="news-list">
        <li v-for="news in newsList" :key="news.id" class="news-item">
          <div class="news-title">{{ news.title }}</div>
          <div class="news-meta">{{ formatDate(news.date) }}</div>
          <div class="news-summary">{{ news.summary }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { newsApi } from '@/api/admin/news'; // 确保路径正确
import type { News } from '@/types/news'; // 确保路径正确
import { getMusicals } from '@/api/show'; // 确保路径正确
import { ElMessage } from 'element-plus';


import 'element-plus/es/components/carousel/style/css'
import 'element-plus/es/components/carousel-item/style/css'

const carouselShows = ref<any[]>([]);
const router = useRouter();


onMounted(async () => {
  try {
    const shows = await getMusicals();
    const selectedIds = [7, 11, 15, 33, 46,346];
    const selectedShows = shows.filter(show => selectedIds.includes(show.id));
    carouselShows.value = selectedShows;
  } catch (error) {
    console.error('Failed to fetch shows:', error);
    ElMessage.error('加载剧目失败');
  }
});


const goToShow = (id: number) => {
  router.push(`/shows/${id}`)
}

const newsList = ref<News[]>([]);

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // 使用24小时制
    });
  } catch (e) {
    return dateStr;
  }
};

// 获取最新资讯列表
onMounted(async () => {
  try {
    const data = await newsApi.getAllNews();
    newsList.value = data;
  } catch (error) {
    console.error('Failed to fetch news:', error);
    newsList.value = [];
  }
});

</script>

<style scoped>
.home-view {
  background: #fafaf8;
  min-height: 100vh;
  padding-bottom: 40px;
}
.news-section h2, .recommend-section h2  {
  color: #a0522d;
  font-size: 24px;
  margin-top: -5px; /* 增加顶部外边距 */
  margin-bottom: 20px;
}
.news-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.news-item {
  border-bottom: 1px solid #eee;
  padding: 16px 0 10px 0;
}
.news-item:last-child {
  border-bottom: none;
}
.news-title {
  font-size: 18px;
  font-weight: bold;
  color: #59310e;
}
.news-meta {
  font-size: 13px;
  color: #bfa074;
  margin: 4px 0 6px 0;
}
.news-summary {
  color: #666;
  font-size: 15px;
}

.banner-text {
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-shadow: 0 4px 16px rgba(0,0,0,0.25);
  text-align: center;
  z-index: 2;
}
.banner-text h1 {
  font-size: 38px;
  font-weight: bold;
  margin-bottom: 10px;
  letter-spacing: 2px;
  }
.banner-text p {
  font-size: 20px;
  margin: 0;
}
.section {
  width: 100%;
  max-width: 1200px;
  margin: 150px auto 32px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 32px 28px 24px 28px;
}

.carousel-container {
  width: 100%;
  max-width: 1500px;
  height: 600px;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 600px;
  object-fit: cover;
  border-radius: 50%;
  margin-top: 100px; /* 增加上边距 */

}

.carousel-caption {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: #fff;
  font-size: 24px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.show-name {
  margin-top: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/*媒体查询，用于在屏幕宽度最大为768像素时调整样式，例如，减小图片和名称的字体大小。*/
@media (max-width: 768px) {
  .show-image {
    height: 200px;
  }
  .show-name {
    font-size: 16px;
  }
}
/*媒体查询，用于在屏幕宽度最大为480像素时进一步调整样式，例如，减小图片的高度和宽度，以及名称的字体大小。*/
@media (max-width: 480px) {
  .show-image {
    height: 150px;
  }
  .show-image {
    width: 100%;
  }
  .show-name {
    font-size: 14px;
  }
}
</style>

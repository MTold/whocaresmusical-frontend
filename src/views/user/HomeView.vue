<template>
  <div class="home-view">
    <div class="carousel-banner">
      <el-carousel height="240px" indicator-position="outside" arrow="always">
        <el-carousel-item v-for="theater in theaters" :key="theater.id">
          <div style="cursor:pointer;position:relative;width:100%;height:100%;" @click="goToTheater(theater.id)">
            <img :src="theater.image" class="carousel-img" />
            <div style="position:absolute;left:30px;bottom:30px;color:#fff;text-shadow:0 2px 8px #000;font-size:22px;font-weight:bold;background:rgba(0,0,0,0.25);padding:6px 18px;border-radius:8px;">
              {{ theater.name }}
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <div class="banner-text">
        <h1>沪cares musicals</h1>
        <p>发现精彩演出，畅享剧院生活</p>
      </div>
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
    <div class="section recommend-section">
      <h2>为你推荐</h2>
      <div class="recommend-list">
        <div v-for="item in recommendList" :key="item.id" class="recommend-item" @click="goToShow(item.id)" style="cursor:pointer;">
          <img :src="item.image" :alt="item.name" class="recommend-img" />
          <div class="recommend-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { newsApi } from '@/api/admin/news'; // 确保路径正确
import type { News } from '@/types/news'; // 确保路径正确

import 'element-plus/es/components/carousel/style/css'
import 'element-plus/es/components/carousel-item/style/css'

// 剧院数据（与 TheaterListView.vue 保持一致）
const theaters = [
  {
    id: 1,
    name: '国家大剧院',
    image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/c18ea468e1fbf29.jpg',
  },
  {
    id: 2,
    name: '上海大剧院',
    image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/c18ea468e1fbf29.jpg',
  },
  {
    id: 3,
    name: '广州大剧院',
    image: 'https://img1.doubanio.com/view/photo/l/public/p2575466399.webp',
  },
  {
    id: 4,
    name: '深圳保利剧院',
    image: 'https://img1.doubanio.com/view/photo/l/public/p2575466400.webp',
  },
  {
    id: 5,
    name: '杭州大剧院',
    image: 'https://img1.doubanio.com/view/photo/l/public/p2575466401.webp',
  },
  {
    id: 6,
    name: '天津大剧院',
    image: 'https://img1.doubanio.com/view/photo/l/public/p2575466402.webp',
  },
]
const router = useRouter()
const goToTheater = (id: number) => {
  router.push({ name: 'TheaterDetail', params: { id } })
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
    /* 直接将指定的新闻信息赋值给 newsList
    newsList.value = [
      {
        id: 1,
        title: "TEST1",
        date: "2025-07-28T12:52:54.000+00:00",
        summary: "tesing 编辑"
      },
  {
    "id": 3,
    "title": "从管理员前端测试",
    "date": "2025-06-30T16:00:00.000+00:00",
    "summary": "hihih"
  }
    ];*/

const recommendList = ref([
  { id: 1, name: '哈姆雷特', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/c18ea468e1fbf29.jpg' },
  { id: 2, name: '剧院魅影', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/65f4e84e65cfdf0.jpg' },
  { id: 3, name: 'Show 3', image: 'show3.jpg' },
])
const goToShow = (id: number) => {
  router.push(`/shows/${id}`)
}
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
.carousel-banner {
  position: relative;
  width: 100%;
  max-width: 100vw;
  height: 240px;
  margin-bottom: 32px;
  overflow: hidden;
}
.carousel-img {
  width: 100%;
  height: 240px;
  object-fit: cover;
  border-radius: 0;
}
.banner-text {
  position: absolute;
  left: 50%;
  top: 50%;
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
  margin: 0 auto 32px auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 32px 28px 24px 28px;
}
.recommend-list {
  display: flex;
  gap: 32px;
  margin-top: 12px;
}
.recommend-item {
  background: #f7f1ed;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(160,82,45,0.06);
  padding: 16px 12px 10px 12px;
  text-align: center;
  width: 160px;
  transition: box-shadow 0.2s;
}
.recommend-item:hover {
  box-shadow: 0 4px 16px rgba(160,82,45,0.13);
}
.recommend-img {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}
.recommend-name {
  font-size: 16px;
  color: #a0522d;
  font-weight: bold;
}
</style>

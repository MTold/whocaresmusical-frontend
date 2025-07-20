<template>
  <div class="home-view">
    <div class="carousel-banner">
      <el-carousel height="240px" indicator-position="outside" arrow="always">
        <el-carousel-item v-for="(img, idx) in carouselImages" :key="idx">
          <img :src="img" class="carousel-img" />
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
          <div class="news-meta">{{ news.date }}</div>
          <div class="news-summary">{{ news.summary }}</div>
        </li>
      </ul>
    </div>
    <div class="section recommend-section">
      <h2>为你推荐</h2>
      <div class="recommend-list">
        <div v-for="item in recommendList" :key="item.id" class="recommend-item">
          <img :src="item.image" :alt="item.name" class="recommend-img" />
          <div class="recommend-name">{{ item.name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import 'element-plus/es/components/carousel/style/css'
import 'element-plus/es/components/carousel-item/style/css'
const carouselImages = [
  '/src/assets/login_bg.png',
  '/src/assets/color.png',
  '/src/assets/logo_slogan.png'
]
const newsList = ref([
  { id: 1, title: '2024上海国际音乐剧节开幕', date: '2024-06-01', summary: '本届音乐剧节将有20余部剧目轮番上演，国际团队齐聚申城。' },
  { id: 2, title: '热门剧目《剧院魅影》再度来沪', date: '2024-05-28', summary: '经典音乐剧《剧院魅影》将于7月在上海大剧院连演10场。' },
  { id: 3, title: '沪上剧院暑期亲子专场开启', date: '2024-05-20', summary: '多家剧院推出亲子专场，丰富孩子暑期文化生活。' },
])
const recommendList = ref([
  { id: 1, name: '哈姆雷特', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/c18ea468e1fbf29.jpg' },
  { id: 2, name: '剧院魅影', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/65f4e84e65cfdf0.jpg' },
  { id: 3, name: 'Show 3', image: 'show3.jpg' },
])
</script>

<style scoped>
.home-view {
  background: #fafaf8;
  min-height: 100vh;
  padding-bottom: 40px;
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
.news-section h2, .recommend-section h2 {
  color: #a0522d;
  font-size: 24px;
  margin-bottom: 18px;
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

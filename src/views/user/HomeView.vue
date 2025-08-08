<template>
  <div class="home-view">
    <!-- 轮播图容器 -->
     <div class="home-title">沪cares musicals<br/>发现精彩演出，畅享剧院生活</div>
    <div class="carousel-section">
      <!-- 椭圆形轮播区域 -->
      <div class="banner">
        <!-- 1. 加载占位 -->
        <div v-if="loading" class="loading">
          <p>精彩内容加载中...</p>
          <img src="https://5b0988e595225.cdn.sohucs.com/images/20180809/05aa0fba1e844ad2bd4ee21c32d70099.gif" alt="加载中..." class="loading-gif" />
        </div>

        <!-- 2. 真正的轮播（loading 为 false 时才渲染） -->
        <div class="img-list img-wrapper" ref="imgList">
          <router-link
            v-for="(show, index) in carouselShows"
            :key="`show-${show.id}-${index}`"
            class="img-box"
            :data-index="index"
            :to="'/shows/' + show.id"
            :id="getImgBoxId(index)"
          >
            <div class="info">
              <h3>{{ show.name }}</h3>
              <!-- <p>{{ show.info || show.description }}</p> -->
            </div>
            <img
              :src="show.imageUrl || show.posterUrl"
              :alt="show.name"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </router-link>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="btn-group">
        <button class="last btn" @click="handlePrev" :disabled="isAnimating">
          <svg class="icon left" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="128" height="128">
            <path d="M862.485 481.154H234.126l203.3-203.3c12.497-12.497 12.497-32.758 0-45.255s-32.758-12.497-45.255 0L135.397 489.373c-12.497 12.497-12.497 32.758 0 45.254l256.774 256.775c6.249 6.248 14.438 9.372 22.627 9.372s16.379-3.124 22.627-9.372c12.497-12.497 12.497-32.759 0-45.255l-203.3-203.301h628.36c17.036 0 30.846-13.81 30.846-30.846s-13.81-30.846-30.846-30.846z" fill=""></path>
          </svg>
        </button>
        <button class="next btn" @click="handleNext" :disabled="isAnimating">
          <svg class="icon right" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="128" height="128">
            <path d="M862.485 481.154H234.126l203.3-203.3c12.497-12.497 12.497-32.758 0-45.255s-32.758-12.497-45.255 0L135.397 489.373c-12.497 12.497-12.497 32.758 0 45.254l256.774 256.775c6.249 6.248 14.438 9.372 22.627 9.372s16.379-3.124 22.627-9.372c12.497-12.497 12.497-32.759 0-45.255l-203.3-203.301h628.36c17.036 0 30.846-13.81 30.846-30.846s-13.81-30.846-30.846-30.846z" fill=""></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- 新闻部分 -->
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
import { onMounted, ref, nextTick, defineComponent, computed} from 'vue'
import { useRouter } from 'vue-router'
import { newsApi } from '@/api/admin/news'
import type { News } from '@/types/news'
import { getMusicals } from '@/api/show'
import { ElMessage } from 'element-plus'
import type { Musical } from '@/types/musical'

const carouselShows = ref<Musical[]>([])
const newsList = ref<News[]>([])
const router = useRouter()
const imgList = ref<HTMLElement>()

// 轮播控制变量
let currentIndex = 0
let animationTime = 0.5
let isAnimating = false

// 虚拟索引数组，用于跟踪实际的DOM元素顺序
let virtualIndexArray: number[] = []

// 获取图片盒子ID
const getImgBoxId = (index: number) => {
  // 根据虚拟索引数组确定哪个元素应该是last-img-box
  if (virtualIndexArray.length > 0 && virtualIndexArray[virtualIndexArray.length - 1] === index) {
    return 'last-img-box'
  }
  return ''
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('图片加载失败:', img.src)
  // 设置默认图片 - 使用base64编码的简单占位图
  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pgo8L3N2Zz4K'
}

// 图片加载成功处理
const handleImageLoad = (event: Event) => {
  // console.log('图片加载成功:', (event.target as HTMLImageElement).src)
}

const loading = ref(true)   // 默认先显示 loading

// 获取轮播数据
onMounted(async () => {
  try {
    const shows = await getMusicals()
    console.log('获取到的所有剧目:', shows)

    const selectedShows = shows.slice(0, 20)
    console.log('筛选后的剧目:', selectedShows)

    if (selectedShows.length === 0) {
      console.log('轮播数据未配置')
    } else {
      carouselShows.value = selectedShows
    }

    // 初始化虚拟索引数组
    virtualIndexArray = Array.from({ length: selectedShows.length }, (_, i) => i)
    await fetchCarousel();                // 1. 拿到数据
    // 初始化轮播
    await nextTick() // 2. DOM 渲染完毕
    console.log('轮播数据已设置，开始初始化')
    initCarousel()// 3. 再初始化轮播 // 此时按钮和轮播都已就绪
  } catch (error) {
    console.error('Failed to fetch shows:', error)
    ElMessage.error('加载剧目失败，使用备用数据')


  }
  finally {
    loading.value = false   // 数据拿到后隐藏 loading
  }
})

// 初始化轮播
const initCarousel = () => {
  console.log('开始初始化轮播')
  if (!imgList.value) {
    console.error('imgList ref 未找到')
    return
  }

  const imgBoxList = Array.from(imgList.value.querySelectorAll('.img-box')) as HTMLElement[]
  const imgBoxCount = imgBoxList.length
  console.log('找到的图片盒子数量:', imgBoxCount)

  if (imgBoxCount === 0) {
    console.error('没有找到图片盒子')
    return
  }

  // 设置初始位置
  imgList.value.style.transition = `${animationTime}s ease`
  imgList.value.style.left = '0'

  // 设置最后一个元素的初始位置
  const lastImgBox = imgList.value.querySelector('#last-img-box') as HTMLElement
  if (lastImgBox) {
    lastImgBox.style.transform = 'translateX(-160.68vw)'
    console.log('设置最后一个元素位置')
  }

  // 显示按钮
  setTimeout(() => {
    const btnGroup = document.querySelector('.btn-group') as HTMLElement
    if (btnGroup) {
      btnGroup.style.opacity = '1'
    }
  }, animationTime * 1000)


  console.log('轮播初始化完成')
}

// 更新虚拟索引数组
const updateVirtualIndexArray = (direction: 'prev' | 'next') => {
  if (direction === 'next') {
    // 将第一个元素移到末尾
    const firstElement = virtualIndexArray.shift()
    if (firstElement !== undefined) {
      virtualIndexArray.push(firstElement)
    }
  } else {
    // 将最后一个元素移到开头
    const lastElement = virtualIndexArray.pop()
    if (lastElement !== undefined) {
      virtualIndexArray.unshift(lastElement)
    }
  }
  // console.log('更新后的虚拟索引数组:', virtualIndexArray)
}

// 验证轮播状态
const validateCarouselState = () => {
  if (!imgList.value) return false

  const imgBoxList = Array.from(imgList.value.querySelectorAll('.img-box')) as HTMLElement[]
  const imgBoxCount = imgBoxList.length

  if (imgBoxCount === 0) {
    console.error('没有找到图片盒子')
    return false
  }

  if (virtualIndexArray.length !== imgBoxCount) {
    console.error('虚拟索引数组长度不匹配')
    return false
  }

  return true
}

// 处理下一张
const handleNext = () => {
  if (isAnimating) return
  isAnimating = true

  if (!validateCarouselState()) {
    isAnimating = false
    return
  }

  const imgBoxList = Array.from(imgList.value!.querySelectorAll('.img-box')) as HTMLElement[]
  const imgBoxCount = imgBoxList.length

  currentIndex++

  // 更新虚拟索引数组 - 移到开始处
  updateVirtualIndexArray('prev')

  // 移动整个列表
  imgList.value!.style.left = `${-26.78 * currentIndex}vw`

  setTimeout(() => {
    if (!imgList.value) return

    imgList.value.style.transition = 'none'

    // 当点击下一个累计达到图片数量时，相当于要回到原点，则重置变量和位置
    if (Math.abs(currentIndex) === imgBoxCount) {
      currentIndex = 0
      imgList.value.style.left = '0'

      // 重置所有元素的transform
      const newImgBoxList = Array.from(imgList.value.querySelectorAll('.img-box')) as HTMLElement[]
      newImgBoxList.forEach(item => {
        if (item.id === 'last-img-box') {
          item.style.transform = 'translateX(-160.68vw)'
        } else {
          item.style.transform = 'none'
        }
      })
    } else {
      // 处理元素位置
      const firstBox = imgBoxList[0] as HTMLElement
      if (firstBox.id === 'last-img-box') {
        firstBox.style.transition = 'none'
        firstBox.style.transform = 'translateX(0px)'
      } else if (currentIndex >= 0) {
        firstBox.style.transform = 'none'
      } else {
        firstBox.style.transform = 'translateX(160.68vw)'
      }
    }

    imgList.value.style.transition = `${animationTime}s ease`
    isAnimating = false
  }, animationTime * 1000)
}

// 处理上一张
const handlePrev = () => {
  if (isAnimating) return
  isAnimating = true

  if (!validateCarouselState()) {
    isAnimating = false
    return
  }

  const imgBoxList = Array.from(imgList.value!.querySelectorAll('.img-box')) as HTMLElement[]
  const imgBoxCount = imgBoxList.length

  currentIndex--

  // 更新虚拟索引数组 - 移到开始处
  updateVirtualIndexArray('next')

  // 模拟移动情况，把最右侧的图片（元素）移动到最前
  // 因为左侧图片只会有一张，所以需要先移动图片到左侧，再进行imgListOne的移到
  const firstBox = imgBoxList[0] as HTMLElement
  if (firstBox.id === 'last-img-box' && currentIndex !== 0) {
    // 当第一张图片为last-img-box时，说明已经跑完了一轮，此时相对于一开始的位置为-321.36vw
    firstBox.style.transform = 'translateX(-321.36vw)'
  } else if (currentIndex < 0) {
    // 这种情况与点击next按钮出现的回退现象一致
    firstBox.style.transform = 'none'
  } else {
    // 正常情况下，点击last，则将最右侧的图片移到最前
    firstBox.style.transform = 'translateX(-160.68vw)'
  }

  // 移动整个列表
  imgList.value!.style.left = `${-26.78 * currentIndex}vw`

  // 当点击下一个累计达到图片数量时，相当于要回到原点，则重置变量和位置
  if (Math.abs(currentIndex) === imgBoxCount) {
    currentIndex = 0
    setTimeout(() => {
      if (!imgList.value) return

      imgList.value.style.transition = 'none'
      imgList.value.style.left = '0'

      // 重置所有元素的transform
      const newImgBoxList = Array.from(imgList.value.querySelectorAll('.img-box')) as HTMLElement[]
      newImgBoxList.forEach(item => {
        if (item.id === 'last-img-box') {
          item.style.transform = 'translateX(-160.68vw)'
        } else {
          item.style.transform = 'none'
        }
      })
    }, animationTime * 1000)
  }

  imgList.value!.style.transition = `${animationTime}s ease`
  isAnimating = false
}

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  } catch (e) {
    return dateStr
  }
}

// 缓存工具：key、数据、有效期(ms)
const CACHE_KEY = 'home-carousel';
const CACHE_TIME = 10 * 60 * 1000;  // 10 分钟

const getCached = () => {
  const str = localStorage.getItem(CACHE_KEY);
  if (!str) return null;
  const { data, timestamp } = JSON.parse(str);
  return Date.now() - timestamp < CACHE_TIME ? data : null;
};

const setCached = (data: any[]) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
};

// 获取轮播数据（带缓存）
const fetchCarousel = async () => {
  try {
    // 1. 先读缓存
    const cached = getCached();
    if (cached) {
      carouselShows.value = cached;
      } else {
      const shows = await getMusicals();
      const slice = shows.slice(0, 20);
      carouselShows.value = slice;
      setCached(slice);   // 写缓存
    }
    // ❗ 关键：DOM 更新完立即让按钮出现
    await nextTick(() => {
      const btnGroup = document.querySelector('.btn-group') as HTMLElement;
      if (btnGroup) btnGroup.style.opacity = '1';
    });
  } finally {
    loading.value = false;
  }
};

// 获取最新资讯列表
onMounted(async () => {
  await fetchCarousel();
  try {
    const data = await newsApi.getAllNews()
    newsList.value = data
  } catch (error) {
    console.error('Failed to fetch news:', error)
    newsList.value = []
  }
})
</script>

<style scoped>
/* 根样式 */
.home-view {
  background: #fafaf8;/* 设置背景颜色 */
  padding-bottom: 30px;
  position: relative;
}

.home-title {
    position: absolute;
    margin-top: 10px;
    left: 50%;
    z-index: 100;
    transform: translate(-50%, 0);
    top: 20px;
    text-align: center;
    font-size: 26px;
    color: #59310e;
    font-weight: bold;
    font-family: '华文中宋', Calibri, sans-serif;

}
/* 轮播图容器样式 */
.carousel-section {
  background: #fafaf8;/* 设置背景颜色 */
  position: relative;
  width: 100%;
  height: 900px; /* 增加高度，为按钮留出空间 */
}

.banner {
  overflow: hidden;
  position: relative;
  width: 100vw;
  height: 600px; /* 固定高度，避免计算问题 */
  mask: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNDQwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDE0NDAgNTAwIiBpZD0iaiI+CiAgPHBhdGggZmlsbD0icmdiKDIwMCwyMDAsMjAwKSIgZmlsbC1ydWxlPSJldmVub2RkIiBkPSJNMCAwczI3NS4wNCAxMDAgNzIwIDEwMFMxNDQwIDAgMTQ0MCAwdjUwMHMtMjc1LjA0LTEwMC03MjAtMTAwUzAgNTAwIDAgNTAwVjB6Ii8+Cjwvc3ZnPgo=);
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: 100vw;
  margin-top: 0px; /* 添加顶部边距 */
}

.banner .img-wrapper {
  display: flex;
  position: absolute;
  width: 100%;
  height: 600px;
  /*transform: translate(-50%);*/
  transform: translate(8.8%, 0);
  animation: admission 1.5s;
}

.banner .img-wrapper .img-box {
  height: 100%;
  display: inline-block;
  margin-right: 1.78vw;
  position: relative;
  cursor: pointer;
  flex-shrink: 0; /* 防止压缩 */
}

.banner .img-wrapper .img-box .info {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: rgba(23, 23, 23, 0.5);
  text-align: center;
  font-family: "宋体",Calibri, sans-serif;
  color: #ffffff;
  font-size: 2rem;
  z-index: 2;
}

.banner .img-wrapper .img-box .info h3 {
  margin: 0 0 10px 0;
  font-size: 1.8rem;
}

.banner .img-wrapper .img-box .info p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.9;
}

.banner .img-wrapper .img-box img {
  width: 25vw; /* 固定宽度 */
  height: 100%;
  object-position: center;
  object-fit: cover;
}

.banner .img-wrapper .img-box:last-child {
  transform: translate(-160.68vw, 0);
}

.img-list {
  left: 0;
}

/* 按钮样式 */
.btn-group {
  position: absolute;
  left: 50%;
  top: 600px;
  margin-bottom: 30px;
  transform: translate(-50%, 50%);
  transition: 1s;
  opacity: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.btn-group .btn {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #bf5f0b;
  background-color: #fff;
  margin: 0 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-group .btn:hover {
  transform: scale(1.1);
  background-color: #59310e;
  box-shadow: 0 6px 20px rgba(0,0,0,0.3);
  border-color: #59310e;
}

.btn-group .btn:hover .icon {
  fill: #fff;
  color: #fff; /* 添加color属性 */
}

.btn-group .btn:active {
  transform: scale(0.95);
}

.btn-group .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-group .btn:disabled:hover {
  transform: none;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-group .btn:disabled:hover .icon {
  fill: #171717;
  color: #171717;
}

.btn-group .btn .icon {
  width: 20px;
  height: 20px;
  fill: #bf5f0b;
  transition: fill 0.3s ease;
  color: #171717; /* 添加color属性 */
}

.btn-group .btn .left {
  transform: rotate(0deg);
}

.btn-group .btn .right {
  transform: rotate(180deg);
}

/* 动画 */
@keyframes admission {
  0% {
    transform: translate(140vw, 0);
  }
  100% {
    transform: translate(13.39vw, 0);
  }
}

/* 新闻部分样式 */
.news-section h2, .recommend-section h2 {
  color: #a0522d;
  font-size: 24px;
  margin-top: 0; /* 移除顶部边距 */
  margin-bottom: 10px;
  font-family: '黑体';
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
  font-size: 20px;
  font-weight: bold;
  color: #59310e;
  font-family: '宋体', serif;
}

.news-meta {
  font-size: 13px;
  color: #bfa074;
  margin: 4px 0 6px 0;
}

.news-summary {
  color: #666;
  font-size: 15px;
  font-family: '仿宋', serif;
}

.section {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 32px auto; /* 移除顶部边距 */
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 32px 28px 24px 28px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .banner .img-wrapper .img-box img {
    width: 35vw;
  }

  .banner .img-wrapper .img-box .info {
    font-size: 1.5rem;
  }

  .banner .img-wrapper .img-box .info h3 {
    font-size: 1.4rem;
  }

  .banner .img-wrapper .img-box .info p {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .banner .img-wrapper .img-box img {
    width: 45vw;
  }

  .banner .img-wrapper .img-box .info {
    font-size: 1.2rem;
  }

  .banner .img-wrapper .img-box .info h3 {
    font-size: 1.1rem;
  }

  .banner .img-wrapper .img-box .info p {
    font-size: 0.9rem;
  }
}
/*加载信息*/
.loading {
  display: flex;
  margin: 18%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #666;
  font-size: 18px;
}
</style>

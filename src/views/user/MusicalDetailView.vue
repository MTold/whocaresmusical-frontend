<template>
  <div class="show-detail-view">
    <div class="header">
      <img :src="show.image" alt="Show image" class="show-image" />
      <div class="show-info">
        <p class="show-name">{{ show.name }}</p>
        <p class="show-category">{{ show.category }}</p>
        <p class="show-description">{{ show.description }}</p>
      </div>
    </div>
    <div class="schedule-table">
      <table>
        <thead> <!-- 补上 thead 标签 -->
          <tr>
            <th>日期</th>
            <th>时间</th>
            <th>地点</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="schedule in show.schedules" :key="schedule.id">
            <td>{{ schedule.date }}</td>
            <td>{{ schedule.time }}</td>
            <td>{{ schedule.location }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="footer">
      <button @click="goToReview">查看更多评价...</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 补充 useRouter

const route = useRoute()
const router = useRouter() // 获取 router 实例
const showId = Number(route.params.id)

// 用 ShowListView 的静态数据
const showList = [
  { id: 1, name: '哈姆雷特', category: 'Ca1', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/c18ea468e1fbf29.jpg', description: '莎士比亚经典悲剧', schedules: [{ id: 1, date: '2025-07-20', time: '19:00', location: '剧院A' }] },
  { id: 2, name: '剧院魅影', category: 'Ca2', image: 'https://img1.doubanio.com/pview/drama_subject_poster/m/public/65f4e84e65cfdf0.jpg', description: '音乐剧经典', schedules: [{ id: 2, date: '2025-07-21', time: '20:00', location: '剧院B' }] },
  { id: 3, name: 'Show 3', category: 'Ca3', image: 'show3.jpg', description: '描述3', schedules: [{ id: 3, date: '2025-07-22', time: '18:00', location: '剧院C' }] },
  { id: 4, name: 'Show 4', category: 'ca4', image: 'show4.jpg', description: '描述4', schedules: [{ id: 4, date: '2025-07-23', time: '19:30', location: '剧院D' }] },
  { id: 5, name: 'Show 5', category: 'Ca2', image: 'show5.jpg', description: '描述5', schedules: [{ id: 5, date: '2025-07-24', time: '20:30', location: '剧院E' }] },
  { id: 6, name: 'Show 6', category: 'Ca3', image: 'show6.jpg', description: '描述6', schedules: [{ id: 6, date: '2025-07-25', time: '21:00', location: '剧院F' }] },
]

// 根据 id 查找剧目
const show = ref(showList.find(item => item.id === showId) || {
  id: showId,
  name: '未知剧目',
  category: '',
  description: '',
  image: '',
  schedules: []
})

const goToReview = () => {
  router.push(`/shows/${showId}/review`)
}
</script>

<style scoped>
.show-detail-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.show-image {
  width: 200px;
  height: 300px;
  margin-right: 20px;
}

.show-info {
  text-align: center;
}

.show-name {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.show-category,
.show-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 20px;
}

.schedule-table {
  width: 100%;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.footer {
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #bf5f08;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>

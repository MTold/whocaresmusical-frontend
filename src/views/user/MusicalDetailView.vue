<template>
  <div class="show-detail-view">
    <div class="header">
      <img :src="show.image" alt="Show image" class="show-image" />
      <div class="show-info">
        <p class="show-name">{{ show.name }}</p>
        <p class="show-category">{{ show.category }}</p>
        <p class="show-description" v-html="show.description"></p> <!-- 使用 v-html 使换行符生效 -->
      </div>
    </div>

    <div class="schedule-table">
      <table v-if="show.schedules.length > 0">
        <thead>
        <tr>
          <th>日期</th>
          <th>时间</th>
          <th>演员</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="schedule in show.schedules" :key="schedule.id">
          <td>{{ schedule.date }}</td>
          <td>{{ schedule.time }}</td>
          <td>{{ schedule.cast }}</td> <!-- 演员信息 -->
        </tr>
        </tbody>
      </table>

      <!-- 如果排期为空，显示对应文字 -->
      <div v-else class="no-schedules">
        <p>没有排期信息</p>
      </div>
    </div>

    <div class="footer">
      <button @click="goToReview">查看更多评价...</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const showId = Number(route.params.id);

// 定义 show 数据对象，包含排期字段
const show = ref({
  id: showId,
  name: '',
  category: '',
  description: '',
  image: '',
  schedules: [] as Array<{
    id: number;
    date: string;
    time: string;
    cast: string;
  }>,  //
});

const fetchShowDetails = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/api/musicals/${showId}`);
    const data = response.data;

    // 处理排期数据
    show.value = {
      id: data.id,
      name: data.name,
      category: data.original ? '原创' : '非原创',
      description: data.info.replace(/\r\n/g, '<br/>'), // 转换换行符为 <br/>
      image: data.imageUrl,
      schedules: data.shows.map((schedule: any) => ({
        id: schedule.id,
        date: schedule.date,
        time: schedule.time,
        cast: schedule.cast,
      })),
    };
  } catch (error) {
    console.error('获取剧目信息失败:', error);
  }
};

// 页面加载时获取剧目信息
onMounted(() => {
  fetchShowDetails();
});

// 跳转到评价页面
const goToReview = () => {
  router.push(`/shows/${showId}/review`);
};
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

/* 如果没有排期信息 */
.no-schedules {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

/* 底部样式 */
.footer {
  margin-top: 40px;
  width: 100%;
  text-align: center;
  margin-bottom:100px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #bf5f08;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }

  .show-image {
    width: 150px;
    height: 225px;
  }
}

@media (max-width: 480px) {
  .show-name {
    font-size: 14px;
  }

  .show-description {
    font-size: 14px;
  }
}
</style>

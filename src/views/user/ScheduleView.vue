<template>
  <div class="schedule-view">
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧日历组件 -->
      <div class="calendar">
        <!-- 日历组件 -->
        <CalendarComponent @date-click="fetchShows" />
      </div>
      <!-- 右侧剧目信息 -->
      <div class="show-details">
        <!-- 显示当天的剧目信息 -->
        <div v-if="shows.length > 0">
          <ul>
            <li v-for="show in shows" :key="show.id">
              <p>{{ show.time }} - {{ show.name }} - {{ show.cast }}</p>
            </li>
          </ul>
        </div>
        <div v-else>
          <!-- 如果没有剧目信息 -->
          <p>没有该日期的剧目信息。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import CalendarComponent from '../../components/common/Calendar.vue';  // 引入日历组件

export default {
  components: { CalendarComponent },  // 注册日历组件
  data() {
    return {
      shows: [],  // 存储当天的剧目信息
    };
  },
  methods: {
    // 通过传入的日期从后端获取剧目信息
    async fetchShows(date) {
      try {
        // 发起请求获取剧目信息
        const response = await this.$http.get(`/api/shows?date=${date}`);
        this.shows = response.data;  // 更新当天的剧目信息
      } catch (error) {
        console.error('Error fetching shows:', error);
      }
    }
  }
};
</script>

<style scoped>
.schedule-view {
  /* 设置整体容器布局，取消垂直居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;  /* 设置和Header的距离 */
}

/* 主内容区布局 */
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 投影效果 */
}

/* 左侧日历区域样式 */
.calendar {
  background-color: #f2e1ae;  /* 使用色卡中的颜色 */
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;  /* 圆角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);  /* 投影效果 */
}

/* 右侧剧目信息区域样式 */
.show-details {
  background-color: #d2d3d9;  /* 使用色卡中的颜色 */
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;  /* 圆角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);  /* 投影效果 */
}

/* 显示剧目信息的列表样式 */
.show-details ul {
  list-style-type: none;  /* 去掉列表符号 */
  padding: 0;
}

/* 每一条剧目信息 */
.show-details li {
  background-color: #fff;  /* 背景色 */
  padding: 15px;
  border-radius: 6px;  /* 圆角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);  /* 投影效果 */
  color: #59310e;  /* 字体颜色，与主题色协调 */
}

/* 剧目信息中的文字 */
.show-details p {
  margin: 0;
  font-size: 16px;
  color: #8c837b;  /* 使用色卡中的颜色 */
}
</style>

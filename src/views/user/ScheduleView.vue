<template>
  <div class="schedule-view">
    <div class="main-content">
      <div class="calendar">
        <!-- Element Plus 日历组件 -->
        <el-calendar
          v-model="selectedDate"
          @pick="handleDateChange"
        :show-week-numbers="true"
        :first-day-of-week="1"
        />
      </div>
      <div class="show-details">
        <div v-if="shows.length > 0">
          <ul>
            <li v-for="show in shows" :key="show.id">
              <p>{{ show.time }} - {{ show.name }} - {{ show.cast }}</p>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>没有该日期的剧目信息。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { ElCalendar } from 'element-plus';

export default defineComponent({
  components: {
    ElCalendar
  },
  setup() {
    const selectedDate = ref(null);  // 用于存储选中的日期
    const shows = ref([]);

    // 模拟剧目信息
    const showData = {
      "2025-07-15": [
        { id: 1, time: '10:00', name: 'Show 1', cast: 'Cast 1' },
        { id: 2, time: '14:00', name: 'Show 2', cast: 'Cast 2' }
      ],
      "2025-07-16": [
        { id: 3, time: '11:00', name: 'Show 3', cast: 'Cast 3' },
        { id: 4, time: '15:00', name: 'Show 4', cast: 'Cast 4' }
      ],
      "2025-07-17": [
        { id: 5, time: '12:00', name: 'Show 5', cast: 'Cast 5' },
        { id: 6, time: '16:00', name: 'Show 6', cast: 'Cast 6' }
      ]
    };

    // 日期变化时触发的函数
    const handleDateChange = (date: Date) => {
      // 格式化选中的日期为 "YYYY-MM-DD"
      const selectedDateString = date.toISOString().split('T')[0];
      shows.value = showData[selectedDateString] || [];  // 根据日期显示剧目信息
    };

    // 确保选中的日期发生变化时，右侧显示剧目信息
    watch(selectedDate, (newVal) => {
      console.log('selectedDate changed:', newVal);
      if (newVal) {
        handleDateChange(newVal);
      }
    });

    return {
      selectedDate,
      shows,
      handleDateChange
    };
  }
});
</script>

<style scoped>
/* 添加 Element Plus 主题变量（可选） */
:deep(.el-calendar) {
  --el-calendar-border: none;
  --el-calendar-cell-width: 40px;
}

.schedule-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background-color: #e8f4fd;
  height: 100vh; /* 确保背景色覆盖整个页面 */
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px; /* 增加间距，让板块分开 */
  padding: 50px;
  max-width: 1200px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff; /* 白色背景 */
  margin-top: 30px; /* 调整顶部空隙 */
  padding-bottom: 50px; /* 底部空隙 */
}

/* 左侧日历区域样式 */
.calendar {
  width: 100%;
  height: 70vh;
  padding: 20px;
  background-color: #f9f9f9; /* 背景色调整 */
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: auto; /* 使内容溢出时可以滚动 */
}

/* 日历头部样式 */
:deep(.el-calendar__header) {
  display: flex;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid #e2e2e2;
  background-color: #f0f0f0;
}

/* 日历单元格样式 */
:deep(.el-calendar-day) {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
}

/* 当前日期的样式 (设置为方形) */
:deep(.el-calendar-table td.is-selected) {
  background-color: #5c6bc0;
  color: white;
  border-radius: 2px;
}

/* 右侧剧目信息区域样式 */
.show-details {
  background-color: #ffffff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px; /* 增加间距 */
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 剧目信息列表样式 */
.show-details ul {
  list-style-type: none;
  padding: 10px;
  margin: 0;
}

/* 每一条剧目信息 */
.show-details li {
  background-color: #f3f5f9;
  padding: 20px;
  margin:20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 16px;
}

/* 剧目信息中的文字 */
.show-details p {
  margin: 0;
  color: #666;
}
</style>

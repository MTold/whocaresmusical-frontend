<template>
  <div class="schedule-view">
    <div class="main-content">
      <div class="calendar">
        <!-- Element Plus 日历组件 + 自定义日期格子 -->
        <el-calendar
          :key="calendarKey"
          v-model="selectedDate"
          @pick="handleDateClick"
          :first-day-of-week="1"
        >
          <template #dateCell="{ data }">
            <div
              class="custom-date-cell"
              :style="{ backgroundColor: getColorByShowCount(formatDate(new Date(data.day))) + ' !important' }"
            >
              <span>{{ new Date(data.day).getDate() }}</span>
            </div>
          </template>
        </el-calendar>
      </div>

      <div class="show-details">
        <div v-if="showsOnSelectedDate.length > 0">
          <ul>
            <li v-for="show in showsOnSelectedDate" :key="show.id" @click="goToDetail(show.musicalId)">
              <p>{{ show.time }} - {{ show.musicalName }} - {{ show.cast }}</p>
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
import { defineComponent, ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default defineComponent({
  setup() {
    const calendarKey = ref(0);
    const router = useRouter();
    const selectedDate = ref(new Date());
    const allShows = ref<any[]>([]);  // 所有当月 show
    const dailyShowMap = ref<Record<string, any[]>>({}); // "YYYY-MM-DD" -> [show, show]

    const formatDate = (date: Date): string =>
      date.toLocaleDateString('sv-SE');

    const fetchMonthlyShows = async (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      try {
        const response = await axios.get(`http://localhost:8080/api/shows/${year}/${month}`);
        allShows.value = response.data;

        // 按天分组
        const map: Record<string, any[]> = {};
        for (const show of response.data) {
          const day = show.date;
          if (!map[day]) map[day] = [];
          map[day].push(show);
        }
        dailyShowMap.value = map;
      } catch (e) {
        console.error('获取月演出失败:', e);
      }
    };

    const goToDetail = (id: number) => {
      router.push(`/shows/${id}`);
    };

    const showsOnSelectedDate = computed(() => {
      const dateStr = formatDate(selectedDate.value);
      return dailyShowMap.value[dateStr] || [];
    });

    const handleDateClick = (date: Date) => {
      selectedDate.value = date;
    };

    const getColorByShowCount = (day: string): string => {
      const count = dailyShowMap.value[day]?.length || 0;
      console.log(`[getColorByShowCount] ${day} -> ${count} 场`);
      if (count === 0) return '';
      if (count <= 1) return '#E3F2FD';      // 浅蓝
      if (count <= 3) return '#90CAF9';      // 中蓝
      if (count <= 5) return '#42A5F5';      // 深蓝
      return '#1E88E5';                      // 很深蓝
    };

    onMounted(() => {
      fetchMonthlyShows(selectedDate.value);
      fetchMonthlyShows(selectedDate.value).then(() => {
      });
    });

    watch(
      () => selectedDate.value,
      async (newVal, oldVal) => {
        if (
          newVal.getMonth() !== oldVal.getMonth() ||
          newVal.getFullYear() !== oldVal.getFullYear()
        ) {
          await fetchMonthlyShows(newVal);
          calendarKey.value++;
        }
      }
    );

    return {
      selectedDate,
      showsOnSelectedDate,
      getColorByShowCount,
      handleDateClick,
      formatDate,
      calendarKey,
      goToDetail
    };
  }
});
</script>

<style scoped>
.schedule-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  background-color: #fafaf8;
  height: 100vh;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  max-width: 1200px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  margin-top: 30px;
  padding-bottom: 50px;
}

/* 自定义日期格子样式 */
.custom-date-cell {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 4px;
  transition: background-color 0.3s;
  background-color: transparent !important;
}

.show-details {
  background-color: #ffffff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.show-details ul {
  list-style-type: none;
  padding: 10px;
  margin: 0;
}

.show-details li {
  background-color: #f3f5f9;
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 16px;
}

.show-details p {
  margin: 0;
  color: #666;
}
</style>

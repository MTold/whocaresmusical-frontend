<template>
  <div class="schedule-view">
    <div class="main-content">
      <div class="calendar">
        <el-calendar
          ref="calendarRef"
          :key="calendarKey"
          v-model="selectedDate"
          @pick="handleDateClick"
          :first-day-of-week="1"
        >
          <!-- 自定义 header 插槽 -->
          <template #header="{ date }">
            <div class="calendar-header">
              <span class="current-date">{{ date }}</span>

              <el-button-group class="el-button-group">
                <el-button size="small" @click="selectDate('prev-year')">« 年</el-button>
                <el-button size="small" @click="selectDate('prev-month')">‹ 月</el-button>
                <el-button size="small" @click="selectDate('today')">今天</el-button>
                <el-button size="small" @click="selectDate('next-month')">月 ›</el-button>
                <el-button size="small" @click="selectDate('next-year')">年 »</el-button>
              </el-button-group>

              <!-- 月份选择器 -->
              <el-date-picker
                v-model="selectedMonth"
                type="month"
                size="small"
                style="margin-left: auto; width: 140px"
                @change="onMonthChange"
              />
            </div>
          </template>

          <!-- 自定义日期单元格 -->
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

      <!-- 剧目信息面板 -->
      <div class="show-details">
        <div v-if="showsOnSelectedDate.length > 0">
          <ul>
            <li
              v-for="show in showsOnSelectedDate"
              :key="show.id"
              @click="goToDetail(show.musicalId)"
            >
              <p>{{ show.time }} {{ show.musicalName }}</p>
              <p class="theater-link" @click.stop="goToTheater(show.theaterId)">
                {{ show.theaterName }}
              </p>
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
import type { CalendarInstance, CalendarDateType } from 'element-plus';

export default defineComponent({
  setup() {
    const calendarKey = ref(0);
    const calendarRef = ref<CalendarInstance>();
    const router = useRouter();
    const selectedDate = ref(new Date());
    const selectedMonth = ref(new Date());
    const allShows = ref<any[]>([]);
    const dailyShowMap = ref<Record<string, any[]>>({});

    const formatDate = (date: Date): string =>
      date.toLocaleDateString('sv-SE');

    const fetchMonthlyShows = async (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      try {
        const response = await axios.get(`http://localhost:8080/api/shows/${year}/${month}`);
        allShows.value = response.data;

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

    const onMonthChange = async (date: Date) => {
      selectedMonth.value = date;
      selectedDate.value = date;
      await fetchMonthlyShows(date);
      calendarKey.value++;
    };

    const selectDate = (val: CalendarDateType) => {
      calendarRef.value?.selectDate(val);
    };

    const handleDateClick = (date: Date) => {
      selectedDate.value = date;
    };

    const goToDetail = (id: number) => {
      router.push(`/shows/${id}`);
    };

    const goToTheater = (id: number) => {
      router.push(`/theaters/${id}`);
    };

    const showsOnSelectedDate = computed(() => {
      const dateStr = formatDate(selectedDate.value);
      return dailyShowMap.value[dateStr] || [];
    });

    const getColorByShowCount = (day: string): string => {
      const count = dailyShowMap.value[day]?.length || 0;
      if (count === 0) return '';
      if (count <= 1) return '#E3F2FD';
      if (count <= 3) return '#90CAF9';
      if (count <= 5) return '#42A5F5';
      return '#1E88E5';
    };

    onMounted(() => {
      fetchMonthlyShows(selectedMonth.value);
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
      selectedMonth,
      calendarKey,
      showsOnSelectedDate,
      getColorByShowCount,
      handleDateClick,
      formatDate,
      goToDetail,
      onMonthChange,
      selectDate,
      calendarRef,
      goToTheater
    };
  }
});
</script>


<style scoped>
.schedule-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background-color: #fafaf8;
  height: 50vh;
  box-sizing: border-box;
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
  margin-top: 10px;
  padding: 30px;
  box-sizing: border-box;
  height: 85vh;
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

/* 剧目列表滚动限制 */
.show-details {
  background-color: #ffffff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: 89%;
}

.show-details ul {
  list-style-type: none;
  padding: 10px;
  margin: 0;
}

.show-details li {
  background-color: #f3f5f9;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: #333;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.show-details li:hover {
  background-color: #e0e7f3;
}

.show-details p {
  margin: 0;
  color: #666;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.current-date {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  margin-right: 30px;
}

.el-button-group{
  margin-right: 10px;
}

</style>

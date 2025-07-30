<template>
  <div class="schedule-view">
    <div class="main-content">
      <div class="calendar">
        <el-calendar
          ref="calendarRef"
          :key="calendarKey"
          v-model="selectedDate"
          @pick="handleDatePick"
          :first-day-of-week="1"
        >
          <!-- 自定义日历头部 -->
          <template #header="{ date }">
            <div class="custom-calendar-header">
              <span class="current-date-display">{{ formatHeaderDate(date) }}</span>

              <div class="header-center">
                <el-date-picker
                  v-model="quickSelectDate"
                  type="month"
                  placeholder="快速跳转"
                  size="default"
                  @change="handleQuickDateChange"
                  format="YYYY年MM月"
                  value-format="YYYY-MM-DD"
                  class="quick-selector"
                />
              <div class="header-left">
                <el-button
                  class="nav-button prev-button"
                  size="default"
                  @click="handlePrevMonth"
                  :icon="ArrowLeft"
                  circle
                />
              </div>
              <div class="header-right">
                <el-button
                  class="nav-button next-button"
                  size="default"
                  @click="handleNextMonth"
                  :icon="ArrowRight"
                  circle
                />
              </div>
              </div>

            </div>
          </template>

          <template #date-cell="{ data }">
            <div
              class="custom-date-cell"
              :class="{
                'has-shows': hasShows(data.day),
                'selected': isSelected(data.day),
                'no-shows': isCurrentMonth(data.day) && !hasShows(data.day),
                'other-month': !isCurrentMonth(data.day)
              }"
              @click.prevent="handleDateCellClick(data.day)"
            >
              <span>{{ new Date(data.day).getDate() }}</span>
            </div>
          </template>
        </el-calendar>
      </div>

      <!-- 剧目信息面板 -->
      <div class="show-details">
        <div v-if="currentShows.length > 0">
          <h3>当日排期 ({{ currentShows.length }} 场)</h3>
          <ul>
            <li
              v-for="show in currentShows"
              :key="show.id"
              @click="goToDetail(show.musicalId)"
            >
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

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const selectedDate = ref(new Date())
const quickSelectDate = ref('')
const showsData = ref<Record<string, any[]>>({})

// 格式化日期为 YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('sv-SE')
}

// 格式化头部日期显示
const formatHeaderDate = (date: any): string => {
  // 确保 date 是 Date 对象
  const dateObj = date instanceof Date ? date : new Date(date)
  return `${dateObj.getFullYear()}年${dateObj.getMonth() + 1}月`
}

// 处理上个月按钮
const handlePrevMonth = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  selectedDate.value = newDate
}

// 处理下个月按钮
const handleNextMonth = () => {
  const newDate = new Date(selectedDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  selectedDate.value = newDate
}

// 处理快速日期选择
const handleQuickDateChange = (value: string) => {
  if (value) {
    const newDate = new Date(value)
    selectedDate.value = newDate
    console.log(`[快速选择] 跳转到: ${formatHeaderDate(newDate)}`)
  }
}

// 获取当月演出数据
const fetchShows = async (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  try {
    console.log(`[fetchShows] 获取 ${year}年${month}月 的数据`)
    const response = await axios.get(`http://localhost:8080/api/shows/${year}/${month}`)
    const shows = response.data
    console.log(`[fetchShows] API返回数据:`, shows)

    // 按日期分组，确保格式统一
    const grouped: Record<string, any[]> = {}
    shows.forEach((show: any) => {
      // 确保日期格式为 YYYY-MM-DD
      let day = show.date
      if (day && !day.includes('-')) {
        // 如果不是标准格式，尝试转换
        day = formatDate(new Date(day))
      }

      if (!grouped[day]) grouped[day] = []
      grouped[day].push(show)
    })

    showsData.value = grouped
  } catch (error) {
    console.error('获取演出数据失败:', error)
  }
}

// 处理日期选择
const handleDatePick = (date: Date) => {
  selectedDate.value = date
}

// 判断是否为当前月份
const isCurrentMonth = (date: string): boolean => {
  const cellDate = new Date(date)
  const currentDate = selectedDate.value
  return cellDate.getMonth() === currentDate.getMonth() &&
         cellDate.getFullYear() === currentDate.getFullYear()
}

// 判断日期是否有演出
const hasShows = (date: string): boolean => {
  // 确保日期格式正确
  const formattedDate = formatDate(new Date(date))
  const hasData = showsData.value[formattedDate]?.length > 0
  return hasData
}

// 判断是否为选中日期
const isSelected = (date: string): boolean => {
  const formattedDate = formatDate(new Date(date))
  const isSelectedDate = formatDate(selectedDate.value) === formattedDate
  return isSelectedDate
}

// 当前选中日期的演出
const currentShows = computed(() => {
  const dateStr = formatDate(selectedDate.value)
  return showsData.value[dateStr] || []
})

// 跳转到详情页
const goToDetail = (id: number) => {
  router.push(`/shows/${id}`)
}

// 处理日期单元格点击事件
const handleDateCellClick = (date: string) => {
  console.log("[handleDateCellClick]", date)

  // 如果不是当前月份，切换到对应月份
  if (!isCurrentMonth(date)) {
    selectedDate.value = new Date(date)
    console.log(`切换到日期: ${date}`)
    return
  }

  // 当前月份的日期，检查是否有演出
  if (hasShows(date)) {
    // 有演出的日期才能选择
    selectedDate.value = new Date(date)
    console.log(`选择日期: ${date}`)
  } else {
    // 没有演出的日期禁止选择，给用户提示
    console.warn(`日期 ${date} 没有演出，禁止选择。`)
    return false
  }
}

// 监听日期变化，当月份或年份变化时重新获取数据
watch(selectedDate, (newDate, oldDate) => {
  if (!oldDate) return

  // 检查月份或年份是否发生变化
  if (newDate.getMonth() !== oldDate.getMonth() ||
      newDate.getFullYear() !== oldDate.getFullYear()) {
    console.log(`[watch] 月份变化: ${oldDate.getFullYear()}-${oldDate.getMonth()+1} -> ${newDate.getFullYear()}-${newDate.getMonth()+1}`)
    fetchShows(newDate)

    // 同步快速选择器的值
    quickSelectDate.value = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-01`
  }
})

// 初始化
onMounted(() => {
  console.log(`[onMounted] 初始日期: ${selectedDate.value.getFullYear()}-${selectedDate.value.getMonth()+1}`)
  fetchShows(selectedDate.value)

  // 初始化快速选择器的值
  const initDate = selectedDate.value
  quickSelectDate.value = `${initDate.getFullYear()}-${String(initDate.getMonth() + 1).padStart(2, '0')}-01`
})
</script>


<style scoped>
.schedule-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

/* 自定义日历头部样式 */
.custom-calendar-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #fff;
}

.header-left,
.header-right {
  flex: 0 0 auto;
}

.header-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.nav-button {
  width: 40px;
  height: 40px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  color: #495057;
  transition: all 0.2s ease;
}

.nav-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
  color: #212529;
}

.current-date-display {
  font-size: 18px;
  font-weight: 600;
  color: #212529;
  min-width: 180px;
  text-align: center;
}

.quick-selector {
  width: 160px;
}

.quick-selector :deep(.el-input__wrapper) {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.quick-selector :deep(.el-input__wrapper:hover) {
  border-color: #adb5bd;
}

.quick-selector :deep(.el-input__wrapper.is-focus) {
  border-color: #0d6efd;
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.1);
}

.quick-selector :deep(.el-input__inner) {
  color: #495057;
  text-align: center;
}

.quick-selector :deep(.el-input__inner::placeholder) {
  color: #6c757d;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  max-width: 1200px;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  overflow: hidden;
  margin-top: 20px;
}

.calendar {
  padding: 0;
}

/* 覆盖element-plus日历的默认头部样式 */
:deep(.el-calendar__header) {
  padding: 0;
  border-bottom: none;
}

:deep(.el-calendar__body) {
  padding: 20px;
}

.custom-date-cell {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  margin: 1px;
  font-weight: 500;
}

.custom-date-cell.has-shows {
  background-color: #e3f2fd;
  color: #1565c0;
}

.custom-date-cell.has-shows:hover {
  background-color: #bbdefb;
}

.custom-date-cell.selected {
  background-color: #1976d2;
  color: white;
  font-weight: 600;
}

.custom-date-cell.no-shows {
  background-color: #f8f9fa;
  color: #adb5bd;
  cursor: not-allowed;
}

.custom-date-cell.no-shows:hover {
  background-color: #f8f9fa;
}

.custom-date-cell.other-month {
  background-color: transparent;
  color: #dee2e6;
  cursor: pointer;
}

.custom-date-cell.other-month:hover {
  background-color: #f8f9fa;
  color: #6c757d;
}

/* 剧目列表滚动限制 */
.show-details {
  background-color: #fff;
  padding: 25px;
  border-left: 1px solid #e9ecef;
}

.show-details h3 {
  color: #212529;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
}

.show-details ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.show-details li {
  background-color: #f8f9fa;
  padding: 16px;
  margin: 10px 0;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.show-details li:hover {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.show-details p {
  margin: 0;
  color: #495057;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 0;
    max-width: 800px;
  }

  .show-details {
    border-left: none;
    border-top: 1px solid #e9ecef;
  }
}

@media (max-width: 768px) {
  .schedule-view {
    padding: 15px;
  }

  .custom-calendar-header {
    padding: 12px 20px;
  }

  .header-center {
    flex-direction: column;
    gap: 12px;
  }

  .current-date-display {
    font-size: 16px;
  }

  .quick-selector {
    width: 140px;
  }

  .main-content {
    gap: 0;
  }
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

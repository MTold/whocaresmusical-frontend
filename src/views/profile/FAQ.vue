<template>
  <div class="faq-container">
    <h1 class="page-title">常见问题</h1>
    
    <!-- 分类筛选 -->
    <div class="category-filter">
      <el-button 
        v-for="category in categories" 
        :key="category"
        :type="currentCategory === category ? 'primary' : 'default'"
        @click="filterByCategory(category)"
        class="category-btn"
      >
        {{ category }}
      </el-button>
      <el-button 
        type="default" 
        @click="filterByCategory('')"
        class="category-btn"
      >
        全部
      </el-button>
    </div>
    
    <!-- FAQ列表 -->
    <div class="faq-list">
      <el-collapse v-model="activeNames" accordion>
        <el-collapse-item 
          v-for="faq in filteredFAQs" 
          :key="faq.id" 
          :name="faq.id"
          class="faq-item"
        >
          <template #title>
            <div class="faq-question">
              <span class="question-text">{{ faq.question }}</span>
            </div>
          </template>
          <div class="faq-answer">
            {{ faq.answer }}
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    
    <!-- 没有找到相关问题时的提示 -->
    <div v-if="filteredFAQs.length === 0" class="no-results">
      暂时没有找到相关问题，请尝试其他分类或联系客服。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import faqData from '@/utils/faqData'
import type { FAQItem } from '@/utils/faqData'

// 当前激活的折叠面板
const activeNames = ref<number[]>([])

// 当前筛选的分类
const currentCategory = ref<string>('')

// 获取所有分类
const categories = computed(() => {
  const cats: string[] = []
  faqData.forEach(item => {
    if (!cats.includes(item.category)) {
      cats.push(item.category)
    }
  })
  return cats
})

// 筛选后的FAQ列表
const filteredFAQs = computed(() => {
  if (!currentCategory.value) {
    return faqData
  }
  return faqData.filter(item => item.category === currentCategory.value)
})

// 按分类筛选
const filterByCategory = (category: string) => {
  currentCategory.value = category
  // 重置激活的面板
  activeNames.value = []
}
</script>

<style scoped>
.faq-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 32px 28px 24px 28px;
}

.page-title {
  text-align: center;
  color: #a0522d;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: bold;
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 30px;
  justify-content: center;
}

.category-btn {
  border-radius: 20px;
  background-color: #f7f1ed;
  border-color: #d2b48c;
  color: #a0522d;
}

.category-btn:hover {
  background-color: #f0e6d2;
  border-color: #c19a6b;
  color: #8c4d1d;
}

.category-btn.is-active {
  background-color: #d2b48c;
  border-color: #a0522d;
  color: #fff;
}

.faq-list {
  margin-bottom: 30px;
}

.faq-item {
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(160, 82, 45, 0.06);
  border: 1px solid #f0e6d2;
}

.faq-question {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 15px 20px;
  background-color: #faf8f5;
}

.question-text {
  font-weight: 500;
  font-size: 16px;
  color: #59310e;
}

.faq-answer {
  padding: 20px;
  background-color: #fdfcf9;
  color: #666;
  line-height: 1.6;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #bfa074;
  font-size: 16px;
}

@media (max-width: 768px) {
  .faq-container {
    padding: 15px;
    margin: 10px;
  }
  
  .category-filter {
    gap: 8px;
  }
  
  .category-btn {
    font-size: 14px;
    padding: 8px 12px;
  }
  
  .faq-question {
    padding: 12px 15px;
  }
  
  .question-text {
    font-size: 15px;
  }
  
  .faq-answer {
    padding: 15px;
  }
  
  .page-title {
    font-size: 24px;
  }
}
</style>
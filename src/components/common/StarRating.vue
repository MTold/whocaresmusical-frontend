<template>
  <div class="star-rating">
    <el-rate
      :model-value="modelValue"
      :max="5"
      :colors="colors"
      allow-half
      :disabled="disabled"
      @change="handleChange"
    />
    <span v-if="showValue" class="rating-value">{{ modelValue }}</span>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { ElRate } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  colors: {
    type: Array,
    default: () => ['#99A9BF', '#F7BA2A', '#FF9900']
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (val: number) => {
  emit('update:modelValue', val)
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
}
.rating-value {
  font-size: 16px;
  color: #333;
  margin-left: 5px;
}
</style>

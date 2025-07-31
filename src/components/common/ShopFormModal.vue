<template>
  <div class="modal-overlay" v-if="visible">
    <div class="modal-container">
      <div class="modal-header">
        <h3>{{ isEdit ? '编辑店铺' : '添加店铺' }}</h3>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="modal-body">
          <!-- 基础信息 -->
          <div class="form-section">
            <h4 class="section-title">店铺信息</h4>

            <div class="form-group">
              <label class="form-label">店铺名称 <span class="required">*</span></label>
              <input v-model="formData.shop.name" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">店铺地址 <span class="required">*</span></label>
              <input v-model="formData.shop.address" type="text" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label">图片URL</label>
              <input v-model="formData.shop.image" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">高德ID</label>
              <input v-model="formData.shop.gaodeId" type="text" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">店铺类型 <span class="required">*</span></label>
              <select v-model="formData.shop.category" class="form-input" required>
                <option value="">请选择类型</option>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- 关联剧院 -->
          <div class="form-section">
            <h4 class="section-title">关联剧院 <span class="required">*</span></h4>

            <div class="theater-selects">
              <div
                v-for="(theaterId, index) in formData.theaterIds"
                :key="index"
                class="select-item"
              >
                <select v-model="formData.theaterIds[index]" class="form-input" required>
                  <option value="">请选择剧院</option>
                  <option v-for="theater in theaters" :key="theater.id" :value="theater.id">
                    {{ theater.name }} ({{ theater.locationName }})
                  </option>
                </select>

                <div class="btn-group">
                  <button
                    v-if="index > 0"
                    type="button"
                    class="btn btn-remove"
                    @click="removeTheaterSelect(index)"
                  >
                    <i class="fa fa-minus-circle"></i>
                  </button>

                  <button
                    v-if="index === formData.theaterIds.length - 1"
                    type="button"
                    class="btn btn-add"
                    @click="addTheaterSelect"
                  >
                    <i class="fa fa-plus-circle"></i>
                  </button>
                </div>
              </div>
            </div>

            <p
              class="error-message"
              v-if="formData.theaterIds.length === 0 || !formData.theaterIds.some((id) => id)"
            >
              至少需要关联一个剧院
            </p>
          </div>

          <!-- 错误提示 -->
          <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-cancel" @click="handleClose">取消</button>
          <button type="submit" class="btn btn-primary">确认</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits, toRefs, watch } from 'vue'
import type { Shop, ShopWithTheatersDTO, Theater } from '@/api/shop'; // 导入统一类型
 // 导入统一类型
// 类型定义（部分需要的类型）
/* interface Shop {
  id: number
  name: string
  address: string
  category: 1 | 2 | 3
  image?: string
  gaodeId?: string
}

interface Theater {
  id: number
  name: string
  locationName: string
}

interface ShopWithTheatersDTO {
  shop: Shop
  theaterIds: (number | null)[]
} */

type ShopCategory = {
  value: 1 | 2 | 3
  label: string
}

// 组件逻辑与之前相同
// 定义props类型
const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object as () => ShopWithTheatersDTO,
    required: true,
    // 默认值需要提供一个完整的ShopWithTheatersDTO对象
    default: () => ({
      shop: {
        id: 0,
        name: '',
        address: '',
        category: 1,
        image: '',
        gaodeId: '',
      },
      theaterIds: [],
    }),
  },
  theaters: {
    type: Array as () => Theater[],
    default: () => [],
  },
})

// 定义emits类型
const emits = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: ShopWithTheatersDTO): void
}>()

// 内部状态
const { visible, isEdit, initialData } = toRefs(props)
const formData = ref<ShopWithTheatersDTO>({
  shop: {
    id: 0,
    name: '',
    address: '',
    category: 1,
    image: '',
    gaodeId: ''
  },
  theaterIds: [null] // 初始至少有一个空值
});
const errorMessage = ref('')

// 计算属性：分类列表
const categories = computed<ShopCategory[]>(() => [
  { value: 1, label: '餐饮' },
  { value: 2, label: '住宿' },
  { value: 3, label: '景点' },
])

// 监听props变化，重置表单
const resetForm = () => {
  formData.value = { ...initialData.value }
  errorMessage.value = ''
}

// 添加剧院选择框
const addTheaterSelect = () => {
  formData.value.theaterIds.push(null)
}

// 删除剧院选择框
const removeTheaterSelect = (index: number) => {
  formData.value.theaterIds.splice(index, 1)
}

// 表单验证
const validateForm = (): string | null => {
  const { shop, theaterIds } = formData.value

  if (!shop.name.trim()) return '请输入店铺名称'
  if (!shop.address.trim()) return '请输入店铺地址'
  if (!shop.category) return '请选择店铺类型'
  if (!theaterIds || theaterIds.length === 0 || !theaterIds.some((id) => id)) {
    return '至少需要关联一个剧院'
  }

  return null
}

// 提交表单
const handleSubmit = () => {
  const error = validateForm()
  if (error) {
    errorMessage.value = error
    return
  }

  emits('submit', formData.value)
}

// 关闭模态框
const handleClose = () => {
  emits('close')
}

// 监听visible变化，重置表单
watch(visible, (newVal) => {
  if (newVal) resetForm()
})
</script>

<style scoped>
/* 样式保持不变 */
</style>

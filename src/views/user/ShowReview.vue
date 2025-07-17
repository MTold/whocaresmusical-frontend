<template>
  <div class="review-container">
    <div class="title-section">
      <h2 class="show-title">{{ showName }}</h2>
      <div class="subtitle-row">
        <div class="subtitle">
          用户评价（共{{ reviews.length }}条）
        </div>
        <div class="avg-rating">
          平均评分：
          <star-rating :model-value="Number(avgRating)" />
          <span class="avg-num">{{ avgRating }}</span>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="reviews-scroll">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="review-item"
      >
        <img :src="review.userImage" alt="User Image" class="user-image" />
        <div class="review-info">
          <div class="review-header">
            <span class="user-id">{{ review.userId }}</span>
            <span class="user-rating">
              <star-rating :model-value="review.rating" />
              <span class="rating-num">{{ review.rating }}</span>
            </span>
          </div>
          <div class="review-content">{{ review.content }}</div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="new-review-section">
      <div class="new-title">我来写评价</div>
      <textarea v-model="newReview.content" placeholder="评价/问题内容"></textarea>
      <div class="upload-section">

      </div>
      <div class="rating">
        <label>评分</label>
        <star-rating v-model="newReview.rating"></star-rating>
        <span>{{ newReview.rating }}</span>
      </div>
      <div class="action-btns">
        <button @click="submitReview">发布</button>
        <button @click="clearReview" class="clear-btn">清空</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import StarRating from '@/components/common/StarRating.vue';

const route = useRoute();
const showId = Number(route.params.id);

const showList = [
  { id: 1, name: '哈姆雷特' },
  { id: 2, name: '剧院魅影' },
  { id: 3, name: 'Show 3' },
  { id: 4, name: 'Show 4' },
  { id: 5, name: 'Show 5' },
  { id: 6, name: 'Show 6' }
];

const showName = ref('未知剧目');
const found = showList.find(item => item.id === showId);
if (found) showName.value = found.name;

const reviews = ref([]);
const newReview = reactive({
  content: '',
  rating: 0,
});

const avgRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, cur) => acc + cur.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

const uploadImage = () => {
  // 上传图片逻辑
};

const uploadVideo = () => {
  // 上传视频逻辑
};

const submitReview = () => {
  reviews.value.push({
    id: Date.now(),
    userImage: 'path/to/user-image.png', // 假设用户图片路径
    userId: 'User123', // 假设用户 ID
    content: newReview.content,
    rating: newReview.rating,
  });
  clearReview();
};

const clearReview = () => {
  newReview.content = '';
  newReview.rating = 0;
};

onMounted(() => {
  reviews.value = [
    { id: 1, userImage: 'path/to/image1.png', userId: 'User1', content: 'Great show!', rating: 4 },
    { id: 2, userImage: 'path/to/image2.png', userId: 'User2', content: 'Awesome!', rating: 5 },
  ];
});
</script>

<style scoped>
.review-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-width: 900px;
  padding-bottom: 80px; /* 新增，防止底栏遮挡 */
}
.title-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.show-title {
  font-size: 32px;
  font-weight: bold;
  text-align: center;
  margin-top: 16px; /* 原来可能更大，缩小 */
  margin-bottom: 4px; /* 原来是8px，缩小 */
}
.subtitle-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 900px;
  margin-bottom: 10px;
}
.subtitle {
  font-size: 18px;
  color: #333;
}
.avg-rating {
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #333;
}
.avg-num {
  margin-left: 4px;
}
.divider {
  width: 100%;
  height: 2px;
  background: #eee;
  margin: 10px 0;
}
.reviews-scroll {
  width: 100%;
  max-width: 900px;
  height: 240px; /* 原来是360px，现在缩小 */
  overflow-y: auto;
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding-right: 10px;
}
.review-item {
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 0 4px #ddd;
  padding: 12px 18px;
  display: flex;
  align-items: flex-start;
  min-height: 70px; /* 控件高度缩小 */
}
.user-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
}
.review-info {
  flex: 1;
}
.review-header {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}
.user-id {
  font-weight: bold;
  margin-right: 16px;
}
.user-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}
.rating-num {
  font-size: 16px;
  color: #666;
  margin-left: 4px;
}
.review-content {
  font-size: 16px;
  color: #333;
  margin-top: 2px;
}
.new-review-section {
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}
.new-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}
textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  padding: 8px;
  font-size: 16px;
  resize: none;
}
.upload-section {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.rating {
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-start;
}
.action-btns {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #bf5f08;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: #fff;
}
.clear-btn {
  background-color: #fff;
  color: #bf5f08;
  border: 1px solid #bf5f08;
}
star-rating {
  display: flex;
  justify-content: center;
}
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}
.pagination button {
  padding: 4px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #bf5f08;
  background: #fff;
  color: #bf5f08;
  cursor: pointer;
}
.pagination button:disabled {
  color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}
</style>

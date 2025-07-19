import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const reviewApi = axios.create({
  baseURL: API_BASE_URL,
});

// 获取某个剧目的所有评价
export const getReviewsByPerformance = async (
  performanceId: number,
  page: number = 0,
  size: number = 10,
  rating?: number | null
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  // 修复：只有当rating有具体值时才添加参数
  if (rating !== undefined && rating !== null) {
    params.append('rating', rating.toString());
  }

  const response = await reviewApi.get(`/reviews/performance/${performanceId}?${params}`);
  return response.data;
};

// 获取某个剧目的评价统计信息
export const getReviewStatistics = async (performanceId: number) => {
  const response = await reviewApi.get(`/reviews/performance/${performanceId}/statistics`);
  return response.data;
};

// 创建新评价
export const createReview = async (reviewData: {
  performanceId: number;
  content: string;
  rating: number;
}) => {
  const response = await reviewApi.post('/reviews', reviewData);
  return response.data;
};

// 检查用户是否已对某个剧目评价过
export const checkUserReviewed = async (performanceId: number) => {
  const response = await reviewApi.get(`/reviews/check/${performanceId}`);
  return response.data;
};

// 更新评价
export const updateReview = async (
  reviewId: number,
  reviewData: {
    performanceId: number;
    content: string;
    rating: number;
  }
) => {
  const response = await reviewApi.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

// 删除评价
export const deleteReview = async (reviewId: number) => {
  const response = await reviewApi.delete(`/reviews/${reviewId}`);
  return response.data;
};

// 获取用户的所有评价（匿名状态下不可用）
export const getMyReviews = async (page: number = 0, size: number = 10) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });
  
  const response = await reviewApi.get(`/reviews/user/me?${params}`);
  return response.data;
};

export default {
  getReviewsByPerformance,
  getReviewStatistics,
  createReview,
  checkUserReviewed,
  updateReview,
  deleteReview,
  getMyReviews,
};
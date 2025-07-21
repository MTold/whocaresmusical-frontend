import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const reviewApi = axios.create({
  baseURL: API_BASE_URL,
  // 建议添加超时设置
  timeout: 10000,
  withCredentials: true
});

// 获取评价列表（管理后台专用）
export const getReviewsByPerformance = async (
  performanceId: number,
  page: number = 0,
  size: number = 10,
  keyword?: string,
  status?: number
) => {
  // 构建查询参数
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('size', size.toString())
  if (keyword) params.append('keyword', keyword)
  if (status !== undefined) params.append('status', status.toString())

  // 确保 performanceId 是数字
  const validId = Number(performanceId) || 0
  const response = await reviewApi.get(`/reviews/by-status?status=${status}&${params}`)
  //const response = await reviewApi.get(`/reviews/performance/${validId}?${params}`)
  return {
    content: response.data.content || [],
    totalElements: response.data.totalElements || 0
  }
};
// 更新评价状态（管理后台专用）
export const updateReviewStatus = async (
  reviewId: number,
  status: number // 0-待审核 1-已通过 2-违规
) => {
  const response = await reviewApi.patch(`/reviews/${reviewId}/status`, { status });
  return response.data;
};

// 删除评价（管理后台专用）
export const deleteReview = async (reviewId: number) => {
  const response = await reviewApi.delete(`/reviews/${reviewId}`);
  return response.data;
};

// 以下原有方法保持不变（用户端功能）
export const getReviewStatistics = async (performanceId: number) => {
  const response = await reviewApi.get(`/reviews/performance/${performanceId}/statistics`);
  return response.data;
};

export const createReview = async (reviewData: {
  performanceId: number;
  content: string;
  rating: number;
}) => {
  const response = await reviewApi.post('/reviews', reviewData);
  return response.data;
};

export const checkUserReviewed = async (performanceId: number) => {
  const response = await reviewApi.get(`/reviews/check/${performanceId}`);
  return response.data;
};

export const updateReview = async (
  reviewId: number,
  reviewData: {
    content: string;
    rating: number;
  }
) => {
  const response = await reviewApi.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

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
  updateReviewStatus,
  deleteReview,
  getReviewStatistics,
  createReview,
  checkUserReviewed,
  updateReview,
  getMyReviews,
};

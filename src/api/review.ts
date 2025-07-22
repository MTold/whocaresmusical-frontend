import axios from 'axios';
import { authApi } from '@/api/auth';

// 使用Vite代理配置，所以使用相对路径
const reviewApi = axios.create({
  baseURL: 'http://localhost:8080/api', 
  timeout: 10000,
  withCredentials: true
});

// 添加请求拦截器来自动添加token
reviewApi.interceptors.request.use(
  (config) => {
    const token = authApi.getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 获取评价列表（管理后台专用）
export const getReviewsByPerformance = async (
  performanceId: number,
  page: number = 0,
  size: number = 10,
  rating?: number
) => {
  // 构建查询参数
  const params = new URLSearchParams()
  params.append('page', page.toString())
  params.append('size', size.toString())
  if (rating) params.append('rating', rating.toString())

  // 确保 performanceId 是数字
  const validId = Number(performanceId) || 1
  const response = await reviewApi.get(`/reviews/performance/${validId}?${params}`)
  
  return {
    content: response.data.content || [],
    totalElements: response.data.totalElements || 0,
    totalPages: response.data.totalPages || 0,
    pageNumber: response.data.pageNumber || page
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

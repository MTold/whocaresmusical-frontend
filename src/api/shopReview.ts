import axios from 'axios'
import { authApi } from '@/api/auth'

// 使用Vite代理配置，所以使用相对路径
const shopReviewApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 10000,
  withCredentials: true,
})

// 按状态获取评价列表
export const getShopReviewsByStatus = async (
  status: number,
  page: number = 0,
  size: number = 10,
  //keyword?: string 可选关键词参数，要求后端也要对应
) => {
  const params = new URLSearchParams({
    status: status.toString(),
    page: page.toString(),
    size: size.toString(),
    //if (keyword) {params.append('keyword', keyword);}
  })

  const response = await shopReviewApi.get(`/reviews/by-status`, { params })
  return {
    content: response.data.content || [],
    totalElements: response.data.totalElements || 0,
    totalPages: response.data.totalPages || 0,
    pageNumber: response.data.pageNumber || page,
  }
}

// 添加请求拦截器来自动添加token
shopReviewApi.interceptors.request.use(
  (config) => {
    const token = authApi.getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 按店铺获取评价列表
export const getShopReviewsByShop = async (shopId: number) => {
  // 构建查询参数
  const params = new URLSearchParams()
  params.append('status', '1')

  // 确保 shopId 是数字
  const validId = Number(shopId) || 1
  const response = await shopReviewApi.get(`/shopReviews/shop/${validId}?${params}`)
  console.log("函数获取数据 ",response.data)
  return response.data

}
// 更新评价状态（管理后台专用）
export const updateReviewStatus = async (
  shopReviewId: number,
  status: number, // 0-待审核 1-已通过 2-违规
) => {
  const response = await shopReviewApi.patch(`/shopReviews/${shopReviewId}/status`, { status })
  return response.data
}

// 删除评价（管理后台专用）
export const deleteShopReview = async (shopReviewId: number) => {
  const response = await shopReviewApi.delete(`/reviews/${shopReviewId}`)
  return response.data
}

// 以下原有方法保持不变（用户端功能）

export const createShopReview = async (shopReviewData: { shopId: number; content: string }) => {
  const response = await shopReviewApi.post('/shopReviews', shopReviewData)
  return response.data
}

export const updateShopReview = async (
  shopReviewId: number,
  shopReviewData: {
    content: string
  },
) => {
  const response = await shopReviewApi.put(`/shopReviews/${shopReviewId}`, shopReviewData)
  return response.data
}

export const getMyShopReviews = async () => {
  const params = new URLSearchParams({

  })

  const response = await shopReviewApi.get(`/shopReviews/user/me?${params}`)
  return response.data
}

export default {
  getShopReviewsByShop,
  getShopReviewsByStatus,
  updateReviewStatus,
  deleteShopReview,
  createShopReview,
  updateShopReview,
  getMyShopReviews,
}

import axios from 'axios'

// 使用Vite代理配置，所以使用相对路径
const API_BASE_URL = 'http://localhost:8080/api'

export interface FavoriteItem {
  id: number
  musicalId: number
  musicalName: string
  musicalImage: string
  musicalDescription: string
  musicalVenue: string
  createdAt: string
}

export interface FavoritePageResponse {
  content: FavoriteItem[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * 添加收藏
 */
export function addFavorite(musicalId: number) {
  return axios.post(`${API_BASE_URL}/favorites/${musicalId}`)
}

/**
 * 取消收藏
 */
export function removeFavorite(musicalId: number) {
  return axios.delete(`${API_BASE_URL}/favorites/${musicalId}`)
}

/**
 * 获取用户收藏列表
 */
export function getUserFavorites(page: number = 0, size: number = 10) {
  return axios.get<FavoritePageResponse>(`${API_BASE_URL}/favorites`, {
    params: { page, size }
  })
}

/**
 * 检查是否已收藏
 */
export function checkFavoriteStatus(musicalId: number) {
  return axios.get<boolean>(`${API_BASE_URL}/favorites/${musicalId}/status`)
}

/**
 * 获取收藏数量
 */
export function getFavoriteCount() {
  return axios.get<number>(`${API_BASE_URL}/favorites/count`)
}
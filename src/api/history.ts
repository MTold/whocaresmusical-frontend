import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

export interface BrowsingHistoryItem {
  id: number
  musicalId: number
  musicalName: string
  musicalImage: string
  musicalDescription: string
  musicalVenue: string
  viewedAt: string
}

export interface BrowsingHistoryPageResponse {
  content: BrowsingHistoryItem[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

/**
 * 记录用户浏览剧目
 */
export function recordBrowsing(musicalId: number) {
  return axios.post(`${API_BASE_URL}/history/browse/${musicalId}`)
}

/**
 * 获取用户浏览历史
 */
export function getBrowsingHistory(page: number = 0, size: number = 10) {
  return axios.get<BrowsingHistoryPageResponse>(`${API_BASE_URL}/history`, {
    params: { page, size }
  })
}

/**
 * 获取浏览历史数量
 */
export function getBrowsingHistoryCount() {
  return axios.get<number>(`${API_BASE_URL}/history/count`)
}

/**
 * 清空浏览历史
 */
export function clearBrowsingHistory() {
  return axios.delete(`${API_BASE_URL}/history/clear`)
}

/**
 * 删除单条浏览记录
 */
export function deleteBrowsingHistory(historyId: number) {
  return axios.delete(`${API_BASE_URL}/history/${historyId}`)
}
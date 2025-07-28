import axios from 'axios'
import type { User } from '@/types/user'

const API_BASE_URL = 'http://localhost:8080/api'

export const userApi = {
  // 获取当前用户信息
  getCurrentUser: async (): Promise<User> => {
    const response = await axios.get(`${API_BASE_URL}/user/me`)
    return response.data
  },

  // 更新当前用户信息
  updateCurrentUser: async (userData: Partial<User>): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/user/me`, userData)
    return response.data
  }
}
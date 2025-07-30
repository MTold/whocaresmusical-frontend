import axios from 'axios'
import type { Message } from '@/types/message'

const API_BASE_URL = '/api/messages'

export const messageApi = {
  // 获取所有消息
  getAllMessages: async (): Promise<Message[]> => {
    const response = await axios.get(API_BASE_URL)
    return response.data
  },

  // 根据ID获取消息
  getMessageById: async (id: number): Promise<Message> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`)
    return response.data
  },

  // 创建新消息（仅管理员）
  createMessage: async (message: Omit<Message, 'messageId' | 'createdAt' | 'updatedAt'>): Promise<Message> => {
    const response = await axios.post(API_BASE_URL, message)
    return response.data
  },

  // 更新消息（仅管理员）
  updateMessage: async (id: number, message: Partial<Omit<Message, 'messageId' | 'createdAt' | 'updatedAt'>>): Promise<Message> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, message)
    return response.data
  },

  // 删除消息（仅管理员）
  deleteMessage: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`)
  }
}
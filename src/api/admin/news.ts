import axios from 'axios';
import type { News } from '@/types/news';

const API_BASE_URL = 'http://localhost:8080/api/news'; // 更新为正确的新闻 API 路径

export const newsApi = {
  // 获取所有新闻
  getAllNews: async (): Promise<News[]> => {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  },

  // 根据ID获取新闻
  getNewsById: async (id: number): Promise<News> => {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  // 创建新新闻（仅管理员）
  createNews: async (news: Omit<News, 'id'>): Promise<News> => {
    const response = await axios.post(API_BASE_URL, news);
    return response.data;
  },

  // 更新新闻（仅管理员）
  updateNews: async (id: number, news: Partial<Omit<News, 'id'>>): Promise<News> => {
    const response = await axios.put(`${API_BASE_URL}/${id}`, news);
    return response.data;
  },

  // 删除新闻（仅管理员）
  deleteNews: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${id}`);
  }
};

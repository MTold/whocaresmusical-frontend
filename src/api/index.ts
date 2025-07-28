import axios from 'axios'
import type { News } from '@/types/news';
const API_BASE_URL = 'http://localhost:8080/api/news'; // 更新为正确的新闻 API 路径


export const getNewsList = async (): Promise<News[]> => {
  try {
   const response = await axios.get(API_BASE_URL);
   return response.data;
 } catch (error) {
   console.error('Failed to fetch news:', error);
   throw error;
  }
};

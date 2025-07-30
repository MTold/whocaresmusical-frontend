// src/api/shop.ts
import axios from 'axios';
//import { authApi } from '@/api/auth';

const shopApi = axios.create({
  baseURL: '/api/theaters',
  timeout: 10000,
  withCredentials: true,
});

//按剧院获取店铺列表
export const getShopsByTheaterId = async (theaterId: number) => {
  try {
    const response = await shopApi.get(`/${theaterId}/shops`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching shops with theaterId ${theaterId}:`, error);
    return [];
  }
};

export default {
  getShopsByTheaterId
};

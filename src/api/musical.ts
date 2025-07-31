// src/api/musical.ts
import axios from 'axios';

const musicalApi = axios.create({
  baseURL: '/api/musicals',
  timeout: 10000,
  withCredentials: true,
});

// 获取所有原创的音乐剧
export const getOriginalMusicals = async () => {
  try {
    const response = await musicalApi.get('/original');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching original musicals:', error);
    return [];
  }
};

// 获取所有非原创的音乐剧
export const getNonOriginalMusicals = async () => {
  try {
    const response = await musicalApi.get('/non-original');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching non-original musicals:', error);
    return [];
  }
};

// 获取所有音乐剧
export const getAllMusicals = async () => {
  try {
    const response = await musicalApi.get('');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all musicals:', error);
    return [];
  }
};

// 根据 id 查询指定的音乐剧
export const getMusicalById = async (id: number) => {
  try {
    const response = await musicalApi.get(`/${id}`);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching musical with id ${id}:`, error);
    return null;
  }
};

// 获取高评分的音乐剧
export const getTopRatedMusicals = async () => {
  try {
    const response = await musicalApi.get('/top-rated');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching top rated musicals:', error);
    return [];
  }
};

// 更新音乐剧
export const updateMusical = async (id: number, data: any) => {
  try {
    const res = await musicalApi.put(`/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating musical:', error);
    throw error;
  }
};

// 删除剧目
export const deleteMusical = async (id: number) => {
  try {
    const res = await musicalApi.delete(`/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting musical with id ${id}:`, error);
    throw error;
  }
};

// 添加剧目
export const createMusical = async (data: any) => {
  try {
    const res = await musicalApi.post('', data);
    return res.data;
  } catch (error) {
    console.error('Error creating musical:', error);
    throw error;
  }
};

export default {
  getOriginalMusicals,
  getNonOriginalMusicals,
  getAllMusicals,
  getMusicalById,
  getTopRatedMusicals,
  updateMusical,
  deleteMusical,
  createMusical,
};

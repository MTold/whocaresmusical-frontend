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
export const getMusicalById = async (id:number) => {
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

export const updateMusical = async (id: number, data: any) => {
  const res = await musicalApi.put(`/${id}`, data);
  return res.data;
};

export const deleteTheater = async (id: number) => {
  const res = await musicalApi.delete(`/${id}`);
  return res.data;
};


export default {
  getOriginalMusicals,
  getNonOriginalMusicals,
  getAllMusicals,
  getMusicalById,
  getTopRatedMusicals,
  updateMusical,
  deleteTheater,
};

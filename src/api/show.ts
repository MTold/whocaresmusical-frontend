import axios from 'axios';

const showApi = axios.create({
  baseURL: '/api/shows',
  timeout: 10000,
  withCredentials: true,
});

// 获取所有演出
export const getAllShows = async () => {
  try {
    const response = await showApi.get('');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all shows:', error);
    return [];
  }
};

export const getMusicals = async (): Promise<any[]> => {
  try {
    const response = await axios.get('http://localhost:8080/api/musicals');
    return response.data;
  } catch (error) {
    console.error('Error fetching all shows:', error);
    throw error; // Re-throw the error to handle it in the component
  }
};

// 获取指定 musical_id 的所有演出
export const getShowsByMusicalId = async (musicalId: number) => {
  try {
    const response = await showApi.get(`/musical/${musicalId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching shows for musical_id ${musicalId}:`, error);
    return [];
  }
};

// 获取指定 theater_id 的所有演出
export const getShowsByTheaterId = async (theaterId: number) => {
  try {
    const response = await showApi.get(`/theater/${theaterId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching shows for theater_id ${theaterId}:`, error);
    return [];
  }
};

// 创建排期
export const createShow = async (data: any) => {
  try {
    const response = await showApi.post('', data);
    return response.data;
  } catch (error) {
    console.error(`Error creating show:`, error);
    throw error;
  }
};

// 更新排期
export const updateShow = async (showId: number, data: any) => {
  try {
    const response = await showApi.put(`/${showId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating show with id ${showId}:`, error);
    throw error;
  }
};

// 删除排期
export const deleteShow = async (showId: number) => {
  try {
    const response = await showApi.delete(`/${showId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting show with id ${showId}:`, error);
    throw error;
  }
};

export default {
  getAllShows,
  getMusicals,
  getShowsByMusicalId,
  getShowsByTheaterId,
  createShow,
  updateShow,
  deleteShow,
};

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

export default {
  getAllShows,
  getMusicals,
  getShowsByMusicalId,
  getShowsByTheaterId,
};

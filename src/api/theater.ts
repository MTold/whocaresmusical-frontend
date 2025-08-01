// src/api/theater.ts
import axios from 'axios'

const theaterApi = axios.create({
  baseURL: '/api/theaters',
  timeout: 10000,
  withCredentials: true,
})

export const getAllTheaters = async () => {
  try {
    const response = await theaterApi.get('');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all theaters:', error)
    return []
  }
}

export const getTheaterById = async (id: number) => {
  try {
    const response = await theaterApi.get(`/${id}`)
    return response.data || null
  } catch (error) {
    console.error(`Error fetching theater with id ${id}:`, error)
    return null
  }
}

export const updateTheater = async (id: number, data: any) => {
  const res = await theaterApi.put(`/${id}`, data);
  return res.data;
};

export const deleteTheater = async (id: number) => {
  const res = await theaterApi.delete(`/${id}`);
  return res.data;
};

export const createTheater = async (data: any) => {
  try {
    const res = await theaterApi.post('', data);
    return res.data;
  } catch (error) {
    console.error('Error creating theater:', error);
    throw error;
  }
};

export default {
  getAllTheaters,
  getTheaterById,
  updateTheater,
  deleteTheater,
  createTheater,
};

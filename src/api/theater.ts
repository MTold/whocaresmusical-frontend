// src/api/theater.ts
import axios from 'axios';

const musicalApi = axios.create({
  baseURL: 'http://localhost:8080/api/theaters',
  timeout: 10000,
  withCredentials: true,
});

export const getAllTheaters = async () => {
  try {
    const response = await musicalApi.get('');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all theaters:', error);
    return [];
  }
};

export const getTheaterById = async (id:number) => {
  try {
    const response = await axios.get(`/${id}`);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching theater with id ${id}:`, error);
    return null;
  }
};

export default {
  getAllTheaters,
  getTheaterById,
};

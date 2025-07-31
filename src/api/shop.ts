// src/api/shop.ts
import axios from 'axios'
//import { authApi } from '@/api/auth';

const shopApi = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true,
})

//按剧院获取店铺列表
export const getShopsByTheaterId = async (theaterId: number) => {
  try {
    const response = await shopApi.get(`/theaters/${theaterId}/shops`)
    return response.data || []
  } catch (error) {
    console.error(`Error fetching shops with theaterId ${theaterId}:`, error)
    return []
  }
}

//为店铺管理新增
// src/api/shopService.ts
//import service from './index';
//import { Shop, Theater, ShopWithTheatersDTO } from '../types/shop';
export interface Shop {
  id: number
  name: string
  address: string
  category: 1 | 2 | 3 // 1=餐饮, 2=住宿, 3=景点
  image?: string
  gaodeId?: string
  createTime?: string
  updateTime?: string
}

export interface Theater {
  id: number
  name: string
  locationName: string
  longitude: string
  latitude: string
}

/* export interface ShopWithTheatersDTO {
  shop: Shop
  theaterIds: number[] // 关联的剧院ID列表
  theaters: Theater[] // 关联的剧院详情
} */
export interface ShopWithTheatersDTO {
  shop: Shop
  theaterIds: (number | null)[]
  theaters?: Theater[] // 用可选属性 "?" 标记，允许不存在
}

// 分页结果通用类型
export interface Page<T> {
  content: T[];          // 当前页数据
  totalElements: number; // 总条数
  totalPages: number;    // 总页数
  size: number;          // 每页条数
  number: number;        // 当前页码（后端从0开始）
}


// 搜索店铺
/* export const searchShops = (shopName?: string, theaterKeyword?: string) => {
  return shopApi.get<ShopWithTheatersDTO[]>('/shops/search', {
    params: { shopName, theaterKeyword },
  })
} */
/* export const searchShops = async (shopName?: string, theaterKeyword?: string) => {
  const response = await shopApi.get('/shops/search', {
    params: { shopName, theaterKeyword },
  })
  return response.data // 直接返回数据部分
} */
export const searchShops = async (
  shopName?: string,
  theaterKeyword?: string,
  page = 0,  // 后端页码从0开始（默认第0页）
  size = 10  // 每页条数（默认10条）
) => {
  const response = await shopApi.get('/shops/search', {
    params: { shopName, theaterKeyword, page, size },  // 传递分页参数
  });
  return response.data as Page<ShopWithTheatersDTO>;  // 明确返回类型为分页对象
};

// 获取单个店铺及关联剧院
export const getShopWithTheaters = (id: number) => {
  return shopApi.get<ShopWithTheatersDTO>(`/shops/${id}/with-theaters`)
}

// 添加店铺
export const addShop = (data: ShopWithTheatersDTO) => {
  return shopApi.post<Shop>('/shops', data)
}

// 更新店铺
export const updateShop = (id: number, data: ShopWithTheatersDTO) => {
  return shopApi.put<Shop>(`/shops/${id}`, data)
}

// 删除店铺
export const deleteShop = (id: number) => {
  return shopApi.delete(`/shops/${id}`)
}

// 获取所有剧院
/* export const getAllTheaters = () => {
  return shopApi.get<Theater[]>('/shops/theaters')
} */
export const getAllTheaters = async () => {
  const response = await shopApi.get<Theater[]>('/shops/theaters')
  return response.data // 直接返回数据数组
}

export default {
  getShopsByTheaterId,
  searchShops,
  getShopWithTheaters,
  addShop,
  updateShop,
  deleteShop,
  getAllTheaters,
}

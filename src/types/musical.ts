export interface Musical {
  id: number
  name: string
  description?: string
  genre?: string
  venue?: string
  info?: string
  isOriginal?: boolean
  // 数据库字段名（snake_case）
  average_rating?: number
  imageUrl?: string
  // 前端使用的字段名（camelCase）
  rating?: number
  averageRating?: number
  reviewCount?: number
  posterUrl?: string
  createdAt?: string
  updatedAt?: string
}
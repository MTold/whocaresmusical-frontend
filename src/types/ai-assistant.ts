export interface ThemeConfig {
  primaryColor: string
  secondaryColor: string
  size: 'small' | 'medium' | 'large'
  shape: 'circle' | 'square' | 'rounded'
  animation: 'bounce' | 'pulse' | 'none'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface UserBehaviorData {
  browsingHistory: any[]
  favorites: any[]
  reviews: any[]
}

export interface Recommendation {
  id: number
  name: string
  description: string
  genre: string
  averageRating: number
  imageUrl?: string
  reviewCount: number
}
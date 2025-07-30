import axios from 'axios'
import type { UserBehaviorData, Recommendation } from '@/types/ai-assistant'

// 创建专门的axios实例用于AI助手，避免全局拦截器影响
const aiAxios = axios.create({
  baseURL: 'http://localhost:8080/api'
})

// 创建独立的axios实例用于外部API调用（Moonshot API）
const externalApi = axios.create({
  timeout: 10000
})

// 为AI助手API添加请求拦截器，但不添加响应拦截器
aiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器，防止401错误导致重定向
aiAxios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 对于401错误，直接返回错误而不重定向
    if (error.response?.status === 401) {
      console.log('AI助手API认证失败，但不重定向')
      return Promise.reject(error)
    }
    return Promise.reject(error)
  }
)

// AI Assistant API service
export const aiAssistantApi = {
  // Get user behavior data for recommendations
  getUserBehaviorData: async (): Promise<UserBehaviorData> => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('用户未登录，跳过用户数据获取')
        return {
          browsingHistory: [],
          favorites: [],
          reviews: []
        }
      }

      try {
        console.log('用户已登录，获取用户行为数据...')
        
        // 获取用户数据
        const [historyRes, favoritesRes, reviewsRes] = await Promise.all([
          aiAxios.get('/history?size=20').catch(e => {
            console.error('获取浏览历史失败:', e)
            return { data: { content: [] } }
          }),
          aiAxios.get('/favorites?size=20').catch(e => {
            console.error('获取收藏失败:', e)
            return { data: { content: [] } }
          }),
          aiAxios.get('/reviews/user/me?size=20').catch(e => {
            console.error('获取评价失败:', e)
            return { data: { content: [] } }
          })
        ])

        const history = historyRes.data?.content || historyRes.data || []
        const favorites = favoritesRes.data?.content || favoritesRes.data || []
        const reviews = reviewsRes.data?.content || reviewsRes.data || []

        console.log('获取到的用户数据:', {
          browsingHistory: history.length,
          favorites: favorites.length,
          reviews: reviews.length,
          sampleHistory: history.slice(0, 2),
          sampleFavorites: favorites.slice(0, 2),
          sampleReviews: reviews.slice(0, 2)
        })

        return {
          browsingHistory: history,
          favorites: favorites,
          reviews: reviews
        }
      } catch (error: any) {
        console.error('获取用户数据失败:', error)
        return {
          browsingHistory: [],
          favorites: [],
          reviews: []
        }
      }
    } catch (error) {
      console.error('Failed to fetch user behavior data:', error)
      return {
        browsingHistory: [],
        favorites: [],
        reviews: []
      }
    }
  },
  
  // Get personalized recommendations
  getPersonalizedRecommendations: async (): Promise<Recommendation[]> => {
    try {
      // 无论是否登录，都使用top-rated端点获取热门推荐
      const response = await aiAxios.get('/musicals/top-rated', {
        params: { limit: 10 }
      });
      
      // 将Musical类型转换为Recommendation类型
      return response.data.map((musical: any) => ({
        id: musical.id,
        name: musical.name,
        description: musical.info || musical.description || '暂无描述',
        genre: musical.genre || '音乐剧',
        averageRating: Number(musical.averageRating || 0),
        reviewCount: 0, // 将从后端获取实际数据
        imageUrl: musical.imageUrl || ''
      })) || [];
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      return [];
    }
  },
  
  // Get related musicals based on a specific musical
  getRelatedMusicals: async (musicalId: number): Promise<Recommendation[]> => {
    try {
      // 使用top-rated作为相关推荐
      const response = await aiAxios.get('/musicals/top-rated', {
        params: { limit: 10 }
      });
      
      // 过滤掉当前剧目，返回其他高评分剧目
      return response.data
        .filter((musical: any) => musical.id !== musicalId)
        .slice(0, 5)
        .map((musical: any) => ({
          id: musical.id,
          name: musical.name,
          description: musical.info || musical.description || '暂无描述',
          genre: musical.genre || '音乐剧',
          averageRating: Number(musical.averageRating || 0),
          reviewCount: 0,
          imageUrl: musical.imageUrl || ''
        })) || [];
    } catch (error) {
      console.error('Failed to fetch related musicals:', error)
      return [];
    }
  },
  
  // Send message to external AI service (Moonshot API)
  sendMessageToAI: async (message: string, userData: UserBehaviorData | null): Promise<string> => {
    try {
      let systemPrompt = "你是一个专业的音乐剧推荐助手，专门回答用户关于音乐剧的问题。请用中文回复，语气友好亲切。"
      let contextMessage = ""
      
      if (userData && (userData.browsingHistory.length > 0 || userData.favorites.length > 0)) {
        contextMessage = `用户浏览历史: ${JSON.stringify(userData.browsingHistory)}, 用户收藏: ${JSON.stringify(userData.favorites)}, 用户评价: ${JSON.stringify(userData.reviews)}`
      }

      // Prepare the message for Moonshot API
      const messages = [
        {
          role: "system",
          content: systemPrompt
        }
      ]

      // 如果有用户数据，添加上下文
      if (contextMessage) {
        messages.push({
          role: "user",
          content: contextMessage
        })
      }

      // 添加用户消息
      messages.push({
        role: "user",
        content: message
      })
      
      // Call Moonshot API - 使用独立的axios实例避免全局拦截器影响
      const response = await externalApi.post('https://api.moonshot.cn/v1/chat/completions', {
        model: "moonshot-v1-8k",
        messages: messages,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_MOONSHOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      })
      
      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Failed to communicate with Moonshot API:', error)
      // 降级到本地回复
      return "抱歉，我遇到了一些技术问题。我可以为您推荐一些经典音乐剧，比如《汉密尔顿》、《歌剧魅影》和《狮子王》。请问您对哪种类型的音乐剧感兴趣呢？"
    }
  }
}
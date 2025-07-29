import axios from 'axios'

// 配置axios全局设置
const setupAxios = () => {
  // 请求拦截器，自动添加token
  axios.interceptors.request.use(
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

  // 响应拦截器，处理token过期
  axios.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response?.status === 401) {
        // 排除AI助手相关的API调用，避免触发登录重定向
        const url = error.config?.url || ''
        const method = error.config?.method || ''
        
        // AI助手相关API端点 - 这些调用不应该触发登录重定向
        const aiRelatedEndpoints = [
          '/history',
          '/favorites', 
          '/reviews/user/me',
          '/musicals/top-rated',
          '/api/history',
          '/api/favorites',
          '/api/reviews/user/me',
          '/api/musicals/top-rated'
        ]
        
        const isAiRelated = aiRelatedEndpoints.some(endpoint => 
          url.includes(endpoint) || url.endsWith(endpoint)
        )
        
        if (isAiRelated) {
          // AI助手相关API，不触发登录重定向，直接返回错误
          return Promise.reject(error)
        }
        
        // 其他API调用，正常处理token过期
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('isAdmin')
        
        // 确保不会无限重定向
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    }
  )
}

export default setupAxios
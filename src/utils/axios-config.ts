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
        // Token过期，清除本地存储并重定向到登录页
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('isAdmin')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

export default setupAxios
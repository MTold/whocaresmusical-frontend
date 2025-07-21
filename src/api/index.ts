import axios from 'axios'

export const getNewsList = async () => {
  const response = await axios.get('/api/news')
  return response.data
}

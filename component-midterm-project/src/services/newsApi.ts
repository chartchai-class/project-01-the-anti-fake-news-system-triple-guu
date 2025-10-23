import apiClient from './AxiosClient'

export async function fetchNewsApi(limit = 100) {
  const res = await apiClient.get(`/news?_limit=${limit}`)
  return res.data
}

export async function createNewsApi(newsData: any) {
  const res = await apiClient.post('/news', newsData)
  return res.data
}

// Add more news-related API calls as needed

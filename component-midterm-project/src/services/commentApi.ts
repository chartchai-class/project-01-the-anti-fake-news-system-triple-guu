import apiClient from './AxiosClient'

export async function fetchCommentsApi(newsId: number | string) {
  const res = await apiClient.get(`/news/${newsId}/comments`)
  return res.data
}

export async function addCommentApi(newsId: number | string, text: string) {
  const userId = localStorage.getItem('userId')
  if (!userId) throw new Error('User not logged in')
  const payload = {
    content: text,
    user: { id: userId },
    news: { id: newsId }
  }
  const res = await apiClient.post(`/news/${newsId}/comments`, payload)
  return res.data
}

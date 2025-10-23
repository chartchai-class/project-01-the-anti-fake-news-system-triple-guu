import apiClient from './AxiosClient'

export async function voteApi(newsId: number | string, dir: 1 | -1) {
  const userId = localStorage.getItem('userId')
  if (!userId) throw new Error('User not logged in')
  const type = dir === 1 ? 'NOT_FAKE' : 'FAKE'
  await apiClient.post(`/news/${newsId}/vote`, null, { params: { userId, type } })
}

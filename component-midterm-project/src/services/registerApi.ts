import apiClient from './AxiosClient'

export async function registerApi(userData: any) {
  const res = await apiClient.post('/auth/register', userData)
  return res.data
}

// Add more registration-related API calls as
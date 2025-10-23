
import { defineStore } from 'pinia'
import apiClient from '@/services/AxiosClient'

// No need to add /api/v1 here, VITE_BACKEND_BASE should include it
const EP = {
  auth: '/auth',
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('jwt') || null as string | null,
    username: localStorage.getItem('username') || null as string | null,
  }),
  actions: {

    async login(username: string, password: string) {
      try {
        const res = await apiClient.post(`${EP.auth}/authenticate`, { username, password });
        const body = res.data;
        // AuthenticationResponse likely contains accessToken or token property
        const token = body.token || body.accessToken || body.jwt || body.access_token || body.data?.token;
        const userId = body.id;
        if (!token) throw new Error('No token in authentication response');
        if (!userId) throw new Error('No userId in authentication response');
        this.token = token;
        this.username = username;
        localStorage.setItem('jwt', token);
        localStorage.setItem('username', username);
        localStorage.setItem('userId', String(userId));
        return body;
      } catch (error: any) {
        if (error.response && error.response.data) {
          throw new Error('Login failed: ' + (error.response.data.message || JSON.stringify(error.response.data)));
        } else {
          throw new Error('Login failed: ' + error.message);
        }
      }
    },

    logout() {
      this.token = null;
      this.username = null;
      localStorage.removeItem('jwt');
      localStorage.removeItem('username');
      localStorage.removeItem('userId');
    },
  },
})

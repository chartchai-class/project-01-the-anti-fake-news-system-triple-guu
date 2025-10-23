import { defineStore } from 'pinia'
import apiClient from '@/services/AxiosClient'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    user: null as any,
    profileImageUrl: '/default-profile.png',
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchProfile() {
      const userId = localStorage.getItem('userId')
      if (!userId) return
      this.loading = true
      this.error = null
      try {
        const res = await apiClient.get(`/users/${userId}`)
        this.user = res.data
        if (this.user.profileImage) {
          this.profileImageUrl = this.user.profileImage
        } else {
          this.profileImageUrl = '/default-profile.png'
        }
      } catch (e: any) {
        this.error = e?.message || 'Failed to fetch profile'
      } finally {
        this.loading = false
      }
    },
    async updateProfile(profileData: { name: string; surname: string; username: string; email: string }) {
      const userId = localStorage.getItem('userId')
      if (!userId) throw new Error('No userId found')
      this.loading = true
      this.error = null
      try {
        const res = await apiClient.put(`/users/${userId}`, profileData)
        this.user = res.data
        if (this.user.profileImage) {
          this.profileImageUrl = this.user.profileImage
        } else {
          this.profileImageUrl = '/default-profile.png'
        }
      } catch (e: any) {
        this.error = e?.message || 'Failed to update profile'
        throw e
      } finally {
        this.loading = false
      }
    },
  },
})

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center relative">
      <!-- Profile image -->
      <div class="mb-6">
        <img
          :src="profileStore.profileImageUrl"
          alt="Profile"
          class="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
        />
      </div>

      <!-- Name -->
      <h2 class="text-2xl font-bold text-gray-800 text-center">
        {{ profileStore.user?.name }} {{ profileStore.user?.surname }}
      </h2>

      <!-- Username -->
      <p class="text-gray-500 text-sm text-center mb-4">
        @{{ profileStore.user?.username }}
      </p>

      <!-- Info card -->
      <div class="w-full bg-gray-100 rounded-xl p-4 mb-6">
        <div class="space-y-2 text-gray-700">
          <div class="flex justify-between border-b border-gray-200 pb-2">
            <span class="font-semibold">Email:</span>
            <span>{{ profileStore.user?.email }}</span>
          </div>
          <div class="flex justify-between pt-2">
            <span class="font-semibold">Role:</span>
            <span class="capitalize">{{ profileStore.user?.role }}</span>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col sm:flex-row gap-3 w-full">
        <button
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm transition-all"
          @click="editProfile"
        >
          Edit Profile
        </button>
        <button
          class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg shadow-sm transition-all"
          @click="logout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profile'

const authStore = useAuthStore()
const router = useRouter()
const profileStore = useProfileStore()

function editProfile() {
  router.push('/edit-profile')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  profileStore.fetchProfile()
})
</script>

<style scoped>
</style>

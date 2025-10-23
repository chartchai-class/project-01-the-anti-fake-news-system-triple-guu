<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-50">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center relative">
      <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Edit Profile</h2>
      <!-- Profile image and upload -->
      <div class="mb-6 flex flex-col items-center relative group">
        <img
          :src="profileImagePreview || profileStore.profileImageUrl"
          alt="Profile"
          class="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow mb-2"
        />
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="onImageChange"
        />
        <button
          type="button"
          class="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow transition-all focus:outline-none opacity-80 group-hover:opacity-100"
          @click="triggerFileInput"
          title="Change profile image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM4 19a8 8 0 1116 0H4z" />
          </svg>
        </button>
      </div>
      <form class="w-full" @submit.prevent="saveProfile">
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-1" for="name">First Name</label>
          <input v-model="form.name" id="name" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400" style="background-color: #fff !important; color: #111 !important;" required />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-1" for="surname">Last Name</label>
          <input v-model="form.surname" id="surname" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400" style="background-color: #fff !important; color: #111 !important;" required />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-1" for="username">Username</label>
          <input v-model="form.username" id="username" type="text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400" style="background-color: #fff !important; color: #111 !important;" required />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 font-semibold mb-1" for="email">Email</label>
          <input v-model="form.email" id="email" type="email" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400" style="background-color: #fff !important; color: #111 !important;" required />
        </div>
        <div class="flex gap-3 mt-6">
          <button type="submit" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm transition-all">Save</button>
          <button type="button" class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg shadow-sm transition-all" @click="cancelEdit">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'

const router = useRouter()
const profileStore = useProfileStore()


const form = ref({
  name: '',
  surname: '',
  username: '',
  email: ''
})

const fileInput = ref<HTMLInputElement|null>(null)
const profileImagePreview = ref<string|null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function onImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    profileImagePreview.value = URL.createObjectURL(file)
    uploadProfileImage(file)
  }
}

async function uploadProfileImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const userId = localStorage.getItem('userId')
  const token = localStorage.getItem('jwt')
  if (!userId || !token) {
    alert('Not authenticated')
    return
  }
  const response = await fetch(`/api/v1/users/${userId}/profile-image`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (response.ok) {
    // Wait for backend to update, then fetch new image
    await nextTick()
    await profileStore.fetchProfile()
    // Force reload by appending a cache-busting query param
    if (profileStore.profileImageUrl) {
      profileStore.profileImageUrl = profileStore.profileImageUrl.split('?')[0] + '?t=' + Date.now()
    }
    profileImagePreview.value = null
  } else {
    alert('Upload failed')
  }
}

onMounted(() => {
  if (profileStore.user) {
    form.value = {
      name: profileStore.user.name || '',
      surname: profileStore.user.surname || '',
      username: profileStore.user.username || '',
      email: profileStore.user.email || ''
    }
  } else {
    profileStore.fetchProfile().then(() => {
      if (profileStore.user) {
        form.value = {
          name: profileStore.user.name || '',
          surname: profileStore.user.surname || '',
          username: profileStore.user.username || '',
          email: profileStore.user.email || ''
        }
      }
    })
  }
})

async function saveProfile() {
  await profileStore.updateProfile(form.value)
  router.push('/profile')
}

function cancelEdit() {
  router.push('/profile')
}
</script>

<style scoped>
</style>

<template>
  <div class="max-w-md mx-auto mt-10 p-6 border rounded">
    <h2 class="text-2xl font-bold mb-4">Register</h2>
    <form @submit.prevent="register">
      <div class="mb-4">
        <label class="block text-sm">First Name</label>
        <input v-model="name" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm">Last Name</label>
        <input v-model="surname" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm">Username</label>
        <input v-model="username" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm">Email</label>
  <input v-model="email" type="email" class="w-full border p-2 rounded" style="background-color: #fff !important; color: #111 !important;" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm">Password</label>
        <input v-model="password" type="password" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block text-sm">Confirm Password</label>
        <input v-model="confirmPassword" type="password" class="w-full border p-2 rounded" required />
      </div>
      <div v-if="error" class="text-red-600 text-sm mb-2">{{ error }}</div>
      <button type="submit" class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition w-full">Register</button>
    </form>
    <p class="mt-4 text-sm">Already have an account? <router-link to="/login" class="text-blue-600 hover:underline">Login</router-link></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import apiClient from '@/services/AxiosClient'

const name = ref('')
const surname = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const router = useRouter()

async function register() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    return
  }
  try {
    await apiClient.post('/auth/register', {
      name: name.value,
      surname: surname.value,
      username: username.value,
      email: email.value,
      password: password.value
    })
    error.value = ''
    router.push('/login')
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Registration failed.'
  }
}
</script>

<style scoped>
</style>

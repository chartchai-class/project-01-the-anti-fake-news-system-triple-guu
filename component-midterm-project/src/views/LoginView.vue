<template>
  <div class="max-w-md mx-auto mt-16 p-6 border rounded">
    <h2 class="text-xl font-semibold mb-4">Sign in</h2>
    <form @submit.prevent="onSubmit" class="space-y-3">
      <div>
        <label class="block text-sm">Username</label>
        <input v-model="username" class="w-full border p-2 rounded" />
      </div>
      <div>
        <label class="block text-sm">Password</label>
        <input type="password" v-model="password" class="w-full border p-2 rounded" />
      </div>
      <div>
  <button class="bg-blue-600 text-white px-4 py-2 rounded w-full" :disabled="loading">Sign in</button>
      </div>
      <div v-if="error" class="text-red-600">{{ error }}</div>
    </form>
    <p class="mt-4 text-sm">Don't have an account? <router-link to="/register" class="text-blue-600 hover:underline">Register</router-link></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.login(username.value, password.value)
    router.push({ name: 'home' })
  } catch (e: any) {
    error.value = e?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
</style>

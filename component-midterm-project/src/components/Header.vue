<template>
  <header class="sticky top-0 z-40 border-b bg-blue-500">
    <div class="mx-auto max-w-6xl px-4">
      <div class="flex h-16 items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2" aria-label="Go to Home">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-700 text-white font-bold">AF</span>
          <span class="font-extrabold text-white text-lg">Tripple Guu-Social Anti Fake News</span>
        </RouterLink>
        <nav class="flex items-center gap-6 text-sm">
          <RouterLink to="/" class="text-white hover:text-blue-100" exact-active-class="text-blue-200 font-semibold">Home</RouterLink>
          <RouterLink to="/about" class="text-white hover:text-blue-100" exact-active-class="text-blue-200 font-semibold">About</RouterLink>
          <template v-if="!authStore.token">
            <RouterLink to="/login" class="text-white hover:text-blue-100">Login</RouterLink>
            <RouterLink to="/register" class="text-white hover:text-blue-100">Register</RouterLink>
          </template>
          <template v-else>
            <button @click="logout" class="text-white hover:text-blue-100 bg-blue-700 px-3 py-1 rounded">Logout</button>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>
<script setup>
import { RouterLink } from "vue-router";
import { useAuthStore } from '@/stores/authStore';
import { computed } from 'vue';

const authStore = useAuthStore();
const logout = () => {
  authStore.logout();
  window.location.href = '/';
};
</script>
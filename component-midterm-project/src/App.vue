<template>
  <div>
    <Header />
    <router-view />
    <footer class="mt-16 border-t bg-white/80">
      <div class="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">© 2025 Social Anti‑Fake News</div>
    </footer>
  </div>
</template>
<script setup>
import Header from "./components/Header.vue";
</script>

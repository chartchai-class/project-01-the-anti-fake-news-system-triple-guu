<template>
  <header class="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
    <div class="mx-auto max-w-6xl px-4">
      <div class="flex h-16 items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2" aria-label="Go to Home">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600 text-white font-bold">AF</span>
          <span class="font-semibold">Social Anti‑Fake News</span>
        </RouterLink>
        <nav class="flex items-center gap-6 text-sm">
          <RouterLink to="/" class="text-gray-600 hover:text-gray-900" exact-active-class="text-brand-700 font-semibold">Home</RouterLink>
          <span class="text-gray-400 cursor-not-allowed" aria-disabled="true">About</span>
        </nav>
      </div>
    </div>
  </header>
</template>
<script setup>
import { RouterLink } from "vue-router";
</script>
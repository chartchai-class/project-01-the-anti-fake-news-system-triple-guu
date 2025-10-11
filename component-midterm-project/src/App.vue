<template>
  <div
    class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300"
  >
    <header
      class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur dark:bg-gray-900/80 dark:border-gray-700 dark:text-white transition"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white font-bold"
          >
            AF
          </div>
          <h1 class="text-lg font-semibold">Social Anti-Fake News</h1>
        </div>

        <div class="flex items-center gap-6">
          <nav class="hidden sm:flex gap-4 text-sm font-medium">
            <RouterLink to="/" class="hover:text-brand-600">Home</RouterLink>
            <RouterLink to="/about" class="hover:text-brand-600">About</RouterLink>
          </nav>

          <button
            @click="toggleDarkMode"
            class="flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <span v-if="!isDark">🌙</span>
            <span v-else>🌞</span>
          </button>
        </div>
      </div>
    </header>

    <main>
      <router-view />
    </main>

    <footer
      class="mt-16 border-t bg-white/80 dark:bg-gray-900/80 dark:border-gray-700"
    >
      <div
        class="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500 dark:text-gray-400"
      >
        © 2025 Social Anti-Fake News
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";

const isDark = ref(false);

function toggleDarkMode() {
  isDark.value = !isDark.value;
  const html = document.documentElement;
  if (isDark.value) {
    html.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    html.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
}

onMounted(() => {
  if (localStorage.getItem("theme") === "dark") {
    isDark.value = true;
    document.documentElement.classList.add("dark");
  }
});
</script>

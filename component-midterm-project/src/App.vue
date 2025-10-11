<template>
  <div
    class="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300"
  >
    <header
      class="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur dark:bg-gray-900/80 dark:border-gray-700 dark:text-white transition"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-3">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white font-bold"
          >
            AF
          </div>
          <h1 class="text-lg font-semibold">Social Anti-Fake News</h1>
        </div>

        <div class="flex items-center gap-6 relative">
          <nav class="hidden sm:flex gap-4 text-sm font-medium">
            <RouterLink to="/" class="hover:text-brand-600">Home</RouterLink>
            <RouterLink to="/about" class="hover:text-brand-600">About</RouterLink>
          </nav>

          <div class="relative">
            <button
              @click="toggleNotifications"
              class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Bell class="w-5 h-5" />
              <span
                v-if="hasNewNotifications"
                class="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500"
              ></span>
            </button>

            <div
              v-if="showNotifications"
              class="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50"
            >
              <h3 class="text-sm font-semibold mb-2">Latest Updates</h3>
              <ul class="text-sm space-y-1 max-h-48 overflow-y-auto">
                <li
                  v-for="n in latestNews"
                  :key="n.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                >
                  <RouterLink
                    :to="`/news/${n.id}`"
                    class="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/40 transition"
                    @click="showNotifications = false"
                  >
                    📰
                    <span class="line-clamp-1">{{ n.topic }}</span>
                  </RouterLink>
                </li>
              </ul>
              <button
                @click="clearNotifications"
                class="w-full mt-2 text-xs text-blue-600 hover:underline"
              >
                Mark all as read
              </button>
            </div>
          </div>

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
import { Bell } from "lucide-vue-next";
import { useNewsStore } from "@/stores/newsStore";

const newsStore = useNewsStore();
const showNotifications = ref(false);
const hasNewNotifications = ref(false);
const latestNews = ref([]);

function toggleNotifications() {
  showNotifications.value = !showNotifications.value;
  if (showNotifications.value) hasNewNotifications.value = false;
}

function clearNotifications() {
  hasNewNotifications.value = false;
  showNotifications.value = false;
}

async function checkForUpdates() {
  const beforeCount = newsStore.news.length;
  await newsStore.fetchNews();
  const newItems = newsStore.news.slice(-3);
  latestNews.value = newItems;

  if (newsStore.news.length > beforeCount) {
    hasNewNotifications.value = true;
  }
}

setInterval(checkForUpdates, 20000);

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
  checkForUpdates();
});
</script>

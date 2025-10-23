<template>
  <div class="max-w-3xl mx-auto mt-10 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow">
    <h1 class="text-2xl font-bold mb-6">📰 Create New Post</h1>

    <form @submit.prevent="submitPost" class="space-y-5">
      <div>
        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
        <input
          v-model="title"
          type="text"
          placeholder="Enter news title"
          class="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Reporter</label>
        <input
          v-model="reporter"
          type="text"
          placeholder="Enter reporter name"
          class="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
        <input
          v-model="imageUrl"
          type="url"
          placeholder="Paste image URL here (must be a real URL)"
          class="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <div v-if="imageUrl" class="mt-3">
          <img
            :src="imageUrl"
            alt="Preview"
            class="rounded-lg w-full max-h-64 object-cover border border-gray-300 dark:border-gray-700"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description</label>
        <textarea
          v-model="description"
          rows="4"
          placeholder="Write the content of the news..."
          class="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          required
        ></textarea>
      </div>

      <div class="flex justify-end gap-3 mt-6">
        <RouterLink
          to="/"
          class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Cancel
        </RouterLink>
        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          Save Post
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"
import { useRouter, RouterLink } from "vue-router"
import { useNewsStore } from '@/stores/newsStore'


const title = ref("")
const reporter = ref("")
const imageUrl = ref("")
const short = ref("")
const full = ref("")
const description = ref("")
const previewUrl = ref("")
const router = useRouter()
const newsStore = useNewsStore()

// No-op: imageUrl should be a real URL, not a base64 string

async function submitPost() {
  const dateTime = new Date().toISOString();
  try {
    await newsStore.createNews({
      topic: title.value,
      reporterName: reporter.value,
      dateTime,
      imageUrl: imageUrl.value,
      shortDetail: short.value || description.value,
      fullDetail: full.value || description.value,
      status: "NEUTRAL"
    })
    alert("✅ News created successfully!")
    router.push("/")
  } catch (e) {
    alert("❌ Failed to create news: " + (newsStore.apiError || e))
  }
}

// Keep short/full in sync with description for compatibility
watch(description, (val) => {
  short.value = val
  full.value = val
})
</script>

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
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Image</label>
        <div
          class="relative flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <input
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            class="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div class="text-center text-sm text-gray-600 dark:text-gray-400">
            <span class="block font-medium">📸 Click or drag to upload</span>
            <span class="text-xs text-gray-400 dark:text-gray-500">PNG, JPG up to 2MB</span>
          </div>
        </div>
        <div v-if="previewUrl" class="mt-3">
          <img
            :src="previewUrl"
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
import { ref } from "vue"
import { useRouter, RouterLink } from "vue-router"

const title = ref("")
const reporter = ref("")
const imageUrl = ref("")
const description = ref("")
const previewUrl = ref("")
const router = useRouter()

function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    previewUrl.value = URL.createObjectURL(file)
    const reader = new FileReader()
    reader.onload = () => {
      imageUrl.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

async function submitPost() {
  const date = new Date().toISOString().split("T")[0]
  const newPost = {
    id: Date.now(),
    topic: title.value,
    reporter: reporter.value,
    date,
    imageUrl: imageUrl.value,
    detail: description.value,
    status: "neutral",
  }
  await fetch("http://localhost:3001/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPost),
  })
  alert("✅ News created successfully!")
  router.push("/")
}
</script>

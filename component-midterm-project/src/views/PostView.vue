<template>
  <main class="mx-auto max-w-3xl px-4 py-8">
    <!-- Header -->
    <header class="mb-6 flex items-center justify-between gap-3">
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        Create a Post
      </h1>
      <RouterLink
        :to="{ name: 'home' }"
        class="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
      >
        ← Back to Home
      </RouterLink>
    </header>

    <!-- Form card -->
    <section class="rounded-2xl border bg-white p-5 shadow-sm">
      <form class="space-y-5" @submit.prevent="submit">
        <!-- Topic -->
        <div>
          <label for="topic" class="block text-sm font-medium text-slate-700">
            Title / Topic <span class="text-red-500">*</span>
          </label>
          <input
            id="topic"
            v-model.trim="topic"
            type="text"
            required
            placeholder="e.g., Government announces new education policy"
            class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
          />
        </div>

        <!-- Short summary -->
        <div>
          <label for="short" class="block text-sm font-medium text-slate-700">
            Short summary <span class="text-red-500">*</span>
          </label>
          <textarea
            id="short"
            v-model.trim="short"
            rows="3"
            required
            placeholder="One or two sentences summarizing the claim/report."
            class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
          ></textarea>
          <p class="mt-1 text-xs text-slate-500">{{ short.length }} characters</p>
        </div>

        <!-- Detail -->
        <div>
          <label for="detail" class="block text-sm font-medium text-slate-700">
            Detail (optional)
          </label>
          <textarea
            id="detail"
            v-model.trim="detail"
            rows="6"
            placeholder="Add context, sources, and additional details."
            class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
          ></textarea>
        </div>

        <!-- Link + Image URL -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="link" class="block text-sm font-medium text-slate-700">
              Source link (optional)
            </label>
            <input
              id="link"
              v-model.trim="link"
              type="url"
              placeholder="https://example.com/article"
              class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
            />
            <p v-if="link && !isUrl(link)" class="mt-1 text-xs text-red-600">Invalid URL</p>
          </div>

          <div>
            <label for="image" class="block text-sm font-medium text-slate-700">
              Image URL (optional)
            </label>
            <input
              id="image"
              v-model.trim="image"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
            />
            <p v-if="image && !isUrl(image)" class="mt-1 text-xs text-red-600">Invalid URL</p>
          </div>
        </div>

        <!-- Preview (if image) -->
        <figure v-if="image && isUrl(image)" class="mt-1">
          <img :src="image" alt="preview" class="w-full max-h-64 object-cover rounded-lg border" />
        </figure>

        <!-- Reporter -->
        <div>
          <label for="reporter" class="block text-sm font-medium text-slate-700">
            Reporter name
          </label>
          <input
            id="reporter"
            v-model.trim="reporter"
            type="text"
            placeholder="Your name"
            class="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring"
          />
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <RouterLink
            :to="{ name: 'home' }"
            class="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
          >
            Cancel
          </RouterLink>

          <button
            type="submit"
            class="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            :disabled="!isValid || posting"
          >
            <span aria-hidden="true">📤</span>
            <span>{{ posting ? 'Posting…' : 'Post' }}</span>
          </button>
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import { useUiStore } from '@/stores/uiStore'

const router = useRouter()
const newsStore = useNewsStore()
const uiStore = useUiStore()

// fields
const topic = ref('')
const short = ref('')
const detail = ref('')
const link = ref('')
const image = ref('')
const reporter = ref('You')

// state
const posting = ref(false)
const error = ref('')

// ensure we have the latest list
onMounted(async () => {
  if (!newsStore.news?.length && newsStore.fetchNews) {
    await newsStore.fetchNews()
  }
})

const isValid = computed(() =>
  topic.value.trim().length > 3 &&
  short.value.trim().length > 5 &&
  (!link.value || isUrl(link.value)) &&
  (!image.value || isUrl(image.value))
)

function isUrl(s: string) {
  try { new URL(s); return true } catch { return false }
}

async function submit() {
  error.value = ''
  if (!isValid.value || posting.value) return
  posting.value = true
  try {
    // Create via store (API first, local fallback)
    const created = await newsStore.addNews({
      topic: topic.value.trim(),
      short: short.value.trim(),
      detail: detail.value.trim() || undefined,
      link: link.value.trim() || undefined,
      image: image.value.trim() || undefined,
      reporter: reporter.value.trim() || 'You',
      reportedAt: new Date().toISOString(),
    })

    // Make sure Home shows it (All + page 1)
    uiStore.setFilter?.('all')
    uiStore.setPage?.(1)

    // Refresh from server so order is canonical (kept on)
    await newsStore.fetchNews()

    // Go to Home (change to details if you prefer)
    await router.push({ name: 'home' })
    // Or: await router.push({ name: 'details', params: { id: String(created.id) } })
  } catch (e: any) {
    console.error(e)
    error.value = 'Failed to create the post. Please try again.'
  } finally {
    posting.value = false
  }
}
</script>

<template>
  <main class="mx-auto max-w-5xl">
    <nav class="flex items-center justify-between gap-4 px-4 py-4 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10 dark:bg-gray-900/80 dark:border-gray-700">
      <RouterLink to="/" class="text-sm text-blue-600 hover:underline dark:text-blue-400">← Back</RouterLink>
      <RouterLink
        v-if="item"
        :to="{ name: 'comments', params: { id } }"
        class="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        💬 Comments <span class="text-xs text-slate-500">({{ comments.length }})</span>
      </RouterLink>
    </nav>

    <section v-if="!item" class="px-4 py-16 text-center text-slate-600 dark:text-slate-400">
      <p class="text-lg">This story couldn’t be found.</p>
      <RouterLink to="/" class="text-blue-600 hover:underline dark:text-blue-400">Go home</RouterLink>
    </section>

    <article v-else>
      <header class="px-4 pt-6">
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
            {{ item.topic }}
          </h1>
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full shrink-0"
            :class="statusClass"
          >
            {{ statusLabel }}
          </span>
        </div>

        <div class="mt-3 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white"
            :class="avatarBg"
          >
            {{ reporterInitials }}
          </div>
          <div class="leading-tight">
            <p><span class="font-medium text-slate-800 dark:text-slate-200">{{ item.reporter }}</span></p>
            <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatDate(item.date || item.reportedAt) }}</p>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <button @click="vote(1)" class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800">
              👍 <span class="font-medium">{{ votes.up }}</span>
            </button>
            <button @click="vote(-1)" class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800">
              👎 <span class="font-medium">{{ votes.down }}</span>
            </button>
          </div>
        </div>
      </header>

      <figure v-if="item.image || item.imageUrl" class="mt-5">
        <img
          :src="item.imageUrl || item.image"
          :alt="item.topic"
          class="w-full max-h-[460px] object-cover rounded-lg"
          loading="lazy"
        />
      </figure>

      <section class="px-4 py-6">
        <div class="prose max-w-none prose-slate dark:prose-invert">
          <p class="whitespace-pre-line">
            {{ item.detail || item.short }}
          </p>
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <a
            v-if="externalLink"
            :href="externalLink"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline dark:text-blue-400"
          >
            🔗 Open source link
          </a>

          <RouterLink
            :to="{ name: 'comments', params: { id } }"
            class="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700"
          >
            💬 View comments ({{ comments.length }})
          </RouterLink>
        </div>
      </section>

      <RouterView />
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'

const newsStore = useNewsStore()
const route = useRoute()
const id = computed(() => String(route.params.id))

onMounted(async () => {
  if (!newsStore.news.length && newsStore.fetchNews) {
    await newsStore.fetchNews()
  }
})

const item = computed(() => newsStore.news.find(n => String(n.id) === id.value) || null)
const status = computed(() => item.value ? newsStore.statusFor(item.value.id) : 'unknown')
const statusLabel = computed(() =>
  status.value === 'fake' ? 'Fake' : status.value === 'non-fake' ? 'Non-fake' : 'Neutral'
)
const statusClass = computed(() => ({
  fake: 'bg-red-100 text-red-700',
  'non-fake': 'bg-green-100 text-green-700',
  neutral: 'bg-yellow-100 text-yellow-700',
  unknown: 'bg-slate-100 text-slate-700'
}[status.value]))

const votes = computed(() => item.value ? newsStore.votesFor(item.value.id) : { up: 0, down: 0 })
const comments = computed(() => item.value ? newsStore.commentsFor(item.value.id) : [])

async function vote(dir: 1 | -1) {
  if (!item.value) return
  await newsStore.vote(item.value.id, dir)
}

function formatDate(value: any) {
  if (!value) return 'Unknown Date'
  const d = new Date(value)
  if (isNaN(d)) return 'Unknown Date'
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const reporterInitials = computed(() => {
  const name = item.value?.reporter ?? ''
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'R'
})

const avatarPalette = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500']
const avatarBg = computed(() => {
  const i = (String(item.value?.id || 0).length + (item.value?.reporter?.length || 0)) % avatarPalette.length
  return avatarPalette[i]
})

const externalLink = computed(() => (item.value as any)?.link || item.value?.image || '')
</script>

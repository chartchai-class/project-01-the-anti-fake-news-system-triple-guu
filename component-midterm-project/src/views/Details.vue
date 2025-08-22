<template>
  <main class="mx-auto max-w-5xl">
    <!-- missing -->
    <section v-if="!item" class="px-4 py-16 text-center text-slate-600">
      <p class="text-lg">This story couldn’t be found.</p>
      <RouterLink to="/" class="text-blue-600 hover:underline">Go home</RouterLink>
    </section>

    <!-- content -->
    <article v-else>
      <!-- hero -->
      <header class="px-4 pt-6">
        <div class="flex items-start justify-between gap-4">
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
            {{ item.topic }}
          </h1>

        <!-- status badge -->
          <span
            class="px-2 py-1 text-xs font-semibold rounded-full shrink-0"
            :class="statusClass"
            data-testid="details-status"
            :aria-label="`status ${statusLabel}`"
            role="status"
          >
            {{ statusLabel }}
          </span>
        </div>

        <!-- meta -->
        <div class="mt-3 flex items-center gap-3 text-sm text-slate-600">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white"
            :class="avatarBg"
            :aria-label="`Reporter ${item.reporter}`"
          >
            {{ reporterInitials }}
          </div>
          <div class="leading-tight">
            <p><span class="font-medium text-slate-800">{{ item.reporter }}</span></p>
            <p class="text-xs">{{ reportedAt }}</p>
          </div>
          <div class="ml-auto flex items-center gap-2" aria-live="polite">
            <button @click="vote(1)" class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-slate-50">
              👍 <span class="font-medium">{{ votes.up }}</span>
            </button>
            <button @click="vote(-1)" class="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 hover:bg-slate-50">
              👎 <span class="font-medium">{{ votes.down }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- banner image -->
      <figure v-if="item.image" class="mt-5">
        <img
          :src="item.image"
          :alt="item.topic"
          class="w-full max-h-[460px] object-cover"
          loading="lazy"
        />
      </figure>

      <!-- body -->
      <section class="px-4 py-6">
        <div class="prose max-w-none prose-slate">
          <p class="whitespace-pre-line">
            {{ item.detail || item.short }}
          </p>
        </div>

        <!-- actions: back + comments (top-level comments page) -->
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <RouterLink
            to="/"
            class="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700"
          >
            ← Back
          </RouterLink>

          <RouterLink
            :to="{ name: 'comments', params: { id } }"
            class="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700"
          >
            💬 View comments ({{ comments.length }})
          </RouterLink>
        </div>
      </section>
    </article>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
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

const status = computed<'fake' | 'non-fake' | 'neutral' | 'unknown'>(() =>
  item.value ? (newsStore.statusFor(item.value.id) as any) : 'unknown'
)

const statusLabel = computed(() =>
  status.value === 'fake' ? 'Fake' : status.value === 'non-fake' ? 'Non-fake' : 'Neutral'
)

const statusClass = computed(() => ({
  fake: 'bg-red-100 text-red-700',
  'non-fake': 'bg-green-100 text-green-700',
  neutral: 'bg-yellow-100 text-yellow-700',
  unknown: 'bg-slate-100 text-slate-700'
}[status.value]))

const votes = computed(() =>
  item.value ? newsStore.votesFor(item.value.id) : { up: 0, down: 0 }
)

const comments = computed(() =>
  item.value ? newsStore.commentsFor(item.value.id) : []
)

async function vote(dir: 1 | -1) {
  if (!item.value) return
  await newsStore.vote(item.value.id, dir)
}

const reportedAt = computed(() =>
  item.value ? new Date(item.value.reportedAt).toLocaleString() : ''
)

const reporterInitials = computed(() => {
  const name = item.value?.reporter ?? ''
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'R'
})

const avatarPalette = ['bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500']
const avatarBg = computed(() => {
  const i = (String(item.value?.id || 0).length + (item.value?.reporter?.length || 0)) % avatarPalette.length
  return avatarPalette[i]
})
</script>

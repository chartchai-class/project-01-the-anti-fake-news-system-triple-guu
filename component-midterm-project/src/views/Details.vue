<template>
  <main id="main" class="mx-auto max-w-4xl px-4 py-6">
    <RouterLink to="/" class="text-sm text-brand-700 hover:underline">← Back to list</RouterLink>

    <article class="card mt-3 overflow-hidden">
      <img :src="item.image" alt="Full news image" class="h-72 w-full object-cover" />
      <div class="p-5 space-y-3">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">{{ item.topic }}</h1>
          <span :class="item.status==='fake' ? 'badge-fake' : 'badge-real'">{{ item.status==='fake' ? 'Fake' : 'Non‑fake' }}</span>
        </div>
        <p class="text-gray-700">{{ item.details }}</p>
        <p class="text-sm text-gray-500">By {{ item.reporter }} · {{ new Date(item.date).toLocaleString() }}</p>

        <div class="flex flex-wrap items-center gap-3 pt-2">
          <button class="btn-primary" @click="cast('up')" aria-label="Vote non‑fake">👍 Vote non‑fake</button>
          <button class="btn-ghost" @click="cast('down')" aria-label="Vote fake">👎 Vote fake</button>
          <span class="text-sm text-gray-600">👍 {{ votes.up }} · 👎 {{ votes.down }}</span>
        </div>
      </div>
    </article>

    <div class="mt-4 flex justify-end">
      <RouterLink :to="`/news/${item.id}/comments`" class="btn-ghost">Open comments →</RouterLink>
    </div>

    <RouterView />
  </main>
</template>
<script setup>
import { reactive } from "vue"
import { RouterLink, RouterView, useRoute } from "vue-router"
import { getById, vote, getVotes } from "../data/news"

const route = useRoute()

// If the router guard set meta, use it; otherwise fall back to params
const item = route.meta.item ?? getById(String(route.params.id))

const votes = reactive(getVotes(item.id))
function cast(type) {
  const v = vote(item.id, type)
  votes.up = v.up
  votes.down = v.down
}
</script>

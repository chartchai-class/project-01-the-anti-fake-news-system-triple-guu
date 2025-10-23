<template>
  <main class="mx-auto max-w-5xl px-4 py-6">
    <header class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <RouterLink :to="{ name: 'details', params: { id } }" class="text-sm text-blue-600 hover:underline">
          ← Back to article
        </RouterLink>
        <h2 class="mt-2 text-xl font-semibold">{{ item?.topic || 'Comments' }}</h2>
        <p class="text-sm text-slate-500">
          {{ comments.length }} comment(s) • Votes 👍 {{ votes.up }} / 👎 {{ votes.down }}
        </p>
      </div>

      <!-- quick filter (optional visual only) -->
      <div class="inline-flex rounded-md border overflow-hidden">
        <button
          class="px-3 py-1.5 text-sm hover:bg-slate-50"
          :class="sort === 'new' ? 'bg-slate-100' : ''"
          @click="sort = 'new'"
        >
          Newest
        </button>
        <button
          class="px-3 py-1.5 text-sm hover:bg-slate-50 border-l"
          :class="sort === 'old' ? 'bg-slate-100' : ''"
          @click="sort = 'old'"
        >
          Oldest
        </button>
      </div>
    </header>

    <section class="mt-6 grid gap-8 lg:grid-cols-[1fr,380px]">
      <!-- comments list -->
      <div>
        <div v-if="paged.length" class="space-y-4">
          <article
            v-for="c in paged"
            :key="c.id"
            class="grid grid-cols-[40px,1fr] gap-3"
          >
            <!-- avatar -->
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white select-none"
              :class="avatarBgFor(c.id)"
              aria-hidden="true"
            >
              {{ avatarInitialFor(c) }}
            </div>

            <!-- bubble -->
            <div class="comment-card rounded-xl border p-3">

              <p class="text-sm whitespace-pre-line break-words">
                <span v-if="isUrl(c.text)">
                  <a :href="c.text" target="_blank" rel="noopener" class="text-blue-600 underline">
                    {{ c.text }}
                  </a>
                </span>
                <span v-else>{{ c.text }}</span>
              </p>

              <div class="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                <time :datetime="c.createdAt">{{ fmt(c.createdAt) }}</time>
                <span v-if="c.updatedAt" class="text-slate-400">· edited {{ fmt(c.updatedAt) }}</span>
              </div>
            </div>
          </article>
        </div>

        <EmptyState v-else class="text-slate-600">
          No comments yet. Be the first to comment!
        </EmptyState>

        <!-- pagination -->
        <div class="mt-5 flex flex-col items-center gap-2">
          <Pagination
            v-if="totalPages > 1"
            :page="page"
            :total-pages="totalPages"
            @update:page="(p:number)=>page=p"
          />
          <p class="text-xs text-slate-500">
            Showing {{ start + 1 }}–{{ Math.min(end, comments.length) }} of {{ comments.length }}
          </p>
        </div>
      </div>

      <!-- composer panel -->
      <aside class="lg:sticky lg:top-16 h-max">
        <div class="rounded-2xl border bg-white p-4 shadow-sm">
          <h3 class="font-semibold">Add a comment</h3>
          <p class="text-xs text-slate-500 mb-3">Plain text or a link (we’ll auto-link URLs).</p>

          <form @submit.prevent="submit" class="space-y-3">
            <textarea
              v-model.trim="text"
              rows="4"
              placeholder="Share your thoughts…"
              class="w-full rounded-lg border p-2 focus:outline-none focus:ring"
              aria-label="comment text"
            ></textarea>

            <button
              class="w-full rounded-md bg-blue-600 text-white py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              :disabled="!text"
            >
              Post comment
            </button>
          </form>

          <div class="mt-4 text-xs text-slate-500">
            <p>Be respectful. Comments may be moderated.</p>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useNewsStore } from '@/stores/newsStore'
import EmptyState from '@/components/EmptyState.vue'
import Pagination from '@/components/Pagination.vue'

const route = useRoute()
const id = String(route.params.id)
const store = useNewsStore()

onMounted(async () => {
  if (!store.news.length && store.fetchNews) {
    await store.fetchNews()
  }
    await store.fetchComments(id)
})

const item = computed(() => store.news.find(n => String(n.id) === id) || null)
const votes = computed(() => store.votesFor(id))
const rawComments = computed(() => store.commentsFor(id))

// sort + pagination
const sort = ref<'new' | 'old'>('new')
const comments = computed(() => {
  const arr = [...rawComments.value]
  if (sort.value === 'new') return arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  return arr.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
})
const pageSize = 6
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(comments.value.length / pageSize)))
const start = computed(() => (page.value - 1) * pageSize)
const end   = computed(() => page.value * pageSize)
const paged = computed(() => comments.value.slice(start.value, end.value))

// add comment
const text = ref('')
async function submit() {
  if (!text.value) return
  await store.addComment(id, text.value)  // store persists to localStorage per your project spec
  text.value = ''
  page.value = 1
}

// helpers
function isUrl(s: string) { try { new URL(s); return true } catch { return false } }
function fmt(iso: string) { return new Date(iso).toLocaleString() }
function avatarInitialFor(c: any) { return (c.author || 'U').slice(0, 2).toUpperCase() }
function avatarBgFor(seed: number) {
  const colors = ['bg-indigo-500','bg-rose-500','bg-amber-500','bg-emerald-500','bg-cyan-500','bg-fuchsia-500']
  return colors[seed % colors.length]
}
</script>

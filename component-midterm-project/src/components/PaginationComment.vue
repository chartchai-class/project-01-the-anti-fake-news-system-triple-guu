<!-- src/components/PaginationComments.vue -->
<template>
  <nav class="flex flex-wrap items-center justify-center gap-1" aria-label="Comments pagination">
    <!-- First -->
    <button
      class="px-2 py-1 text-xs rounded-md border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="safePage <= 1"
      @click="go(1)"
      aria-label="First page"
      title="First"
    >
      «
    </button>

    <!-- Prev -->
    <button
      class="px-2 py-1 text-xs rounded-md border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="safePage <= 1"
      @click="go(safePage - 1)"
      aria-label="Previous page"
      title="Prev"
    >
      ‹
    </button>

    <!-- Numbered buttons (with ellipses) -->
    <div class="flex items-center gap-1" role="group" aria-label="Page numbers">
      <button
        v-for="(p, i) in pageItems"
        :key="i"
        :disabled="p === '…'"
        @click="p !== '…' && go(p as number)"
        class="min-w-[1.9rem] px-2 py-1 text-xs rounded-md border hover:bg-slate-50 disabled:cursor-default disabled:opacity-100"
        :class="[
          p === '…' ? 'text-slate-400 border-transparent' : '',
          p === safePage ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-600' : ''
        ]"
        :aria-current="p === safePage ? 'page' : undefined"
      >
        {{ p }}
      </button>
    </div>

    <!-- Next -->
    <button
      class="px-2 py-1 text-xs rounded-md border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="safePage >= safeTotal"
      @click="go(safePage + 1)"
      aria-label="Next page"
      title="Next"
    >
      ›
    </button>

    <!-- Last -->
    <button
      class="px-2 py-1 text-xs rounded-md border hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="safePage >= safeTotal"
      @click="go(safeTotal)"
      aria-label="Last page"
      title="Last"
    >
      »
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  page: number
  totalPages: number
  siblingCount?: number   // neighbors around current page
  boundaryCount?: number  // pages shown at start/end
}>(), {
  siblingCount: 1,
  boundaryCount: 1,
})

const emit = defineEmits<{ (e: 'update:page', value: number): void }>()

const safeTotal = computed(() => Math.max(1, Number(props.totalPages) || 1))
const safePage  = computed(() =>
  Math.min(Math.max(1, Number(props.page) || 1), safeTotal.value)
)

function go(target: number) {
  const next = Math.min(Math.max(1, target), safeTotal.value)
  if (next !== safePage.value) emit('update:page', next)
}

function range(start: number, end: number) {
  return Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i)
}

function buildPageItems(current: number, total: number, siblings: number, boundary: number) {
  const startPages = range(1, Math.min(boundary, total))
  const endPages   = range(Math.max(total - boundary + 1, boundary + 1), total)

  const left = Math.max(
    Math.min(current - siblings, total - boundary - siblings * 2 - 1),
    boundary + 2
  )
  const right = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    total - boundary - 1
  )

  const middle = total <= boundary * 2 + siblings * 2 + 3
    ? range(boundary + 1, total - boundary)
    : range(left, right)

  const items: Array<number | '…'> = []
  items.push(...startPages)
  if (middle.length && middle[0] > startPages[startPages.length - 1] + 1) items.push('…')
  items.push(...middle)
  if (endPages.length && endPages[0] > middle[middle.length - 1] + 1) items.push('…')
  if (endPages[0] > startPages[startPages.length - 1]) items.push(...endPages)
  return items
}

const pageItems = computed(() =>
  buildPageItems(safePage.value, safeTotal.value, props.siblingCount, props.boundaryCount)
)
</script>

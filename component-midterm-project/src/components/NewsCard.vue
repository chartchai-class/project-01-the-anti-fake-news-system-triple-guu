<template>
  <article class="card overflow-hidden" :aria-labelledby="`title-${item.id}`">
    <img :src="item.image" :alt="item.topic" loading="lazy" class="h-44 w-full object-cover" />
    <div class="p-4 flex flex-col gap-3">
      <div class="flex items-center justify-between">
        <h3 :id="`title-${item.id}`" class="text-lg font-semibold line-clamp-1">{{ item.topic }}</h3>
        <span :class="item.status==='fake' ? 'badge-fake' : 'badge-real'">{{ item.status==='fake' ? 'Fake' : 'Non‑fake' }}</span>
      </div>
      <p class="text-sm text-gray-600 line-clamp-2">{{ item.short }}</p>
      <p class="text-xs text-gray-500">By {{ item.reporter }} · {{ new Date(item.date).toLocaleString() }}</p>
      <div class="flex items-center justify-between pt-2">
        <span class="text-xs text-gray-500" aria-label="Votes summary">👍 {{ votes.up }} · 👎 {{ votes.down }}</span>
        <RouterLink :to="`/news/${item.id}`" class="btn-primary text-sm" :aria-label="`View details for ${item.topic}`">Details</RouterLink>
      </div>
    </div>
  </article>
</template>
<script setup>
import { RouterLink } from "vue-router";
import { getVotes } from "../data/news";
const props = defineProps({ item: Object });
const votes = getVotes(props.item.id);
</script>
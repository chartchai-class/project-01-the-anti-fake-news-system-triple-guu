<template>
  <nav class="mt-4 flex items-center justify-between" aria-label="Pagination">
    <button class="btn-ghost" :disabled="page===1" @click="$emit('update:page', Math.max(1, page-1))" aria-label="Previous page">Prev</button>
    <p class="text-sm text-gray-600" aria-live="polite">Page {{ page }} of {{ totalPages }}</p>
    <button class="btn-ghost" :disabled="page===totalPages" @click="$emit('update:page', Math.min(totalPages, page+1))" aria-label="Next page">Next</button>
  </nav>
</template>
<script setup>
defineProps({ page: Number, totalPages: Number });
</script>
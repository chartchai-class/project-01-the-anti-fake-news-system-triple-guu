<template>
  <nav
    class="mt-8 flex items-center justify-center gap-6 text-sm font-medium select-none"
    aria-label="Pagination"
  >
    <!-- Previous -->
    <button
      class="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700
             bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
             hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500
             focus:ring-2 focus:ring-blue-400 focus:outline-none
             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      :disabled="page === 1"
      @click="$emit('update:page', Math.max(1, page - 1))"
      aria-label="Previous page"
    >
      ← Previous
    </button>

    <!-- Page Info -->
    <p class="text-gray-700 dark:text-gray-300">
      Page
      <span class="font-semibold text-blue-600 dark:text-blue-400">{{ page }}</span>
      of
      <span class="font-semibold text-gray-800 dark:text-gray-200">{{ totalPages }}</span>
    </p>

    <!-- Next -->
    <button
      class="px-5 py-2 rounded-lg border border-gray-300 dark:border-gray-700
             bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
             hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500
             focus:ring-2 focus:ring-blue-400 focus:outline-none
             disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
      :disabled="page === totalPages"
      @click="$emit('update:page', Math.min(totalPages, page + 1))"
      aria-label="Next page"
    >
      Next →
    </button>
  </nav>
</template>

<script setup>
defineProps({
  page: Number,
  totalPages: Number
});
</script>

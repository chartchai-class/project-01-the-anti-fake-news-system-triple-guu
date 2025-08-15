<template>
  <div class="card p-8 text-center">
    <p class="text-lg font-semibold">{{ title }}</p>
    <p class="text-sm text-gray-600 mt-2"><slot>Try adjusting your filters or page size.</slot></p>
  </div>
</template>
<script setup>
defineProps({ title: { type: String, default: "No results" } });
</script>
<template>
  <div class="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex items-center gap-3">
      <label for="status" class="text-sm font-medium">Filter:</label>
      <select id="status" v-model="model.status" class="rounded-xl border-gray-300 focus:ring-brand-500" aria-label="Filter news by status">
        <option value="all">All</option>
        <option value="fake">Fake</option>
        <option value="real">Non‑fake</option>
      </select>
    </div>
    <div class="flex items-center gap-3">
      <label for="pageSize" class="text-sm font-medium">Per page:</label>
      <select id="pageSize" v-model.number="model.pageSize" class="rounded-xl border-gray-300 focus:ring-brand-500" aria-label="Select number of news items per page">
        <option :value="3">3</option>
        <option :value="6">6</option>
        <option :value="9">9</option>
      </select>
    </div>
  </div>
</template>
<script setup>
const model = defineModel({ default: { status: "all", pageSize: 6 } });
</script>

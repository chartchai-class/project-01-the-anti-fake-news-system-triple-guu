<template>
  <div
    class="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <!-- Filter -->
    <div class="flex items-center gap-3">
      <label for="status" class="text-sm font-medium">Filter:</label>
      <select
        id="status"
        v-model="uiStore.filter"
        @change="uiStore.setFilter(uiStore.filter)"
        class="rounded-xl border-gray-300 focus:ring-brand-500"
        aria-label="Filter news by status"
      >
        <option value="all">All</option>
        <option value="fake">Fake</option>
        <option value="non-fake">Non-fake</option>
      </select>
    </div>

    <!-- ✅ Only keep Per page input -->
    <div class="flex items-center gap-3">
      <label for="pageSizeInput" class="text-sm font-medium">Per page:</label>
      <input
        id="pageSizeInput"
        type="number"
        min="1"
        v-model.number="uiStore.pageSize"
        @change="uiStore.setPageSize(uiStore.pageSize)"
        class="border rounded px-2 py-1 w-20"
        aria-label="Type number of news items per page"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from "@/stores/uiStore";
const uiStore = useUiStore();
</script>

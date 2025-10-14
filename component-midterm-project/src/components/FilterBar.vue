<template>
  <div
    class="card p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-wrap"
  >
    <div class="flex items-center gap-3 w-full sm:w-auto flex-1">
      <label for="search" class="text-sm font-medium">Search:</label>
      <input
        id="search"
        v-model="uiStore.search"
        type="text"
        placeholder="Search by title or reporter..."
        class="w-full sm:w-64 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2
               bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
               placeholder-gray-500 dark:placeholder-gray-400"
        aria-label="Search news by title or reporter"
      />
    </div>

    <div class="flex items-center gap-3">
      <label for="status" class="text-sm font-medium">Filter:</label>
      <select
        id="status"
        v-model="uiStore.filter"
        @change="uiStore.setFilter(uiStore.filter)"
        class="rounded-xl border-gray-300 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        aria-label="Filter news by status"
      >
        <option value="all">All</option>
        <option value="fake">Fake</option>
        <option value="non-fake">Non-fake</option>
        <option value="neutral">Neutral</option>
      </select>
    </div>

    <div class="flex items-center gap-3">
      <label for="pageSizeInput" class="text-sm font-medium">Per page:</label>
      <input
        id="pageSizeInput"
        type="number"
        min="1"
        v-model.number="uiStore.pageSize"
        @change="uiStore.setPageSize(uiStore.pageSize)"
        class="border rounded px-2 py-1 w-20 border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        aria-label="Type number of news items per page"
      />

      <RouterLink
        v-if="userRole === 'member'"
        to="/news/create"
        class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm transition"
      >
        + Create News
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiStore } from "@/stores/uiStore";
import { ref } from "vue";
import { RouterLink } from "vue-router";

const uiStore = useUiStore();
const userRole = ref("member");
</script>

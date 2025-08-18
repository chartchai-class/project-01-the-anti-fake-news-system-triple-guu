<template>
  <main id="main" class="mx-auto max-w-6xl px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">Latest News</h1>

    <!-- Filter -->
    <FilterBar />

    <!-- Loading -->
    <div
      v-if="uiStore.loading"
      class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <SkeletonCard v-for="i in uiStore.pageSize" :key="i" />
    </div>

    <!-- Content -->
    <div v-else>
      <EmptyState v-if="pagedNews.length === 0" class="mt-4">
        No news match the selected filter.
      </EmptyState>

      <template v-else>
        <div
          class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <NewsCard v-for="n in pagedNews" :key="n.id" :item="n" />
        </div>

        <Pagination
          class="mt-2"
          :page="uiStore.page"
          :total-pages="totalPages"
          @update:page="uiStore.setPage"
        />

        <!-- ✅ Results summary -->
        <p class="text-sm text-gray-500 mt-4 text-center">
          Showing {{ uiStore.startIndex + 1 }}–
          {{ Math.min(uiStore.endIndex, filteredNews.length) }}
          of {{ filteredNews.length }} results
        </p>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useNewsStore } from "@/stores/newsStore";
import { useUiStore } from "@/stores/uiStore";

import FilterBar from "@/components/FilterBar.vue";
import NewsCard from "@/components/NewsCard.vue";
import Pagination from "@/components/Pagination.vue";
import EmptyState from "@/components/EmptyState.vue";
import SkeletonCard from "@/components/SkeletonCard.vue";

const newsStore = useNewsStore();
const uiStore = useUiStore();

onMounted(async () => {
  uiStore.setLoading(true);
  await newsStore.fetchNews();
  uiStore.setLoading(false);
});

// ✅ FIX: Use dynamic status from store instead of static n.status
const filteredNews = computed(() => {
  if (uiStore.filter === "all") return newsStore.news;
  return newsStore.news.filter(
    (n) => newsStore.statusFor(n.id) === uiStore.filter
  );
});

// ✅ Use getters from uiStore
const totalPages = computed(() =>
  uiStore.totalPages(filteredNews.value.length)
);

const pagedNews = computed(() =>
  filteredNews.value.slice(uiStore.startIndex, uiStore.endIndex)
);
</script>

<template>
  <main id="main" class="mx-auto max-w-6xl px-4 py-6">
    <!-- Hero header -->
    <header
      class="rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 px-5 py-6 sm:py-7 mb-5 flex flex-col gap-2"
    >
      <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
        Latest News
      </h1>
      <p class="text-sm sm:text-base text-slate-600">
        Browse verified & flagged reports. Use filters to refine, then open a story for full details and comments.
      </p>
    </header>

    <!-- Filter (in a soft card) -->
    <section
      class="rounded-xl border border-slate-200 bg-white/80 backdrop-blur px-4 py-3 sm:px-5 sm:py-4 shadow-sm"
      aria-label="Filters"
    >
      <FilterBar />
    </section>

    <!-- Loading skeleton grid -->
    <section
      v-if="uiStore.loading"
      class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      aria-busy="true"
      aria-live="polite"
    >
      <SkeletonCard v-for="i in uiStore.pageSize" :key="i" />
    </section>

    <!-- Content -->
    <section v-else class="mt-5">
      <EmptyState v-if="pagedNews.length === 0" class="mt-4">
        No news match the selected filter.
      </EmptyState>

      <template v-else>
        <!-- Results grid -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-live="polite"
        >
          <NewsCard v-for="n in pagedNews" :key="n.id" :item="n" />
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex flex-col items-center gap-2">
          <Pagination
            :page="uiStore.page"
            :total-pages="totalPages"
            @update:page="onPageChange"
          />
          <!-- Results summary (guarded) -->
          <p class="text-xs sm:text-sm text-slate-500">
            Showing {{ resultStart }}–{{ resultEnd }} of {{ filteredNews.length }} results
          </p>
        </div>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
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

// Filtered list (uses dynamic status from store)
const filteredNews = computed(() => {
  if (uiStore.filter === "all") return newsStore.news;
  return newsStore.news.filter(
    (n) => newsStore.statusFor(n.id) === uiStore.filter
  );
});

// Page math
const totalPages = computed(() => uiStore.totalPages(filteredNews.value.length));
const pagedNews = computed(() =>
  filteredNews.value.slice(uiStore.startIndex, uiStore.endIndex)
);

// Safer summary bounds
const resultStart = computed(() =>
  filteredNews.value.length === 0 ? 0 : uiStore.startIndex + 1
);
const resultEnd = computed(() =>
  Math.min(uiStore.endIndex, filteredNews.value.length)
);

// Reset to first page when filter changes (prevents empty pages)
watch(
  () => uiStore.filter,
  () => uiStore.setPage(1)
);

// Smooth-scroll on page change
function onPageChange(p: number) {
  uiStore.setPage(p);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>
